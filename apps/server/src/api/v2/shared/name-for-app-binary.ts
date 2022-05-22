import { kebabCase } from 'lodash';

const notEmpty = value => !!value;
export function getNameForAppBinary(
  appName,
  { os: targetOs, arch: targetArch }: { os?: string; arch?: string }
) {
  let name = [kebabCase(appName), targetOs || undefined, targetArch || undefined]
    .filter(notEmpty)
    .join('_');
  if (targetOs === 'windows') {
    name = `${name}.exe`;
  }
  return name;
}
