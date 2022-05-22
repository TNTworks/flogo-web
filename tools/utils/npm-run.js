import os from 'os';
import cp from 'child_process';
import commandExists from 'command-exists';

const depManager = commandExists.sync('yarn') ? 'yarn' : 'npm';
const depManagerBin = os.platform() === 'win32' ? `${depManager}.cmd` : depManager;

export function runSync(script, cwd) {
  return cp.execSync(`${depManagerBin} ${script}`, { cwd, stdio: 'inherit' });
}
