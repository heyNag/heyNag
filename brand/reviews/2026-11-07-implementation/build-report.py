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
headline='The work, and the honest verdict.' if done else 'The work, under review.'
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
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>heyNag — implementation and specialist review</title><style>
@font-face{font-family:Schibsted;src:url('../../fonts/SchibstedGrotesk-Regular.ttf')}@font-face{font-family:Schibsted;src:url('../../fonts/SchibstedGrotesk-Medium.ttf');font-weight:500}
*{box-sizing:border-box}html{color-scheme:light}body{margin:0;background:#f2f3ee;color:#292e28;font:16px/1.65 Schibsted,system-ui,sans-serif}a{color:inherit;text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid #66833b;outline-offset:5px}nav,main,footer{width:min(1100px,calc(100% - 40px));margin:auto}nav{display:flex;justify-content:space-between;gap:24px;padding:30px 0;border-bottom:1px solid #c9cebe}.mark{font-size:26px;font-weight:500;letter-spacing:-1.3px;text-decoration:none}.mark span{color:#789338}.eyebrow{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#526346}header{padding:72px 0 52px;max-width:850px}h1{font-size:clamp(36px,5.5vw,66px);line-height:1.08;letter-spacing:-.055em;margin:18px 0 26px;font-weight:500}h2{font-size:30px;line-height:1.2;letter-spacing:-.035em;margin:0 0 24px;font-weight:500}h3{font-size:19px;line-height:1.35;margin:28px 0 12px}p{max-width:78ch}section{padding:48px 0;border-top:1px solid #c9cebe}.lede{font-size:21px;line-height:1.5}.actions{display:flex;gap:12px;flex-wrap:wrap;margin:28px 0}.actions a{padding:12px 18px;border:1px solid #89977b;border-radius:8px;text-decoration:none}.actions a:first-child{background:#38552f;color:#fbfcf8;border-color:#38552f}img,video{display:block;width:100%;height:auto;border-radius:10px;margin:26px 0;background:#e8eddd}video{aspect-ratio:1.6}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left;margin:28px 0}th,td{padding:15px 14px;border-bottom:1px solid #c9cebe;vertical-align:top}thead th{font-size:13px;color:#526346}tbody th{font-weight:400}td{min-width:100px}.skills td{min-width:220px;width:33%}details{border-bottom:1px solid #c9cebe;padding:20px 0}summary{font-weight:500;cursor:pointer}li{margin:9px 0}footer{padding:48px 0;font-size:13px;color:#526346}.note{padding-left:18px;border-left:3px solid #9daf76}.phone-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));max-width:680px;gap:24px}.phone-pair img{margin:0}.small{font-size:14px;color:#526346}@media(max-width:600px){nav,main,footer{width:calc(100% - 32px)}nav{align-items:center;font-size:13px}header{padding:48px 0 36px}.lede{font-size:18px}section{padding:36px 0}h2{font-size:26px}th,td{padding:12px 8px}.phone-pair{gap:12px}summary{line-height:1.4}}@media(hover:hover) and (pointer:fine){a:hover{color:#5b713f}.actions a:first-child:hover{color:white;background:#2d4726}}
</style></head><body><nav><a class="mark" href="../../animation-v5/signature.html">heyNag<span>.</span></a><a href="../../animation-v5/index.html">Open the motion studio ↗</a></nav><main>'''
page+=f'<header><p class="eyebrow">Nag / Character and motion / 7 November 2026</p><h1>{headline}</h1><p class="lede">A warmer curiosity performance, quieter night lighting and more room for tiny gestures. The same innocent moth in both themes.</p><p>{esc(state)}</p><div class="actions">'+link('../../animation-v5/signature.html','Try Investigate & share')+link('../../animation-v5/index.html','Explore all 24 feelings')+'</div></header>'
page+='''<section><h2>The changes you can see.</h2><p>Nag chose <strong>Investigate & share</strong>: notice the question, look closer, pause, then turn back with a tiny presenting mitten. The question connects the character to the real eva.md project. “One more thought” remains a restrained alternative.</p><video controls playsinline preload="metadata" aria-label="All 24 updated moth emotions in light and dark"><source src="../../../assets/brand/preview/heynag-v5-current-emotions.mp4" type="video/mp4"></video><p>The full collection remains 24 emotions. Three separate studies preserve the comparison: warm curiosity, a wry afterthought, and one mischievous peek. Surprise starts with the face before the wings; the excited hop now cushions after contact.</p><p>The night paint uses a quieter antenna highlight and softer broad shading. Head, body, hands, feet, wing shapes and numeric poses are shared across themes. The original raster references remain untouched.</p></section>'''
page+='''<section><h2>A small character needs space.</h2><p>The phone study now puts the question above and to the right of the moth. The existing figure gets more room, with a taller composition as the tradeoff. A 320px heading-wrap fix keeps the introduction readable. The authored sideways glance is less precisely aligned with the question in this stacked composition; that remains a staging refinement.</p><div class="phone-pair"><img src="evidence/signature-final-390-stage.png" alt="Final light-mode phone staging with the question above the tiny moth"><img src="evidence/signature-final-390-night.png" alt="The same staging and character geometry in dark mode"></div><p>Small hand-and-ruff details remain a craft limitation at 96–128px. Use the day avatar as the universal small mark; the night variant needs more room. Neither sharper lighting nor larger anatomy substitutes for clear staging.</p></section>'''
page+='''<section><h2>The skills now inform the workflow.</h2><p>The entire panel and engineering team were asked to review all 17 installed Emil Kowalski skill descriptions and read the relevant skills in full. Each review records actual reading, practical changes and exceptions. This practice is preserved in the repository for the future website.</p><div class="table-wrap"><table class="skills"><thead><tr><th>Before</th><th>After</th><th>Why</th></tr></thead><tbody>'''+skillrows+'''</tbody></table></div><p>Character performances keep their own acting rhythm. Short UI budgets apply to controls; keyboard Play still plays the requested content. Expressive SVG morphs need measured evaluation, not an automatic replacement with generic transforms.</p><p>'''+link('../../workflow.json','Shared workflow and skill routing')+' · '+link('installed-skills.json','Installed catalog')+'</p></section>'
page+='<section><h2>Honest scores, with their meaning.</h2><p>These are scoped judgments from AI specialist agents, all configured as GPT-6 Astra with ultra reasoning. They are not audience research. Different scopes should not be averaged into one product score, and a target of 9 does not change a reviewer’s number.</p><div class="table-wrap"><table><thead><tr><th>Specialty</th><th>Reviewer A</th><th>Reviewer B</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'+''.join(details)+'</section>'
page+='''<section><h2>Evidence and its limits.</h2><p>Fifteen motion tests pass. The browser geometry comparison checked 567 poses with no geometry mismatches across the frozen rig, day and night. Current avatar/header exports and two deterministic 30fps films are preserved alongside editable source.</p><p>The focused active-playback sample averaged about 34ms between frames, with four gaps above 50ms and a 67ms maximum. Earlier mixed idle/playback samples included roughly one-second gaps. The active-only sample narrows that observation; it does not certify 60fps or physical-phone performance.</p><p>Normal-speed perception, native menu keyboard commit, spoken screen-reader output, physical-phone behavior and unfamiliar visitors’ emotional response remain separate validation needs. Frame sheets alone do not prove continuous motion feel. No audience recall or attachment result has been invented.</p><div class="actions">'''+link('evidence/comparison.html','Compare before and after')+link('evidence/comparison.mp4','Play the comparison film')+'</div><p>'+link('review-source-v4.json','Frozen implementation source')+' · '+link('evidence/motion-tests.txt','Motion checks')+' · '+link('evidence/geometry.json','Geometry evidence')+' · '+link('evidence/description-and-reduced-motion.json','Accessible descriptions and reduced motion')+'</p><img src="evidence/all-final.png" alt="Twenty-four emotion stills, each with matching light and dark versions"></section>'
page+='''<section><h2>What remains before 9.</h2><p>The strongest next craft question is the mitten silhouette: can the sharing gesture become more specific through pose and timing while keeping these tiny proportions? Supported small night applications need careful optical judgment. A real project story should carry a decision and a result, once verified material exists.</p><p>Those improvements need fresh evidence. The broader website, seasonal scenes and optional audio remain future work; this local study is the reusable foundation. Nothing has been published or deployed from this review.</p></section></main><footer>heyNag · Nag / Nagarjuna Boddu<br>Editable character, motion, evidence and review records stay in this repository. Specialist roles persist in the roster; agent runtime availability can change.</footer></body></html>'''
(HERE/'index.html').write_text(page)
print(f'Built review: {len(reviews)}/18 independent records; {consensus.get("teamVotes",0)}/18 final votes.')
