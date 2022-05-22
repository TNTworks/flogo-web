import {
  Resource,
  ContributionType,
  ContributionSchema,
  ActivitySchema,
} from '@flogo-web/core';
import {
  StreamData,
  StreamMetadata,
  InternalStage,
  StreamActionSettings,
  StreamResourceModel,
  uniqueStageName,
} from '@flogo-web/plugins/stream-core';
import {
  ImportsRefAgent,
  ResourceImportContext,
  transformConnectionTypeSettings,
  ValidationError,
} from '@flogo-web/lib-server/core';

import { PIPELINE_POINTER, STREAM_POINTER } from '../constants';
import { makeResourceValidator } from './make-resource-validator';

const KEY_STAGE_INDEX = 2;

export function importStreamResource(
  resource: Resource<StreamData>,
  context: ResourceImportContext
): Resource<StreamData> {
  const validate = makeResourceValidator(
    Array.from(context.contributions.keys()),
    context.importsRefAgent
  );
  const errors = validate(resource);
  if (errors) {
    throw new ValidationError('Stream data validation errors', errors);
  }
  return {
    ...resource,
    metadata: extractMetadata(resource, context),
    data: {
      stages: extractStages(resource, context),
    },
  };
}

function extractMetadata(
  resource: Resource,
  { actionsManager, normalizedResourceIds }: ResourceImportContext
): StreamMetadata {
  const metadata = { ...resource.metadata };
  const originalResourceId = getOriginalId(normalizedResourceIds, resource.id);
  const resourcePointerName = originalResourceId.startsWith('pipeline')
    ? PIPELINE_POINTER
    : STREAM_POINTER;
  const actionSettings = actionsManager.getSettingsForResourceId(
    originalResourceId,
    resourcePointerName
  ) as StreamActionSettings;
  return {
    input: metadata.input || [],
    output: metadata.output || [],
    groupBy: actionSettings && actionSettings.groupBy,
  };
}

function extractStages(
  resource: Resource<StreamData>,
  context: ResourceImportContext
): InternalStage[] {
  const getStageReference = (alias: string) => {
    return context.importsRefAgent.getPackageRef(ContributionType.Activity, alias);
  };
  const rawStages = (resource.data && resource.data.stages) || [];
  return rawStages.map((stage, index) => {
    stage.ref = getStageReference(stage.ref);
    stage.name = stage.name || generateStageName(stage, rawStages, context.contributions);
    return formatStage(stage, index, context.contributions, context.importsRefAgent);
  });
}

function generateStageName(stage, stages, contribSchemas) {
  const { title } = contribSchemas.get(stage.ref);
  return uniqueStageName(title, stages);
}

function getOriginalId(source: Map<string, string>, newId: string): string {
  return Array.from(source.entries()).find(([, resourceId]) => resourceId === newId)[0];
}

function formatStage(
  stage: StreamResourceModel.Stage,
  idx: number,
  contributions: Map<string, ContributionSchema>,
  importsRefAgent: ImportsRefAgent
): InternalStage {
  const { ref, name, description, output } = stage;
  // ref may have the full path of the contribution and we just need the name of the contribution.
  const contribName = ref.split('/').pop();
  let activitySettings = stage.settings;
  if (activitySettings) {
    const activitySettingsSchema = (<ActivitySchema>contributions.get(stage.ref))
      ?.settings;
    activitySettings = transformConnectionTypeSettings(
      activitySettings,
      activitySettingsSchema,
      importsRefAgent,
      true
    );
  }
  return {
    id: `${contribName}_${idx + KEY_STAGE_INDEX}`,
    ref,
    name,
    description,
    activitySettings,
    inputMappings: stage.input,
    output,
  };
}
