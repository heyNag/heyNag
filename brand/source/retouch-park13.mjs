// Owner-authorized, bounded pixel repair. No dependencies, resampling or color conversion.
// Usage: node brand/source/retouch-park13.mjs --inspect | --apply
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
const source = 'assets/brand/banner-park/park-film-study-12-materials-and-grip.png';
const target = 'assets/brand/banner-park/park-film-study-13-muse-face-cleanup.png';
const review = 'brand/reviews/2026-11-07-banner-park';
const expected = 'f43b5c7053f9fc3017c651e9ba4628a862ffbe1fd76d706f145a88f75f2e3e70';
const hash = b => createHash('sha256').update(b).digest('hex');
function decode(b) {
  if (b.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw Error('Not PNG');
  const chunks=[]; let off=8;
  while(off<b.length) { const n=b.readUInt32BE(off), type=b.toString('ascii',off+4,off+8); chunks.push({type,raw:b.subarray(off,off+n+12),data:b.subarray(off+8,off+8+n)}); off+=n+12; }
  const h=chunks[0].data, width=h.readUInt32BE(0), height=h.readUInt32BE(4);
  if(h[8]!==8 || h[9]!==2 || h[10] || h[11] || h[12]) throw Error('Expected non-interlaced RGB8 PNG');
  const filtered=inflateSync(Buffer.concat(chunks.filter(c=>c.type==='IDAT').map(c=>c.data))), stride=width*3;
  if(filtered.length!==(stride+1)*height) throw Error('Unexpected scanline length');
  const pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++) { const f=filtered[y*(stride+1)]; if(f>4)throw Error('Bad filter');
    for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=3?pixels[i-3]:0,b=y?pixels[i-stride]:0,c=y&&x>=3?pixels[i-stride-3]:0;
      pixels[i]=(filtered[y*(stride+1)+x+1]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][f])&255; }
  }
  return {width,height,pixels,chunks};
}
function crc32(buf){let crc=0xffffffff;for(const v of buf){crc^=v;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function encode(img){const stride=img.width*3,rows=Buffer.alloc((stride+1)*img.height);
  for(let y=0;y<img.height;y++)img.pixels.copy(rows,y*(stride+1)+1,y*stride,(y+1)*stride);
  const data=deflateSync(rows,{level:9}),chunk=Buffer.alloc(data.length+12);chunk.writeUInt32BE(data.length);chunk.write('IDAT',4);data.copy(chunk,8);chunk.writeUInt32BE(crc32(chunk.subarray(4,-4)),chunk.length-4);
  let emitted=false;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),...img.chunks.flatMap(c=>{if(c.type!=='IDAT')return[c.raw];if(emitted)return[];emitted=true;return[chunk];})]);
}
const original=readFileSync(source);if(hash(original)!==expected)throw Error('Source checksum mismatch');
const img=decode(original), originalPixels=Buffer.from(img.pixels);
if(process.argv[2]==='--inspect') {
  for(let y=490;y<=505;y++){const row=[];for(let x=364;x<=380;x++){const i=(y*img.width+x)*3;row.push(Math.round((img.pixels[i]+img.pixels[i+1]+img.pixels[i+2])/3).toString().padStart(3));}console.log(y,row.join(' '));}
} else if(process.argv[2]==='--apply') {
  // Bounds are reviewed before execution; exclusive right and bottom.
  const bounds={left:368,top:495,right:377,bottom:501};
  const bw=bounds.right-bounds.left,bh=bounds.bottom-bounds.top;
  // Harmonic interpolation from immediately surrounding unmarked skin.
  for(let c=0;c<3;c++){
    let a=new Float64Array((bw+2)*(bh+2)),b=new Float64Array(a.length),sw=bw+2;
    for(let y=0;y<bh+2;y++)for(let x=0;x<bw+2;x++)a[y*sw+x]=img.pixels[((bounds.top+y-1)*img.width+bounds.left+x-1)*3+c];
    for(let y=1;y<=bh;y++)for(let x=1;x<=bw;x++)a[y*sw+x]=(a[x]+a[(bh+1)*sw+x])/2;
    for(let k=0;k<800;k++){b.set(a);for(let y=1;y<=bh;y++)for(let x=1;x<=bw;x++){const i=y*sw+x;b[i]=(a[i-1]+a[i+1]+a[i-sw]+a[i+sw])/4;}[a,b]=[b,a];}
    for(let y=0;y<bh;y++)for(let x=0;x<bw;x++)img.pixels[((bounds.top+y)*img.width+bounds.left+x)*3+c]=Math.round(a[(y+1)*sw+x+1]);
  }
  const output=encode(img),decoded=decode(output);let changed=0,outside=0;const actual={left:img.width,top:img.height,right:0,bottom:0};
  for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){const i=(y*img.width+x)*3;if(!originalPixels.subarray(i,i+3).equals(decoded.pixels.subarray(i,i+3))){changed++;if(x<bounds.left||x>=bounds.right||y<bounds.top||y>=bounds.bottom)outside++;actual.left=Math.min(actual.left,x);actual.top=Math.min(actual.top,y);actual.right=Math.max(actual.right,x+1);actual.bottom=Math.max(actual.bottom,y+1);}}
  if(outside||changed===0)throw Error('Invalid edit extent');
  writeFileSync(target,output,{flag:'wx'});
  const record={asset:target,sha256:hash(output),dimensions:[img.width,img.height],source,sourceSha256:expected,mode:'Owner-authorized precise pixel retouch; Node built-ins; no generative rerender',authorization:'Use precise pixel retouching (Recommended)',purpose:'Remove only the new extra curved dark mark below Muse’s existing smile',method:'Harmonic interpolation from immediate surrounding skin within reviewed rectangle; 800 Jacobi iterations per channel; original PNG ancillary chunks retained',bounds,actualChangedBounds:actual,changedPixels:changed,pixelsOutsideBoundsChanged:outside,totalPixels:img.width*img.height,sourceCode:'brand/source/retouch-park13.mjs',preserved:'Every decoded RGB pixel outside the bounded patch is identical to version12. Existing smile/eyes/hood, all other characters, composition, materials and lighting are untouched.',status:'Unapproved candidate for fresh full18 whole-scene review'};
  writeFileSync(`${review}/film-study-13.json`,JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(record,null,2));
} else throw Error('Use --inspect or --apply');
