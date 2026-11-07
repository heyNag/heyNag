from pathlib import Path
import hashlib
import json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ROLES = ['brand', 'performance', 'identity', 'rigging', 'interaction', 'audience', 'storyboard', 'visual', 'sound']
ACCEPT = {'agree', 'agree_with_named_nonblocking_limits'}


def read(path):
    return json.loads(path.read_text())


def write(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


proposal_path = HERE / 'team-proposal-v2.json'
source_path = HERE / 'review-source-v2.json'
proposal_sha = digest(proposal_path)
source_sha = digest(source_path)
for item in read(source_path)['files']:
    if digest(ROOT / item['path']) != item['sha256']:
        raise ValueError('Changed review source: ' + item['path'])

positions = []
pairs = []
for role in ROLES:
    members = []
    for suffix in ['a', 'b']:
        reviewer = role + '-' + suffix
        independent = read(HERE / 'independent' / (reviewer + '.json'))
        vote = read(HERE / 'team-votes' / (reviewer + '.json'))
        assert vote['reviewerId'] == reviewer
        assert vote['proposalSha256'] == proposal_sha
        assert vote['sourceManifestSha256'] == source_sha
        assert vote['position'] in ACCEPT | {'object_with_specific_evidence'}
        assert vote['partnerChallenge']['sharedRecommendationAccepted'] in [True, False]
        assert vote['inspectedUpdatedEvidence'], reviewer + ' has no updated evidence'
        score = vote['score']
        assert score is None or isinstance(score, (float, int)) and 0 <= score <= 10
        assert vote['scoreMeaning'] and vote['confidence']
        members.append(vote)
        positions.append({'reviewerId':reviewer,'initialScore':independent['score'],'score':score,'position':vote['position'],'record':'team-votes/' + reviewer + '.json'})
    accepted = all(v['position'] in ACCEPT and v['partnerChallenge']['sharedRecommendationAccepted'] and not v['partnerChallenge'].get('remainingObjections', []) for v in members)
    pair = {'discipline':role,'proposalSha256':proposal_sha,'sourceManifestSha256':source_sha,'bothExplicitlyAccept':accepted,'recommendation':read(proposal_path)['pairRecommendations'][role],'individualPositions':members}
    write(HERE / 'pairs' / (role + '-resolution.json'), pair)
    pairs.append({'discipline':role,'bothExplicitlyAccept':accepted,'record':'pairs/' + role + '-resolution.json'})

accepted = all(p['bothExplicitlyAccept'] for p in pairs)
scores = [p['score'] for p in positions if p['score'] is not None]
result = {
    'scope':'Prepared GitHub profile application and continuity contract for the future website. Neither publication nor a built website is certified.',
    'state':'All 18 specialists accept the prepared GitHub application and website continuity contract with named limits.' if accepted else 'Full-team acceptance not established; inspect individual objections.',
    'accepted':accepted,'specialists':18,'disciplines':9,'modelPreference':'GPT-6 Astra / ultra; standing configured agents reused.',
    'proposalSha256':proposal_sha,'sourceManifestSha256':source_sha,
    'scoreRange':[min(scores),max(scores)] if scores else None,
    'allAtLeastNine':len(scores)==18 and all(s>=9 for s in scores),
    'positions':positions,'pairs':pairs,
    'limits':read(proposal_path)['limits'],
    'publication':'Prepared locally, not applied to live profile.',
}
write(HERE / 'consensus.json', result)
print(json.dumps({'accepted':accepted,'positions':len(positions),'pairs':len(pairs),'scoreRange':result['scoreRange'],'allAtLeastNine':result['allAtLeastNine']}, indent=2))
