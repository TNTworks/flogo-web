import { escapeRegExp } from 'lodash';
import { Collection } from 'lokijs';
import { findGreatestNameIndex } from '../../common/utils/collection';

export async function saveNew(app, appsDb: Collection) {
  const uniqueName = await ensureUniqueName(app.name, appsDb);
  app.name = uniqueName;
  return appsDb.insert(app);
}

function ensureUniqueName(forName, appsDb: Collection) {
  const normalizedName = escapeRegExp(forName.trim().toLowerCase());
  const results = appsDb.find({
    name: { $regex: [`^${normalizedName}`, 'i'] },
  });
  const greatestIndex = findGreatestNameIndex(forName, results);
  return greatestIndex < 0 ? forName : `${forName} (${greatestIndex + 1})`;
}
