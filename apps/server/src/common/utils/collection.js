import toInteger from 'lodash/toInteger';
import escapeRegexp from 'lodash/escapeRegExp';

/**
 * Find greatest index for ocurrence of "Name" and pattern "Name (number)".
 *
 * @example
 * For a collection
 * [{name: "My name"}, {name: "My name (1)"}, {name: "My name (2)"}, {name: "My name (4)"} ]
 * Searching for "My name", result will be: 4 (number)
 *
 * @example
 * For a collection
 * [{name: "My name"}]
 *
 * Searching for "My name", result will be: 0 (number)
 *
 * @param name
 * @param collection
 * @param {string} [property=name] Property to lookup, defaults to 'name'
 *@returns {number} greatest index
 */
export function findGreatestNameIndex(name, collection, property = 'name') {
  if (!name || !collection) {
    throw new TypeError('Name and collection params are required');
  }
  let normalizedName = name.trim().toLowerCase();
  normalizedName = escapeRegexp(normalizedName);

  const namePattern = new RegExp(`^${normalizedName}(\\s+\\((\\d+)\\))?$`, 'i');
  return collection.reduce((greatest, element) => {
    const matches = namePattern.exec(element[property]);
    if (matches) {
      const index = toInteger(matches[2]);
      return index > greatest ? index : greatest;
    }
    return greatest;
  }, -1);
}
