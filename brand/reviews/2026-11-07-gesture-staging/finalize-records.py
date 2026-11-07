#!/usr/bin/env python3
"""Update durable pointers only after all individual positions are validated."""
from pathlib import Path
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
load = lambda p: json.loads(p.read_text())
save = lambda p, d: p.write_text(json.dumps(d, indent=2) + '\n')
consensus = load(HERE / 'consensus.json')
assert consensus['teamVotes'] == 18
assert consensus['substantiveObjectionsRemaining'] == 0
relative = str(HERE.relative_to(ROOT))
team_path = ROOT / 'brand/team.json'
team = load(team_path)
for role in team['team']:
    role['gestureIndependentReviews'] = []
    role['gesturePairResolution'] = f"{relative}/pairs/{role['id']}-resolution.json"
    for reviewer in role['reviewers']:
        key = role['id'] + '-' + reviewer['id'].lower()
        reviewer['gestureAgent'] = reviewer['implementationAgent']
        reviewer['gestureReview'] = f'{relative}/independent/{key}.json'
        reviewer['gestureDiscussion'] = f'{relative}/pairs/{key}-discussion.json'
        reviewer['gestureVote'] = f'{relative}/team-votes/{key}.json'
        reviewer['gestureStatus'] = 'Fresh independent review, partner challenge and explicit individual vote complete.'
        role['gestureIndependentReviews'].append(reviewer['gestureReview'])
record = f'{relative}/index.html'
if record not in team['records']:
    team['records'].append(record)
team['latestConsensus'] = {
    'record': f'{relative}/consensus.json', 'scope': consensus['scope'],
    'state': consensus['status'], 'specialists': 18,
    'proposalSha256': consensus['proposalSha256'],
    'sourceManifestSha256': consensus['sourceManifestSha256']
}
team['currentImplementationReview'] = {
    'record': record, 'sourceManifest': f'{relative}/review-source-v1.json',
    'state': consensus['status']
}
save(team_path, team)
source_path = ROOT / 'brand/source/animation-v5.json'
source = load(source_path)
source['status'] = consensus['status'] + ' Local study; no publication or deployment.'
source['gestureConsensus'] = f'{relative}/consensus.json'
save(source_path, source)
print('Updated standing team and source pointers; prior reviews preserved.')
