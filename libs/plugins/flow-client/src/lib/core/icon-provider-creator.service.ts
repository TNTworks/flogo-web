import { Dictionary, HttpUtilsService } from '@flogo-web/lib-client/core';
import { Item, BaseItemTask } from './interfaces/flow';
import { ContributionSchema } from '@flogo-web/core';
import { IconProvider } from '@flogo-web/lib-client/diagram';
import { Injectable } from '@angular/core';

@Injectable()
export class IconProviderCreator {
  constructor(private httpUtils: HttpUtilsService) {}

  create(items: Dictionary<Item>, schemas: Dictionary<ContributionSchema>): IconProvider {
    return {
      getIconUrlById: (taskId: string) => {
        const ref = (items[taskId] as BaseItemTask)?.ref;
        const iconUrl = ref && schemas[ref] ? schemas[ref].icon : null;
        return iconUrl ? this.httpUtils.apiPrefix(iconUrl) : null;
      },
    };
  }
}
