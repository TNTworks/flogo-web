import '../utils/crash-on-unhandled-rejection';
import fs from 'fs';
import path from 'path';
import { promisify, inspect } from 'util';

import { Sources } from './config';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const fileStat = promisify(fs.stat);

const DEFAULT_PALETTE_FILENAME = 'default-palette.json';

const ignoreRefs = [
  'github.com/TIBCOSoftware/flogo-contrib/activity/inference',
  'github.com/TIBCOSoftware/flogo-contrib/activity/mongodb',
];

const pathToContrib =
  process.env.FLOGO_WEB_BUILD_CONTRIB_PATH || path.resolve('/flogo', 'flogo-contrib');
console.log('Will look for flogo-contrib in: ', pathToContrib);
buildPalette();

export async function buildPalette() {
  const [activities, triggers] = await Promise.all([
    getAll('activity'),
    getAll('trigger'),
  ]);

  const contribs = [...activities, ...triggers]
    .filter(contrib => !ignoreRefs.includes(contrib.ref))
    .concat([
      {
        type: 'action',
        ref: 'github.com/TIBCOSoftware/flogo-contrib/action/flow',
      },
    ]);

  const palette = makePalette(contribs);
  console.log('** Generated new default palette **');
  console.log(inspect(palette));
  return writeJsonFile(
    path.resolve(Sources.server, 'src', 'config', DEFAULT_PALETTE_FILENAME),
    palette
  );
}

function makePalette(extensions) {
  return {
    name: 'default',
    version: '0.0.1',
    title: 'Default Palette',
    description: 'Default flogo palette',
    extensions,
  };
}

async function getAll(type) {
  const dirPath = path.join(pathToContrib, type);
  const files = await getFiles(dirPath);
  let descriptorPaths = files
    .filter(file => file.isDir)
    .map(file => path.join(file.path, `${type}.json`));
  const descriptors = await Promise.all(
    descriptorPaths.map(contribDescriptorPath =>
      readContribDescriptor(contribDescriptorPath)
    )
  );
  return descriptors.filter(descriptor => !!descriptor).map(({ ref }) => ({ type, ref }));
}

async function getFiles(dirPath) {
  const getFileStats = name => {
    const filePath = path.join(dirPath, name);
    return fileStat(filePath).then(fileInfo => {
      return {
        name,
        path: filePath,
        isDir: fileInfo.isDirectory(),
      };
    });
  };
  const fileNames = await readDir(dirPath);
  return Promise.all(fileNames.map(getFileStats));
}

function writeJsonFile(target, contents) {
  return writeFile(target, JSON.stringify(contents, null, 4));
}

function readContribDescriptor(path) {
  return readFile(path)
    .then(fileContents => {
      return JSON.parse(fileContents);
    })
    .catch(err => {
      console.warn(`Could not read descriptor for ${path}`);
      console.warn(err);
      return Promise.resolve(null);
    });
}
