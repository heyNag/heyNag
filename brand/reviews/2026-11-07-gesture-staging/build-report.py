#!/usr/bin/env python3
"""Build the local review from preserved specialist records, without rewriting scores."""
from pathlib import Path
import html
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
esc = lambda s: html.escape(str(s))
def read(path, default=None):
    p = HERE / path
    return json.loads(p.read_text()) if p.exists() else default
def prose(value):
    if isinstance(value, str): return value
    if isinstance(value, list): return ' '.join(prose(x) for x in value)
    if isinstance(value, dict):
        for key in ('claim','finding','observation','basis','meaning','summary'):
            if key in value: return prose(value[key])
        return '; '.join(f'{k}: {prose(v)}' for k,v in value.items())
    return str(value)
def score(d):
    s=d.get('score')
    if isinstance(s,dict): s=s.get('value',s.get('outOf10'))
    return f'{s:g}/10' if isinstance(s,(int,float)) else 'Not scored'
def link(path,label): return f'<a href="{esc(path)}">{esc(label)}</a>'
def ul(values): return '<ul>'+''.join('<li>'+esc(prose(v))+'</li>' for v in values)+'</ul>'

team=json.loads((ROOT/'brand/team.json').read_text())['team']
reviews={p.stem:json.loads(p.read_text()) for p in (HERE/'independent').glob('*.json')}
consensus=read('consensus.json',{})
done=consensus.get('teamVotes',0)==18
headline='A little more to say.'
state=consensus.get('status',f'{len(reviews)} of 18 independent reviews recorded. Pair discussions and final votes are pending.')
rows=[];details=[]
for role in team:
    cells=[];parts=[]
    for side in ('a','b'):
        key=f"{role['id']}-{side}";d=reviews.get(key)
        vote=read(f'team-votes/{key}.json')
        current={'score':vote['personalScore']} if vote else d
        cells.append(esc(score(current)) if current else 'Pending')
        if not d: continue
        meaning=vote.get('scoreMeaning','') if vote else d.get('scoreMeaning',d.get('score',{}).get('meaning','') if isinstance(d.get('score'),dict) else '')
        parts.append(f'<h3>Reviewer {side.upper()} · {esc(score(current))}</h3><p>{esc(prose(meaning))}</p>')
        items=vote.get('namedLimits',[]) if vote else d.get('deductions',[])
        if isinstance(items,dict): items=[{k:v} for k,v in items.items()]
        if isinstance(items,str): items=[items]
        parts.append(ul(items))
        parts.append('<p>'+link(f'independent/{key}.json','Original independent review')+'</p>')
        if (HERE/f'team-votes/{key}.json').exists(): parts.append('<p>'+link(f'team-votes/{key}.json','Final individual position')+'</p>')
        if (HERE/f'pairs/{key}-discussion.json').exists(): parts.append('<p>'+link(f'pairs/{key}-discussion.json','Partner challenge and response')+'</p>')
    rows.append('<tr><th scope="row">'+esc(role['role'])+'</th><td>'+cells[0]+'</td><td>'+cells[1]+'</td></tr>')
    pairpath=f"pairs/{role['id']}-resolution.json"
    if (HERE/pairpath).exists(): parts.append('<p>'+link(pairpath,'Pair discussion and shared recommendation')+'</p>')
    details.append('<details><summary>'+esc(role['role'])+'</summary>'+''.join(parts)+'</details>')
