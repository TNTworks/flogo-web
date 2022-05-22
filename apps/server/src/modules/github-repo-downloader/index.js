import { TYPE_UNKNOWN } from '../../common/constants';
import { config } from '../../config/app-config';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import {
  parseGitHubURL,
  createFolder,
  gitClone,
  gitUpdate,
  rmFolder,
} from '../../common/utils';

/**
 * Download GitHub repo to local environment.
 *
 * Configurations:
 *    1. A cache folder to save the GitHub repositories.
 *        In such way, the installer can install the package.json from
 *        its subdirectories using npm command.
 *
 * Folder structures:
 *
 *  cache
 *  |-- activity
 *      |-- some activity
 *  |-- trigger
 *      |-- some trigger
 *
 * Operational logic
 *  1. Trigger download API with a given URL list
 *  2. Verify if the repo(s) exists
 *    2.1. If exists, update the repo in cache folder
 *    2.2. If doesn't exist, checkout the given repo in cache folder
 *  3. After finishing, return a success list and a fail list.
 */
export class GitHubRepoDownloader {
  constructor(opts) {
    const defaultOpts = {
      cacheFolder: config.app.gitRepoCachePath,
      type: TYPE_UNKNOWN,
    };

    this.opts = _.assign({}, defaultOpts, opts);
  }

  /**
   * Get the relative path of a given repo that should be used to cache the repo
   *
   * @param repoURL
   */
  static getTargetPath(repoURL) {
    let parsedURL = parseGitHubURL(repoURL);
    return path.join(parsedURL.username, parsedURL.repoName);
  }

  updateType(newType) {
    this.opts.type = newType;
  }

  get cacheTarget() {
    return path.join(this.opts.cacheFolder, this.opts.type.toLowerCase());
  }

  clearCache() {
    return rmFolder(this.cacheTarget);
  }

  download(urls) {
    return new Promise((resolve, reject) => {
      // deduplication
      const repos = _.uniq(urls);

      let taskPromises = _.map(repos, repo => {
        let targetPath = GitHubRepoDownloader.getTargetPath(repo);
        let absoluteTargetPath = path.join(this.cacheTarget, targetPath);

        console.log(`[log] caching repo '${repo}' to '${absoluteTargetPath}'`);

        return hasRepoCached(repo, this.cacheTarget)
          .then(result => {
            if (result === false) {
              return newRepoHandler(repo, absoluteTargetPath);
            } else if (result === true) {
              return existsRepoHandler(repo, absoluteTargetPath);
            } else {
              // invalid result.
              throw result;
            }
          })
          .then(result => {
            return {
              repo: repo,
              result: result,
            };
          })
          .catch(err => {
            console.error(err);
            return {
              repo: repo,
              error: err,
            };
          });
      });

      Promise.all(taskPromises)
        .then(result => {
          console.log(`[info] download repos results: `);
          console.log(result);
          resolve(result);
        })
        .catch(err => {
          console.log(`[error] fail to download repos`);
          reject(err);
        });
    });
  }
}

/**
 * check if the given repo exists in the cache folder.
 *
 * @param repoURL
 * @param cacheFolder
 * @returns {Promise}
 */
function hasRepoCached(repoURL, cacheFolder) {
  return new Promise((resolve, reject) => {
    fs.stat(
      path.join(cacheFolder, GitHubRepoDownloader.getTargetPath(repoURL), '.git'),
      (err, stats) => {
        if (err) {
          // log the error if it's not the `no entity` error.
          if (err.code !== 'ENOENT') {
            console.log(`[log] GitHubRepoDownloader.hasRepoCached on error: `);
            console.log(err);
          }
          resolve(false);
        } else if (stats.isDirectory()) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
}

// download new repo
//    create folder
//    clone the repo
function newRepoHandler(repoURL, folderPath) {
  return new Promise((resolve, reject) => {
    createFolder(folderPath)
      .then(result => {
        return gitClone(repoURL, folderPath);
      })
      .then(result => {
        console.log(`[log] new repo: ${repoURL} ---> ${folderPath}`);
        console.log(result);
        resolve(true);
        return result;
      })
      .catch(err => {
        console.error(`[error] error on newRepoHandler`);
        reject(err);
      });
  });
}

// update the repo
function existsRepoHandler(repoURL, folderPath) {
  return new Promise((resolve, reject) => {
    gitUpdate(folderPath)
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        console.error(`[error] error on existsRepoHandler`);
        reject(err);
      });
  });
}
