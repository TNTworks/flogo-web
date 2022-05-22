import path from 'path';

const sourceRoot = 'src';
export const Sources = {
  root: '',
  client: path.join('apps', 'client'),
  server: path.join('apps', 'server'),
  packages: path.join(sourceRoot, 'packages'),
};

const distRoot = 'dist';
export const Dist = {
  root: distRoot,
  public: path.join(distRoot, 'apps', 'public'),
  server: path.join(distRoot, 'apps', 'server'),
  packages: path.join(distRoot, 'packages'),
};

export const ABSOLUTE_DIST_SERVER_PATH = path.resolve('..', 'dist');
