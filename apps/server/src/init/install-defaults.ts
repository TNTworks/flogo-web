import { AppsService } from '../modules/apps';
import { config } from '../config/app-config';
import { readJSONFile } from '../common/utils/file';

export function installDefaults(appService: AppsService) {
  return readJSONFile(config.defaultAppJsonPath)
    .then(defaultApp => appService.importApp(defaultApp))
    .catch(err => Promise.reject(err));
}
