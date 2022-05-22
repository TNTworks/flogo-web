import { buildHandler } from '../shared/build-handler';
import { getNameForAppBinary } from '../shared/name-for-app-binary';
import { AppsContext } from '../shared/apps-service-middleware';

export const buildApp = buildHandler(async (context: AppsContext, options) => {
  const appId = context.params.appId;
  const buildResult = await context.appsService.build(appId, options);
  const fileName = getNameForAppBinary(buildResult.appName, options.compile);
  return { fileName, content: buildResult.data };
});
