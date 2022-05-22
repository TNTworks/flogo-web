import { URL } from 'url';

const DEFAULT_PROTOCOL = 'https://';
const GITHUB_TREEISH_HOSTNAME = /(^\/?[^/]+\/[^/]+)(\/tree\/[^/]+)/;

export function normalizeContribUrl(url: string) {
  // tslint:disable-next-line:prefer-const
  let { host, pathname } = new URL(normalizeUrl(url));
  if (isGithubHostName(host)) {
    pathname = removeGithubTreePortionFromPathName(pathname);
  }
  return host + pathname;
}

function normalizeUrl(url: string) {
  return url.trim().replace(/^(?!(?:\w+:)?\/\/)|^\/\//, DEFAULT_PROTOCOL);
}

function isGithubHostName(hostname: string) {
  return hostname.startsWith('github.com');
}

// from tree/master/my/subpath to my/subpath
function removeGithubTreePortionFromPathName(pathname: string) {
  return pathname.replace(GITHUB_TREEISH_HOSTNAME, '$1');
}
