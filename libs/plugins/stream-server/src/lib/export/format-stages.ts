import { StreamResourceModel, StreamData } from '@flogo-web/plugins/stream-core';
import {
  ExportRefAgent,
  transformConnectionTypeSettings,
} from '@flogo-web/lib-server/core';
import {
  ActivitySchema,
  ContributionSchema,
  ContributionType,
  MapperUtils,
} from '@flogo-web/core';
import { pick, uniq, isEmpty } from 'lodash';

const extractFunctions = mappings =>
  MapperUtils.functions.parseAndExtractReferencesInMappings(mappings);
const MAPPING_PROPERTIES = ['inputMappings', 'output', 'activitySettings'];

export function formatStages(
  streamData: Partial<StreamData>,
  contributions: Map<string, ContributionSchema>,
  refAgent: ExportRefAgent
): StreamResourceModel.Stage[] {
  const { stages } = streamData;
  return (stages || []).map(stage => {
    /* Registering any functions used in the mappings */
    const allFunctionsUsed = MAPPING_PROPERTIES.reduce(
      (allFns, prop) => allFns.concat(extractFunctions(stage[prop] || {})),
      []
    );
    uniq(allFunctionsUsed).forEach(functionName =>
      refAgent.registerFunctionName(functionName)
    );
    const formattedStage = {
      ...pick(stage, ['name', 'description']),
      ref: refAgent.getAliasRef(ContributionType.Activity, stage.ref),
      input: !isEmpty(stage.inputMappings) ? stage.inputMappings : undefined,
      settings: !isEmpty(stage.activitySettings) ? stage.activitySettings : undefined,
      output: !isEmpty(stage.output) ? stage.output : undefined,
    };
    if (formattedStage.settings) {
      const activitySettingsSchema = (<ActivitySchema>contributions.get(stage.ref))
        ?.settings;
      formattedStage.settings = transformConnectionTypeSettings(
        formattedStage.settings,
        activitySettingsSchema,
        refAgent,
        false
      );
    }
    return formattedStage;
  });
}
