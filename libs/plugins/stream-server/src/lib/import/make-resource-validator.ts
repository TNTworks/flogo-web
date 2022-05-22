import { ContributionType } from '@flogo-web/core';
import {
  ImportsRefAgent,
  createValidator,
  Schemas,
  ValidationRuleFactory,
} from '@flogo-web/lib-server/core';

import { StreamSchemas } from '../schemas';

export function makeResourceValidator(
  installedRefs: string[],
  importsRefAgent: ImportsRefAgent
) {
  return createValidator(
    StreamSchemas.resource,
    {
      schemas: [StreamSchemas.data, StreamSchemas.common, Schemas.v1.common],
    },
    [
      {
        keyword: 'activity-installed',
        validate: ValidationRuleFactory.contributionInstalled(
          'activity-installed',
          'activity',
          installedRefs || [],
          ref => importsRefAgent.getPackageRef(ContributionType.Activity, ref)
        ),
      },
    ]
  );
}
