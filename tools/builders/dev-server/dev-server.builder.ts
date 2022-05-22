import { resolve } from 'path';
import { Path, JsonObject } from '@angular-devkit/core';
import {
  BuilderContext,
  createBuilder,
  BuilderOutput,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { ChildProcess } from 'child_process';
import { Observable, of, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

const { spawn } = require('cross-spawn');
const treeKill = require('tree-kill');

interface BuildOptions extends JsonObject {
  inspect: boolean;
  buildTarget: string;
  watch: boolean;
}

const TSNODE_BINARY = './node_modules/.bin/ts-node';
const TSNODE_DEV_BINARY = './node_modules/.bin/tsnd';
const DEFAULT_ARGS = ['--respawn', '--transpileOnly', '-r', 'tsconfig-paths/register'];

export default createBuilder<BuildOptions>(tsExecuteBuilderHandler);

export function tsExecuteBuilderHandler(
  options: BuildOptions,
  context: BuilderContext
): Observable<BuilderOutput> {
  return from(context.getTargetOptions(targetFromTargetString(options.buildTarget))).pipe(
    switchMap((buildTargetOptions: any) => {
      const binary = resolveBinary(context.workspaceRoot, options.watch);
      return runProcess(context, binary, {
        cwd: context.target.root as string,
        main: buildTargetOptions.main,
        tsconfig: buildTargetOptions.tsConfig,
        inspect: options.inspect,
      });
    }),
    map(() => ({ success: true })),
    catchError(e => of({ success: false }))
  );
}

function resolveBinary(root: string, watch: boolean) {
  return resolve(root, watch ? TSNODE_DEV_BINARY : TSNODE_BINARY);
}

function runProcess(
  context: BuilderContext,
  binary: string | Path,
  {
    cwd,
    main,
    tsconfig,
    inspect,
  }: { cwd: string; main: string; tsconfig: string; inspect?: boolean }
) {
  return new Observable(observer => {
    const inspectOpts = inspect ? ['--inspect'] : [];
    const subprocess: ChildProcess = spawn(
      binary,
      [...DEFAULT_ARGS, ...inspectOpts, '-P', tsconfig, main],
      {
        cwd,
        env: process.env,
        stdio: 'pipe',
      }
    );
    const killSubProcess = () => {
      if (!subprocess.killed) {
        treeKill(this.subprocess.pid, 'SIGKILL');
      }
    };
    process.on('exit', killSubProcess);

    subprocess.on('error', err => {
      this.builderContext.logger.fatal(err.message);
      observer.error(err);
    });

    subprocess.on('close', code => {
      if (code === 0) {
        this.builderContext.logger.info('Server completed with 0 code');
        observer.complete();
      } else {
        observer.error(new Error(`Failed with exit code: ${code}`));
      }
    });

    subprocess.stdout.on('data', data => {
      context.logger.info(data.toString());
    });
    subprocess.stderr.on('data', data => {
      context.logger.error(data.toString());
    });

    return killSubProcess;
  });
}
