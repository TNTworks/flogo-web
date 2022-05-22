import '../utils/crash-on-unhandled-rejection';
import npmRunAll from 'npm-run-all';
import { Sources } from './config';

process.chdir(Sources.server);
npmRunAll(['configure-engines'], {
  stdout: process.stdout,
  stderr: process.stderr,
  printLabel: true,
});
