import { Component, ChangeDetectionStrategy, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'flogo-modal-footer',
  templateUrl: './modal-footer.component.html',
  styleUrls: ['./modal-footer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalFooterComponent {
  @HostBinding('class.stretch-children') @Input() stretchChildren = false;
}
