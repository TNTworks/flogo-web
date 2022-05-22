import '../utils/crash-on-unhandled-rejection';
import readPkg from 'read-pkg';
import writePkg from 'write-pkg';
import cpy from 'cpy';
import { Sources, Dist } from './config';

(async () => {
  await updatePkgJson(Sources.root, Dist.server);
  await cpy('yarn.lock', Dist.server, { cwd: Sources.root });
})();

async function updatePkgJson(from, to) {
  const pkgJson = await readPkg({ cwd: from });
  pkgJson.version = process.env.FLOGO_LIB_VERSION || `dev-${pkgJson.version}`;
  await writePkg(to, pkgJson);
}
