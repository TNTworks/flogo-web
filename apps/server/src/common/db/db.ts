import Loki from 'lokijs';

import { App } from '@flogo-web/core';
import { config } from '../../config';
import { collections } from './collections-registry';

const dbPath = config.apps.dbPath;

export let persistedDb: Loki;
// todo: use by non-persistent collections like contributions
const memoryDb = new Loki('mem.db', { adapter: new Loki.LokiMemoryAdapter() });

export function initDb({ persist = true, autosave = true } = {}) {
  return new Promise(resolve => {
    persistedDb = new Loki(dbPath, {
      adapter: persist ? new Loki.LokiFsAdapter() : new Loki.LokiMemoryAdapter(),
      autoload: true,
      autosave,
      autoloadCallback: afterInitDb(resolve),
      autosaveInterval: 4000,
    });
  });
}

export function flushAndCloseDb() {
  if (persistedDb) {
    return new Promise((resolve, reject) => {
      persistedDb.save(err => {
        if (err) {
          return reject(err);
        }

        persistedDb.close(err2 => {
          if (err2) {
            return reject(err2);
          }
          resolve();
        });
      });
    });
  }
}

function afterInitDb(signalReadyFn: Function) {
  return () => {
    let apps = persistedDb.getCollection<App>('apps');
    if (apps == null) {
      apps = persistedDb.addCollection('apps', {
        unique: ['id'],
        indices: ['name'],
        clone: true,
      });
    }
    collections.apps = apps;
    signalReadyFn();
  };
}
