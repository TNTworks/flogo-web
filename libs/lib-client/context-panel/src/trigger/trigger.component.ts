import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  HostBinding,
} from '@angular/core';
import { delayWhen } from 'rxjs/operators';
import { interval, of, Subscription } from 'rxjs';

import { TogglerRefService } from '../toggler-ref.service';
import { CLOSE_WRAPPER_ANIMATION_DURATION, MINIMIZED_WIDTH } from '../variables';

/**
 * Provides an external trigger for a context panel area.
 *
 */
@Component({
  selector: 'flogo-context-panel-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.less'],
})
export class TriggerComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Text to display as the panel title */
  @Input() label: string;
  /** Event emitted when component is clicked */
  @Output() open = new EventEmitter<void>();

  @HostBinding('style.width') width = MINIMIZED_WIDTH;
  @HostBinding('class.is-open') isPanelOpen: boolean;

  private panelStatusSubscription: Subscription;

  constructor(private elementRef: ElementRef, private togglerRef: TogglerRefService) {}

  ngOnInit() {
    this.panelStatusSubscription = this.togglerRef.panelStatus$
      .pipe(
        delayWhen(isOpen =>
          !isOpen ? interval(CLOSE_WRAPPER_ANIMATION_DURATION) : of(0)
        )
      )
      .subscribe(isOpen => {
        this.isPanelOpen = isOpen;
      });
  }

  ngAfterViewInit() {
    this.togglerRef.registerRef(this.elementRef);
  }

  ngOnDestroy() {
    this.togglerRef.removeRef();
    this.panelStatusSubscription.unsubscribe();
  }
}
