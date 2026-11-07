from pathlib import Path
import json

base = Path(__file__).resolve().parent
labels = {
    'brand': '01 · Character brand direction',
    'performance': '02 · Character performance and pantomime',
    'identity': '03 · Identity systems and small applications',
    'rigging': '04 · Technical animation and rigging',
    'interaction': '05 · Interaction and accessibility',
    'audience': '06 · Audience perception and research',
    'storyboard': '07 · Storyboarding, animatics and comic staging',
    'visual': '08 · Visual development, environment and lighting',
    'sound': '09 · Sound design and silence',
}
reviews = []
for key, label in labels.items():
    first = json.loads((base / 'round1' / (key + '.json')).read_text())
    second = json.loads((base / 'round2' / (key + '.json')).read_text())
    assert len(second['challenges']) >= 2, key
    for c in second['challenges']:
        for field in ['claimId', 'decision', 'reason', 'implication']:
            assert field in c, (key, field)
    reviews.append(dict(key=key, label=label, first=first, second=second))

decisions = [
    dict(title='A release condition belongs to the affected application.',
         resolution='Brand direction challenged the initial broad “before public use” labels. The panel narrowed them: the dark-edge fix belongs to night exports, avatar framing to small circles, the keyboard fix to the interactive studio, and the smile correction to stories using that transition. A static GitHub change need not wait for a website, sound or 24 perfected performances.',
         basis='Brand ↔ identity ↔ rigging ↔ performance ↔ interaction. The observed defects remain; their scope changed.'),
    dict(title='Clearer hands do not require longer arms.',
         resolution='Storyboarding saw too many mitten gestures bunching beneath the ruff. Rigging and identity agreed to test negative space and head-to-hand contact using the existing controls first. No reviewed evidence warrants a taller body, larger hands or a wholesale rebuild.',
         basis='Storyboard ↔ rigging ↔ performance ↔ identity. The proposed remedy became a pose experiment.'),
    dict(title='Four wing panels do not need four visible outlines in every pose.',
         resolution='The construction should stay consistent, while overlap can express protective closure. Opening scared wings merely to show all four panels would weaken the acting. The existing independent hinges are adequate for these reactions; flight and turns would be separate capabilities.',
         basis='Rigging ↔ storyboard ↔ performance. Silhouette and intention take priority over an anatomical inventory.'),
    dict(title='A family of feelings is useful; exact label decoding is not the goal.',
         resolution='Audience review challenged the inference that similar held poses automatically need redesign. Context can distinguish thought from focus, or gratitude from shyness. Test the intention a real scene needs, accept reasonable descriptions, and keep the full library available.',
         basis='Audience ↔ performance ↔ storyboard. Emotion similarity was narrowed to a research question.'),
    dict(title='Preserve prominence; prove attribution through the whole application.',
         resolution='The fresh README proof already gives heyNag and first-person authorship clear prominence. No evidence supports shrinking the moth or hiding it in a separate playground by default. Test whether people remember Nag and his real work before prescribing page architecture.',
         basis='Brand ↔ audience ↔ interaction. A mascot-versus-wordmark experiment is reserved for an actual unresolved question.'),
    dict(title='Silence is complete. Sound must earn a specific role.',
         resolution='Sound direction proposed a small optional material study. Storyboarding challenged automatic paper-like wing Foley because the moth’s material is not established by its color. Visual cause should come first; any later audio needs an independent opt-in and must not imitate a system notification.',
         basis='Sound ↔ storyboard ↔ interaction. No audio is needed to finish the current identity.'),
]

data = dict(date='2026-11-07', objective='Adversarial audit of existing heyNag work', decisions=decisions, reviews=reviews)
(base / 'report.json').write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
template = (base / 'report-template.html').read_text()
payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
(base / 'index.html').write_text(template.replace('__AUDIT_DATA__', payload))
print(json.dumps({'reviews': len(reviews), 'crossReviewChallenges': sum(len(r['second']['challenges']) for r in reviews), 'report': str(base / 'index.html')}))
