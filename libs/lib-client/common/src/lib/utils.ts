export function getURL(config: {
  protocol?: string;
  host?: string;
  port?: string;
}): string {
  if (config.port) {
    return `${config.protocol || location.protocol.replace(':', '')}://${config.host ||
      location.hostname}:${config.port}`;
  } else {
    return `${config.protocol || location.protocol.replace(':', '')}://${config.host ||
      location.hostname}}`;
  }
}

/**
 * Copies content of an element into the system clipboard.
 * (Taken from UI cloud pattern library)
 *
 * Not all browsers may be supported. See the following for details:
 * http://caniuse.com/clipboard
 * https://developers.google.com/web/updates/2015/04/cut-and-copy-commands
 * @param  {HTMLElement} element The element containing the text to copy
 * @return {boolean} whether the copy operation is succeeded
 */
export function copyToClipboard(element: HTMLElement) {
  const sel = window.getSelection();
  const snipRange = document.createRange();
  snipRange.selectNodeContents(element);
  sel.removeAllRanges();
  sel.addRange(snipRange);
  let res = false;
  try {
    res = document.execCommand('copy');
  } catch (err) {
    // copy command is not available
    console.error(err);
  }
  sel.removeAllRanges();
  return res;
}
