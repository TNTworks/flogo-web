/**
 * judge whether a string is a valid json string. if i
 * @param  {string}  str - the JSON string
 * @return {object|undefined} if it is a valid json, return json, otherwise return undefined
 */
export function isJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

export let parseJSON = isJSON;
