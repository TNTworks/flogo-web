import { ensureDefaultDirsSync } from './dirs';
ensureDefaultDirsSync();

export { rootContainer } from './init-dependencies';
export * from './install-defaults';
export * from './app';
export * from './bootstrap-engine';
