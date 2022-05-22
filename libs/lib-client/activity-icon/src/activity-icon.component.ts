import {
  Component,
  Input,
  OnChanges,
  HostBinding,
  ChangeDetectionStrategy,
} from '@angular/core';

enum Mode {
  Default = 'default',
  CustomIcon = 'customicon',
  Subflow = 'subflow',
  Terminal = 'terminal',
}

@Component({
  selector: 'flogo-activity-icon',
  templateUrl: './activity-icon.component.html',
  styleUrls: ['./activity-icon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityIconComponent implements OnChanges {
  @Input() iconUrl?: string;
  @Input() isTerminal?: boolean;
  @Input() isSubflow?: boolean;
  @Input() customAltText?: string;

  Mode = Mode;
  mode: Mode = Mode.Default;

  // the following code before ngOnChanges() is needed because of a bug in angular that overrides the class name defined by the component parent
  // the bug has already been solved but the angular version we're using at the moment is outdated
  // see: https://github.com/angular/angular/issues/7289
  // todo: replace with simpler hostbinding
  @Input() class = ''; // override the standard class attr with a new one.
  @HostBinding('class')
  get hostClasses(): string {
    return [
      this.class, // include our new one
      this.mode === Mode.Default ? 'is-default' : '',
      this.mode === Mode.Terminal ? 'is-terminal' : '',
    ].join(' ');
  }

  ngOnChanges() {
    if (this.iconUrl) {
      this.mode = Mode.CustomIcon;
    } else if (this.isSubflow) {
      this.mode = Mode.Subflow;
    } else if (this.isTerminal) {
      this.mode = Mode.Terminal;
    } else {
      this.mode = Mode.Default;
    }
  }
}
