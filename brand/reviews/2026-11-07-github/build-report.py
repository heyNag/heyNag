from pathlib import Path
import html
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def esc(value):
    return html.escape(str(value), quote=True)


def read(path, default=None):
    return json.loads(path.read_text()) if path.exists() else default


profile = read(ROOT / 'brand/profile/profile.json')
consensus = read(HERE / 'consensus.json', {})
rows = []
for path in sorted((HERE / 'independent').glob('*.json')):
    item = read(path)
    vote = read(HERE / 'team-votes' / path.name, {})
    score = vote.get('score', item.get('score'))
    labels = {'agree':'Accept', 'agree_with_named_nonblocking_limits':'Accept with named limits', 'object_with_specific_evidence':'Objection — inspect evidence'}
    label = labels.get(vote.get('position'), 'Independent review recorded; pair challenge pending')
    detail_path = ('team-votes/' if vote else 'independent/') + path.name
    rows.append('<tr><th scope="row"><a href="' + esc(detail_path) + '">' + esc(path.stem.replace('-', ' ').title()) + '</a></th><td>' + esc(score if score is not None else 'Unscored') + '</td><td>' + esc(label) + '</td></tr>')

status = consensus.get('state', 'Specialist challenge in progress; no full-team acceptance claimed.')
limits = consensus.get('limits', ['The website has not been built or tested.', 'Human recognition and long-term recall have not been tested.', 'These are local GitHub previews; account changes have not been published.'])
limits_html = ''.join('<li>' + esc(x) + '</li>' for x in limits)
range_text = ''
if consensus.get('scoreRange'):
    low, high = consensus['scoreRange']
    range_text = f'<p><strong>Recorded range: {low:g}–{high:g}/10.</strong> ' + ('Every recorded scoped score is at least 9.' if consensus.get('allAtLeastNine') else 'The panel has not reached 9/10 across the board.') + '</p>'
document = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>heyNag · GitHub profile review</title>
<style>
:root{color-scheme:light dark;--bg:#f1f1ef;--ink:#1c1c1c;--muted:#555d52;--line:#ced0c8;--link:#36552d;--panel:#fff}
@media(prefers-color-scheme:dark){:root{--bg:#161d17;--ink:#f1f1ef;--muted:#b9c3b2;--line:#42503e;--link:#b6d15c;--panel:#202b21}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,sans-serif}main{width:min(1120px,calc(100% - 40px));margin:48px auto 80px}h1{font-size:clamp(32px,6vw,64px);line-height:1.1;letter-spacing:-.045em;font-weight:600;margin:20px 0}h2{font-size:26px;margin:48px 0 16px;line-height:1.2}h3{font-size:18px}p{max-width:72ch}a{color:var(--link);text-underline-offset:3px}a:focus-visible,summary:focus-visible{outline:3px solid var(--link);outline-offset:4px}p,li,td,th,code{overflow-wrap:anywhere}.eyebrow{font-size:13px;font-weight:650;text-transform:uppercase;letter-spacing:.1em}.note{color:var(--muted)}.status{border:1px solid var(--line);padding:16px 20px;border-radius:12px;background:var(--panel)}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:8px}.mobile{max-width:320px}.avatar{width:104px;height:104px;border-radius:50%}figure{margin:0}figcaption{font-size:14px;margin-top:8px;color:var(--muted)}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;vertical-align:top;border-bottom:1px solid var(--line);padding:12px 10px}th:first-child{width:25%}summary{cursor:pointer;padding:14px 0;font-weight:600}details{border-top:1px solid var(--line)}ul{padding-left:22px}code{font-size:13px}footer{margin-top:48px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:14px}@media(max-width:640px){main{width:calc(100% - 32px);margin-top:24px}.pair{grid-template-columns:1fr}th,td{padding:10px 5px;font-size:12px}h2{margin-top:36px}}
</style></head><body><main>
<div class="eyebrow">heyNag · GitHub application review</div>
<h1>A familiar first hello.</h1>
<p>The GitHub profile introduces Nag and a small public sample of the work. The future website can continue the same story with richer project details and the same expressive little moth.</p>
<p class="status"><strong>PROFILE DRAFT — live changes pending.</strong><br>''' + esc(status) + '''</p>
<p>Source, assets and review history are backed up in <a href="https://github.com/heyNag/heyNag/pull/1">draft PR #1</a>. The live profile has not been changed.</p>
<h2>The same identity in both themes</h2>
<div class="pair"><figure><img src="evidence/profile-light-1440.png" alt="Proposed GitHub profile in the light theme, with the moth avatar, heyNag header and personal introduction"><figcaption>Light · actual GitHub layout with the proposed local content.</figcaption></figure><figure><img src="evidence/profile-dark-1440.png" alt="The same proposed GitHub profile in the dark theme"><figcaption>Dark · same tiny anatomy, paired artwork.</figcaption></figure></div>
<p class="note">These captures use GitHub's Markdown renderer and its real layout with draft content inserted locally. They demonstrate presentation, not saved account settings. The profile has one universal avatar; its README header follows the viewer's color-scheme preference.</p>
<h2>What carries into heyNag.com</h2>
<table><thead><tr><th>Shared ingredient</th><th>GitHub now</th><th>Website later</th></tr></thead><tbody>
<tr><th>Person</th><td>Nagarjuna Boddu, heyNag, and “Hey, I'm Nag.”</td><td>First-person project stories and an About page.</td></tr>
<tr><th>Character</th><td>The same tiny moth in a static header and head avatar.</td><td>The existing rig, expressions and Investigate &amp; share performance.</td></tr>
<tr><th>Visual identity</th><td>Chartreuse, cream, ink and paired dark artwork.</td><td>The same palette and outlined wordmark with the shared type and spacing system.</td></tr>
<tr><th>Work</th><td>Three verified public entry points, clearly a sample.</td><td>Demos, decisions and outcomes; private stories only after deciding what can be shared.</td></tr>
<tr><th>Comfort</th><td>Static imagery and native readable links.</td><td>Purposeful interaction, quiet alternatives and no forced sound.</td></tr>
</tbody></table>
<p>This is a continuity plan. The website is not built, and its experience is not scored. See <a href="../../profile/continuity.json">the editable continuity contract</a> and <a href="../../profile/README.md">the maintenance guide</a>.</p>
<h2>Proposed account settings</h2>
<img class="avatar" src="../../../''' + esc(profile['avatar']) + '''" alt="The universal heyNag moth avatar">
<p><strong>''' + esc(profile['name']) + '''</strong><br>''' + esc(profile['bio']) + '''</p>
<p>Selected public pins: <a href="https://github.com/heyNag/charms">Charms</a>, <a href="https://github.com/heyNag/codex-pet-grok-bot">Grok Bot</a>, <a href="https://github.com/heyNag/eva-md">eva.md</a>. The website field stays empty until heyNag.com has a useful live destination.</p>
<details><summary>Phone reading evidence</summary><div class="pair"><figure><img class="mobile" src="evidence/profile-light-320-top.png" alt="Proposed profile name, avatar and opening at 320 pixels"><figcaption>320px viewport · profile opening.</figcaption></figure><figure><img class="mobile" src="evidence/readme-dark-320-scroll.png" alt="Actual scrolled dark mobile viewport with the project descriptions"><figcaption>320px viewport · reading the project sample.</figcaption></figure></div><p class="note">Five browser widths, 320–1440px, in both themes. Emulation does not establish physical-device or screen-reader behavior.</p></details>
<h2>Specialist challenge</h2>
<p>Two reviewers in each of nine disciplines. Scores apply to the prepared GitHub application in the reviewer's own discipline. They are AI craft judgments with named limits, not human audience research.</p>
''' + range_text + '''<table><thead><tr><th>Reviewer</th><th>Score / 10</th><th>Position</th></tr></thead><tbody>''' + ''.join(rows) + '''</tbody></table>
<p><a href="consensus.json">Decision record</a> · <a href="team-proposal-v2.json">Shared proposal</a> · <a href="review-source-v2.json">Reviewed source manifest</a> · <a href="evidence/render-checks.json">Rendering checks</a></p>
<h2>What remains unproven</h2><ul>''' + limits_html + '''</ul>
<footer>Current assets and editable source stay in heyNag/heyNag. The future heyNag/heynag.com repository will record the source commit and manifest when it adopts them. No separate mascot, palette or personality to drift apart.</footer>
</main></body></html>'''
(HERE / 'index.html').write_text(document)
print(f'Built {HERE / "index.html"} with {len(rows)} independent positions.')
