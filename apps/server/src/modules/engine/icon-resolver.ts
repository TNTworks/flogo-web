import * as nodePath from 'path';
import resolvePath from 'resolve-path';
import { isBinaryFile } from 'isbinaryfile';

const TYPE_SVG = '.svg';
const TYPE_PNG = '.png';
const TYPE_JPG = '.jpg';
const ICON_TYPES = [TYPE_SVG, TYPE_PNG, TYPE_JPG];

export async function ensureValidIcon<T extends { display?: { icon?: string } }>({
  contribSchemaPath,
  contribSchemaRef,
  contribSchema,
}: {
  contribSchemaPath: string;
  contribSchemaRef: string;
  contribSchema: T;
}): Promise<T> {
  if (!contribSchema?.display?.icon) {
    return contribSchema;
  }

  const iconPath = contribSchema.display.icon;
  const resolvedIconPath = await validateAndResolveIconPath({
    iconPath,
    schemaPath: contribSchemaPath,
    schemaRef: contribSchemaRef,
  });
  if (resolvedIconPath) {
    const { icon, ...display } = contribSchema.display;
    contribSchema = {
      ...contribSchema,
      iconPath: resolvedIconPath,
    };
  } else {
    const { icon, ...display } = contribSchema.display;
    contribSchema = {
      ...contribSchema,
      display,
    };
  }
  return contribSchema;
}

async function validateAndResolveIconPath({
  schemaPath,
  schemaRef,
  iconPath,
}): Promise<null | string> {
  const fileExt = nodePath.extname(iconPath).toLowerCase();
  if (!ICON_TYPES.includes(fileExt)) {
    console.warn(
      `warning: could not load "${iconPath}" as icon for "${schemaRef}". Only ${ICON_TYPES.join(
        ', '
      )} files are supported.
      )}".`
    );
    return null;
  }

  const contribFolder = nodePath.dirname(schemaPath);
  let resolvedIconPath = null;
  try {
    resolvedIconPath = resolvePath(contribFolder, iconPath);
  } catch (e) {
    console.warn(
      `warning: could not load icon for "${schemaRef}". File path ${iconPath} is not inside contribution directory "${nodePath.basename(
        contribFolder
      )}".`
    );
    return null;
  }

  let isPlaintext;
  try {
    isPlaintext = !(await isBinaryFile(resolvedIconPath));
  } catch (e) {
    console.warn(
      `warning: could not read icon "${iconPath}" in filesystem for "${schemaRef} (${nodePath.basename(
        contribFolder
      )})". Wrong permissions or file doesn't exist.`
    );
    return null;
  }

  if (fileExt === TYPE_SVG && !isPlaintext) {
    console.warn(
      `warning: invalid svg, won't load icon "${iconPath}" for "${schemaRef} (${nodePath.basename(
        contribFolder
      )})". "${iconPath}" seems to be a binary file.`
    );
  } else if (fileExt !== TYPE_SVG && isPlaintext) {
    console.warn(
      `warning: invalid icon, won't load icon "${iconPath}" for "${schemaRef} (${nodePath.basename(
        contribFolder
      )})". "${iconPath}" doesn't seems to be a binary file.`
    );
  }

  resolvedIconPath = nodePath.relative(process.env.GOPATH, resolvedIconPath);
  return resolvedIconPath;
}