skills=read('implementation/interaction-skills.json',{}).get('findingsTable',[])
skillrows=''.join('<tr>'+''.join('<td>'+esc(row[k])+'</td>' for k in ('before','after','why'))+'</tr>' for row in skills)
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>heyNag — hands, attention and specialist review</title><style>
@font-face{font-family:Schibsted;src:url('../../fonts/SchibstedGrotesk-Regular.ttf')}@font-face{font-family:Schibsted;src:url('../../fonts/SchibstedGrotesk-Medium.ttf');font-weight:500}
*{box-sizing:border-box}html{color-scheme:light}body{margin:0;background:#f2f3ee;color:#292e28;font:16px/1.65 Schibsted,system-ui,sans-serif}a{color:inherit;text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #66833b;outline-offset:5px}nav,main,footer{width:min(1100px,calc(100% - 40px));margin:auto}nav{display:flex;justify-content:space-between;gap:24px;padding:30px 0;border-bottom:1px solid #c9cebe}.mark{font-size:26px;font-weight:500;letter-spacing:-1.3px;text-decoration:none}.mark span{color:#789338}.eyebrow{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#526346}header{padding:72px 0 52px;max-width:850px}h1{font-size:clamp(36px,5.5vw,66px);line-height:1.08;letter-spacing:-.055em;margin:18px 0 26px;font-weight:500}h2{font-size:30px;line-height:1.2;letter-spacing:-.035em;margin:0 0 24px;font-weight:500}h3{font-size:19px;line-height:1.35;margin:28px 0 12px}p{max-width:78ch}p,li{overflow-wrap:anywhere}section{padding:48px 0;border-top:1px solid #c9cebe}.lede{font-size:21px;line-height:1.5}.actions{display:flex;gap:12px;flex-wrap:wrap;margin:28px 0}.actions a{padding:12px 18px;border:1px solid #89977b;border-radius:8px;text-decoration:none}.actions a:first-child{background:#38552f;color:#fbfcf8;border-color:#38552f}img,video{display:block;width:100%;height:auto;border-radius:10px;margin:26px 0;background:#e8eddd}video{aspect-ratio:1.6}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left;margin:28px 0}th,td{padding:15px 14px;border-bottom:1px solid #c9cebe;vertical-align:top}thead th{font-size:13px;color:#526346}tbody th{font-weight:400}td{min-width:100px}.skills td{min-width:220px;width:33%}details{border-bottom:1px solid #c9cebe;padding:20px 0}summary{font-weight:500;cursor:pointer}li{margin:9px 0}footer{padding:48px 0;font-size:13px;color:#526346}.note{padding-left:18px;border-left:3px solid #9daf76}.phone-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));max-width:680px;gap:24px}.phone-pair img{margin:0}.small{font-size:14px;color:#526346}@media(max-width:600px){nav,main,footer{width:calc(100% - 32px)}nav{align-items:center;font-size:13px}header{padding:48px 0 36px}.lede{font-size:18px}section{padding:36px 0}h2{font-size:26px}th,td{padding:12px 8px}.phone-pair{gap:12px}summary{line-height:1.4}}@media(hover:hover) and (pointer:fine){a:hover{color:#5b713f}.actions a:first-child:hover{color:white;background:#2d4726}}
</style></head><body><nav><a class="mark" href="../../animation-v5/signature.html">heyNag<span>.</span></a><a href="../../animation-v5/index.html">Open the motion studio ↗</a></nav><main>'''
page+=f'<header><p class="eyebrow">Nag / Hands, attention and character / 7 November 2026</p><h1>{headline}</h1><p class="lede">A tiny offering hand. A glance that finds the question. The same innocent moth, in daylight and after dark.</p><p>{esc(state)}</p><div class="actions">'+link('../../animation-v5/signature.html','Try Investigate & share')+link('evidence/comparison.html','Compare the performances')+'</div></header>'
page+='''<section><h2>The gesture comes after the thought.</h2><p>The moth looks back at you before turning its little mitten upward. The wrist opens away from the ruff over the existing beat; the body, arm length and hand shape stay exactly the same.</p><img src="evidence/offer-sequence-day.png" alt="Successive daylight poses: reading, returning attention, then opening a tiny offering hand"><p>Thinking keeps its chin contact and lowers the free hand. Focused rests both hands lower. Grateful retains a small joined clasp; Shy uses a lower, asymmetric pair; Worried separates the hands diagonally. These are changes to posing, not a larger or older character.</p><img src="evidence/hands-night.png" alt="Six before and after hand poses in dark mode"></section>'''
page+='''<section><h2>Look where the question is.</h2><p>On phones the question sits above the moth. Its eyes now lead upward, with a small head response following. The reading glance keeps a little movement, then returns to you before the hand opens. On wide layouts the question remains beside it.</p><div class="phone-pair"><figure style="margin:0"><img src="evidence/baseline-attention-390-day.png" alt="Before: lateral reading glance below a stacked question"><figcaption>Before · phone reading pose</figcaption></figure><figure style="margin:0"><img src="evidence/attention-390-day-790.png" alt="Updated: small upward gaze and head response toward the question"><figcaption>Updated · same tiny anatomy</figcaption></figure></div><p>The layout is measured when it changes. A paused pose stays still during resize; playback eases toward a new direction. Light and dark share the same pose. The original Curious performance remains unchanged.</p><div class="actions">'''+link('../../animation-v5/signature.html','Play the responsive study')+'''</div></section>'''
page+='''<section><h2>The whole collection.</h2><video controls playsinline preload="metadata" aria-label="Current 24 moth emotions in matching light and dark"><source src="../../../assets/brand/preview/heynag-v5-gesture-emotions.mp4" type="video/mp4"></video><p>The refreshed film uses the current source for all 24 feelings. The three separate studies remain available in the studio. The focused comparison includes both themes and the measured phone-attention direction in a simplified composition.</p><p>These are deterministic 30fps engine exports. They show the authored movement; they do not measure physical-phone performance or establish how unfamiliar visitors interpret it.</p><div class="actions">'''+link('../../animation-v5/index.html','Explore all 24 feelings')+link('evidence/comparison.mp4','Watch the focused comparison')+'</div></section>'
page+='<section><h2>Eighteen opinions, with reasons.</h2><p>Two specialists in each discipline independently reviewed the artwork and implementation, then challenged their partner. All use GPT-6 Astra with ultra reasoning. Each score keeps the same overall local-foundation lens as the prior review; it is an editorial judgment, not an audience result. The target of 9 does not determine the verdict.</p><div class="table-wrap"><table><thead><tr><th>Specialty</th><th>Reviewer A</th><th>Reviewer B</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'+''.join(details)+'</section>'
page+='''<section><h2>What the checks establish.</h2><p>Twenty-three motion and staging tests pass. At six viewport widths, 108 browser pose cases preserve matching light/dark values, the authored return and the original Curious control. The character renderer is byte-for-byte identical to the previous version. No horizontal overflow was found in those study checks.</p><p>The installed design and animation skills inform lead/support timing, quiet holds, cached layout measurement, interrupted transitions and reduced motion. The artists retain intentional chin and clasp contact. Character acting keeps its own rhythm; interface timing rules apply to the controls.</p><p>Small-size gesture specificity, supported night-avatar sizes, a deeper verified personal project story and the tall phone composition still deserve attention. Continuous motion perception, physical phones, spoken assistive technology and unfamiliar visitors’ emotional response are separate validation needs. No publication or deployment is included.</p><p>'''+link('review-source-v1.json','Frozen source')+' · '+link('evidence/all-tests.txt','23 test results')+' · '+link('evidence/browser-checks.json','Responsive and continuity checks')+' · '+link('../../workflow.json','Shared skill workflow')+' · '+link('../2026-11-07-implementation/index.html','Previous review')+'</p></section>'
if consensus:
    page+='<section><h2>The next honest step.</h2>'+ul(consensus.get('unresolvedCraft',[]))+'</section>'
page+='</main><footer>heyNag · Nag / Nagarjuna Boddu<br>Editable source, frozen controls, evidence and individual review records stay in this repository.</footer></body></html>'
(HERE/'index.html').write_text(page)
print(f'Built review: {len(reviews)}/18 independent records; {consensus.get("teamVotes",0)}/18 final votes.')
