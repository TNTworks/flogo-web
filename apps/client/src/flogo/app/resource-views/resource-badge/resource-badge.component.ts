import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  SimpleChanges,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'flogo-apps-resource-badge',
  styleUrls: ['./resource-badge.component.less'],
  template: '{{ displayLabel }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceBadgeComponent implements OnChanges {
  @Input() @HostBinding('style.background-color') color: string;
  @Input() type: string;
  displayLabel: string;

  ngOnChanges(changes: SimpleChanges) {
    this.displayLabel = this.type.slice(0, 2);
  }
}
