import { RunStatusCode as RUNNER_STATUS } from './run-orchestrator.service';

export function logRunStatus(processStatus) {
  switch (processStatus.status) {
    case RUNNER_STATUS.NotStarted:
      console.log(`[PROC STATE][${processStatus.trial}] Process has not started.`);
      break;
    case RUNNER_STATUS.Active:
      console.log(`[PROC STATE][${processStatus.trial}] Process is running...`);
      break;
    case RUNNER_STATUS.Completed:
      console.log(`[PROC STATE][${processStatus.trial}] Process finished.`);
      break;
    case null:
      break;
    default:
      console.warn(`[PROC STATE][${processStatus.trial}] Unknown status.`);
  }
}
