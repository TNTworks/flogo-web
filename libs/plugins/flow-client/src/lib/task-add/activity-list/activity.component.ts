import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  OnChanges,
  HostBinding,
  SimpleChanges,
} from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';
import { CONTRIB_REFS } from '@flogo-web/core';
import { ICON_SUBFLOW } from '../../core';
import { Activity } from '../core/task-add-options';

@Component({
  selector: 'flogo-flow-task-add-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.less'],
})
export class ActivityComponent implements Highlightable, OnChanges {
  @Input() activity: Activity;
  @Output() selected = new EventEmitter();
  @HostBinding('class.is-active') isHighlighted = false;
  @HostBinding('class.is-subflow') isSubflow: boolean;
  @Input() iconUrl: string;
  disabled = false;

  ngOnChanges({ activity: activityChange }: SimpleChanges) {
    if (activityChange) {
      const activity = activityChange.currentValue;
      this.isSubflow = activity.ref === CONTRIB_REFS.SUBFLOW;
      if (activity.icon) {
        this.iconUrl = activity.icon;
      } else if (this.isSubflow) {
        this.iconUrl = ICON_SUBFLOW;
      }
    }
  }

  @HostListener('click')
  select() {
    this.selected.emit(this.activity);
  }

  setActiveStyles() {
    this.isHighlighted = true;
  }

  setInactiveStyles() {
    this.isHighlighted = false;
  }
}
