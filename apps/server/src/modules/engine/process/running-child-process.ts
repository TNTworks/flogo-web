import { ChildProcess } from 'child_process';

export type RunningChildProcess = ChildProcess & {
  closed?: boolean;
  whenClosed: Promise<number>;
};
