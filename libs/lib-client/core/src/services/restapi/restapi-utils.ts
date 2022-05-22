export function getFileName(header) {
  let filename = '';
  if (header && header.indexOf('attachment') !== -1) {
    const FILE_NAME_REGEX = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = FILE_NAME_REGEX.exec(header);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }
  return filename;
}
