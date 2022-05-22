import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  HostBinding,
} from '@angular/core';
import { MapperController } from '@flogo-web/lib-client/mapper';

@Component({
  selector: 'flogo-flow-task-configurator-iterator',
  templateUrl: 'iterator.component.html',
  styleUrls: ['iterator.component.less'],
})
export class IteratorComponent implements OnInit {
  @Input() iteratorModeOn;
  @Input() mapperController: MapperController;
  @Output() changeIteratorMode = new EventEmitter();

  @HostBinding('class.--is-initing') isIniting = true;

  ngOnInit() {
    // avoid toggle button animation on init
    setTimeout(() => (this.isIniting = false), 0);
  }

  onChangeIteratorMode() {
    this.changeIteratorMode.emit();
  }
}
