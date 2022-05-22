import npmRunAll from 'npm-run-all';

const run = (cmd, opts = {}) =>
  npmRunAll([cmd], {
    printName: true,
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    ...opts,
  });

export async function buildSubmodule({ submoduleName, outputPath }) {
  await run('build {1} --output-path={2}', {
    arguments: [submoduleName, outputPath],
  });
}
