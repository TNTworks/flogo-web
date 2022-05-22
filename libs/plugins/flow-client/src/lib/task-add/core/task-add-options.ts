import { Observable } from 'rxjs';
import { Resource } from '@flogo-web/core';

export interface TaskAddOptions {
  activities$: Observable<Activity[]>;
  appAndFlowInfo$: Observable<AppAndFlowInfo>;
  selectActivity: (activityRef: string, selectedSubFlow?: Resource) => void;
  updateActiveState: (isOpen: boolean) => void;
  cancel: () => void;
}

export interface Activity {
  title: string;
  ref: string;
  isReturnType: boolean;
  icon?: string;
}

interface AppAndFlowInfo {
  appId: string;
  actionId: string;
}
