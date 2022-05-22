import { copyFile } from '../../../common/utils';
import { build } from '../commander/build';
import { copyBinaryToTarget, recursivelyFindFirstFile } from '../file-utils';
import { join } from 'path';

export function buildAndCopyBinary(enginePath, opts) {
  const copyFlogoDescriptor = opts.copyFlogoDescriptor;
  delete opts.copyFlogoDescriptor;
  return build(enginePath, opts)
    .then(out => console.log(`[log] build output: ${out}`))
    .then(() => recursivelyFindFirstFile(join(enginePath, 'bin')))
    .then(binaryPath => {
      console.log('[build] Found binary file: ', binaryPath);
      if (copyFlogoDescriptor) {
        return copyFile(
          join(enginePath, 'bin', 'flogo.json'),
          join(opts.target, 'flogo.json')
        ).then(() => binaryPath);
      }
      return binaryPath;
    })
    .then(binaryPath => {
      if (opts.target) {
        return copyBinaryToTarget(binaryPath, opts.target);
      }
      return { path: binaryPath };
    });
}
