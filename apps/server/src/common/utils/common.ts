import shortid from 'shortid';

export function ISONow() {
  const now = new Date();
  return now.toISOString();
}

export function generateShortId() {
  return shortid.generate();
}
