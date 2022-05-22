import { Engine } from '../../engine';
import { normalizeContribUrl } from './url-parser';

export async function install(contribUrl: string, engine: Engine) {
  const packageUri = normalizeContribUrl(contribUrl);
  return engine
    .installContribution(packageUri)
    .then(details => ({ ref: packageUri, details }));
}
