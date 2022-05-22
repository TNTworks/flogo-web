import { reduce, toInteger } from 'lodash';
import { normalizeActivityName } from '@flogo-web/core';

import { BaseItem } from '../interfaces';

export function uniqueStageName(stageName: string, ...stageDictionaries) {
  // TODO for performance pre-normalize and store task names?
  const newNormalizedName = normalizeActivityName(stageName);

  const allStages = Object.assign({}, ...stageDictionaries);

  // search for the greatest index in all the flow
  const greatestIndex = reduce(
    allStages,
    (greatest: number, stage: any) => {
      const currentNormalized = normalizeActivityName(stage.name);
      let repeatIndex = 0;
      if (newNormalizedName === currentNormalized) {
        repeatIndex = 1;
      } else {
        const match = /^(.*)\-([0-9]+)$/.exec(currentNormalized); // some-name-{{integer}}
        if (match && match[1] === newNormalizedName) {
          repeatIndex = toInteger(match[2]);
        }
      }

      return repeatIndex > greatest ? repeatIndex : greatest;
    },
    0
  );

  return greatestIndex > 0 ? `${stageName} (${greatestIndex + 1})` : stageName;
}

export function hasStageWithSameName(stageName, ...stageDictionaries): boolean {
  const allStages = Object.assign({}, ...stageDictionaries);
  return !!Object.values(allStages).find(
    stage => (stage as BaseItem).name.toLowerCase() === stageName.toLowerCase()
  );
}
