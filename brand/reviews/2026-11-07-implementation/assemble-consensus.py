#!/usr/bin/env python3
"""Validate explicit individual votes before recording agreement."""
from pathlib import Path
import hashlib
import json

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
roles=('brand','performance','identity','rigging','interaction','audience','storyboard','visual','sound')
pending=[f'{role}-{side}' for role in roles for side in ('a','b') if not (HERE/f'team-votes/{role}-{side}.json').exists()]
if pending:
    raise SystemExit('Final agreement is pending individual votes: '+', '.join(pending))
load=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
proposal=HERE/'team-proposal-v2.json'
proposal_hash=sha(proposal)
scope=load(proposal)
source=HERE/scope['sourceManifest']
assert sha(source)==scope['sourceManifestSha256'], 'Source manifest changed'
for name,digest in load(source)['files'].items():
    assert sha(ROOT/name)==digest, f'Implementation changed: {name}'
votes={}
for role in roles:
    for side in ('a','b'):
        key=f'{role}-{side}'
        v=load(HERE/f'team-votes/{key}.json')
        assert v['proposalSha256']==proposal_hash, f'{key}: wrong proposal'
        assert v['sourceManifestSha256']==sha(source), f'{key}: wrong source'
        assert v['model']=='gpt-6-astra', f'{key}: model not recorded'
        assert 'ultra' in v['reasoning'], f'{key}: reasoning not recorded'
        assert v['decision'] in ('agree','agree_with_named_nonblocking_limits'), f'{key}: unresolved objection'
        assert not v['substantiveObjections'], f'{key}: substantive objection'
        assert v['pairRecommendationConfirmed'] is True, f'{key}: pair not confirmed'
        assert v['skillsMessageAcknowledged'], f'{key}: skill message not acknowledged'
        discussion=load(HERE/f'pairs/{key}-discussion.json')
        assert discussion, f'{key}: no discussion'
        assert discussion['acceptedJointRecommendation']==scope['pairRecommendations'][role], f'{key}: pair recommendation differs'
        independent=load(HERE/f'independent/{key}.json')
        for field in ('skillsReviewed','workflowChanges','rulesNotApplicableWithReason'):
            assert independent.get(field), f'{key}: missing {field}'
        votes[key]={'decision':v['decision'],'record':f'team-votes/{key}.json','personalScore':v['personalScore']}

pairs=[]
for role in roles:
    d={'discipline':role,'state':'Both reviewers explicitly confirmed the same scoped recommendation.',
       'recommendation':scope['pairRecommendations'][role],
       'discussionRecords':[f'pairs/{role}-a-discussion.json',f'pairs/{role}-b-discussion.json'],
       'independentReviews':[f'independent/{role}-a.json',f'independent/{role}-b.json'],
       'explicitConfirmations':[f'team-votes/{role}-a.json',f'team-votes/{role}-b.json'],
       'proposal':'team-proposal-v2.json','proposalSha256':proposal_hash,
       'scorePolicy':'Individual scores remain separate; acceptance does not imply a 9/10 rating.'}
    (HERE/f'pairs/{role}-resolution.json').write_text(json.dumps(d,indent=2)+'\n')
    pairs.append(d)
result={'status':'All 18 specialists accept the implemented local foundation with named limits. The 9/10 target has not been reached across the board.',
        'scope':scope['proposedDecision'],'specialists':18,'disciplines':9,'independentReviews':18,'pairedDiscussions':9,'teamVotes':18,
        'model':'gpt-6-astra','reasoning':'ultra','proposal':'team-proposal-v2.json','proposalSha256':proposal_hash,
        'sourceManifest':scope['sourceManifest'],'sourceManifestSha256':sha(source),'substantiveObjectionsRemaining':0,
        'humanResearchPerformed':False,'physicalPhoneValidation':False,'published':False,
        'skillsCatalogEntries':17,'specialistsWithSkillIntakeRecords':18,'pairs':pairs,'votes':votes,
        'unresolvedCraft':scope['unresolvedCraft'],'validationLimits':scope['validationLimits']}
(HERE/'consensus.json').write_text(json.dumps(result,indent=2)+'\n')
print('Validated 18 individual votes, nine paired recommendations and unchanged v4 implementation.')
