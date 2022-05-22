// Allow users to use old contribution reference and replace it with it's new reference
import { ImportsRefAgent } from '@flogo-web/lib-server/core';
import { ContributionType } from '@flogo-web/core';

const LEGACY_REFS = new Map<string, string>([
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/actreply',
    'github.com/TNTworks/flogo-contrib/activity/actreply',
  ],
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/actreturn',
    'github.com/TNTworks/flogo-contrib/activity/actreturn',
  ],
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/mapper',
    'github.com/TNTworks/flogo-contrib/activity/mapper',
  ],
  [
    'github.com/TIBCOSoftware/flogo-contrib/activity/subflow',
    'github.com/project-flogo/flow/activity/subflow',
  ],
]);

export class LegacyRefsDecorator implements ImportsRefAgent {
  constructor(private decoratedAgent: ImportsRefAgent) {}

  getPackageRef(contribType: ContributionType, aliasRef: string) {
    let packageRef = this.decoratedAgent.getPackageRef(contribType, aliasRef);
    if (LEGACY_REFS.has(packageRef)) {
      packageRef = LEGACY_REFS.get(packageRef);
    }
    return packageRef;
  }
}
