import { tmpFile } from '../../common/utils/file';
import { Engine } from './engine';

const RESOURCE_BUNDLE_NAME = '__plugin-bundle.json';

export async function installResourceTypes(engine: Engine, resourceRefs: string[]) {
  const bundleFile = tmpFile(RESOURCE_BUNDLE_NAME);
  await bundleFile.write(
    JSON.stringify({
      contributions: resourceRefs,
    })
  );
  await engine.installContribBundle(bundleFile.path);
  await bundleFile.remove();
}
