require('../utils/crash-on-unhandled-rejection');
import { resolve } from 'path';
import copy from 'cpy';
import { Dist } from './config';

// this files are not required by the web UI itself but by the docker image
// files are copied into the root of the app during docker image build and they're expected to
// be copied to dist folder
copy(['.dockerignore', 'docker-start.dist.sh', 'Dockerfile.dist'], resolve(Dist.root), {
  rename: basename => basename.replace('.dist', ''),
});
