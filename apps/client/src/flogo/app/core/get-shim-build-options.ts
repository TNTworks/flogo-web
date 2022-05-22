import { ContributionSchema, CONTRIB_REFS } from '@flogo-web/core';

export interface ShimBuildOptions {
  labelKey: string;
  ref: string;
}

export function getShimBuildOptions(
  shimmableTriggerDetail: ContributionSchema
): ShimBuildOptions {
  switch (shimmableTriggerDetail.ref) {
    case CONTRIB_REFS.LAMBDA:
      return {
        labelKey: 'TRIGGER-SHIM:SERVERLESS-APP',
        ref: shimmableTriggerDetail.ref,
      };
    case CONTRIB_REFS.CLI:
      return {
        labelKey: 'TRIGGER-SHIM:CLI-APP',
        ref: shimmableTriggerDetail.ref,
      };
    default:
      return {
        labelKey: shimmableTriggerDetail.name,
        ref: shimmableTriggerDetail.ref,
      };
  }
}
