import { Observable } from 'rxjs';

export interface StageAddOptions {
  activities$: Observable<Activity[]>;
  selectActivity: (ref: string) => void;
  updateActiveState: (isOpen: boolean) => void;
  cancel: () => void;
}

export interface Activity {
  title: string;
  ref: string;
  icon: string;
}
