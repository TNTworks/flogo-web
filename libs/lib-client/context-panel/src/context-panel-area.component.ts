import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { contextPanelAnimations } from './context-panel.animations';
import { DEFAULT_MINIMIZED_HEIGHT, DEFAULT_MAXIMIZED_HEIGHT } from './variables';
import { TogglerRefService } from './toggler-ref.service';

const STATUS_OPEN = 'open';
const STATUS_CLOSED = 'closed';

/**
 *
 * Provides a collapsible panel area for another component.
 *
 * There are three parts for this component to work:
 * 1. The component itself (`<flogo-context-panel-area><flogo-context-panel-area/>)
 * 2. The component or element to be displayed in the main area (wrapped area), it should be tagged with attribute `context-panel-role="primary-area"`
 * 3. The component or element to be used as panel content, it should be tagged with attribute `context-panel-role="panel-content"`
 *
 * Example of usage:
 * <flogo-context-panel-area [isOpen]="isPanelOpen">
 *    <div context-panel-role="primary-area"></div>
 *    <div context-panel-role="panel-content"></div>
 * </flogo-context-panel-area>
 *
 */
@Component({
  selector: 'flogo-context-panel-area',
  templateUrl: './context-panel-area.component.html',
  styleUrls: ['./context-panel-area.component.less'],
  animations: [
    contextPanelAnimations.panelContainer,
    contextPanelAnimations.panel,
    contextPanelAnimations.wrappedContent,
  ],
})
export class ContextPanelAreaComponent implements OnChanges {
  /** Control the open/close status of the panel */
  @Input() isOpen: boolean;
  /** Text to display as the panel title */
  @Input() panelTitle: string;
  @Input() triggerStyles: object;
  /**
   * CSS selector for the element in the wrapped content that represents the current panel context.
   *
   * If this property is specified then when the panel opens and after the open animation is finished
   * the wrapped content will automatically scroll to make sure the context element is visible.
   *
   * @example '.my-element.is-selected'
   */
  @Input() contextElementSelector?: string;
  /**
   * Height of the panel when in open/maximized state
   * @example '40vh'
   */
  @Input() openHeight?: string;

  /** Event emitted when an intent to open the panel has been triggered  */
  @Output() open = new EventEmitter<void>();
  /**  Event emitted when an intent to close the panel has been triggered  */
  @Output() close = new EventEmitter<void>();

  @ViewChild('content', { static: true }) content: ElementRef;
  panelStatus: 'open' | 'closed' = STATUS_CLOSED;
  toggleButtonAnimationParams = {
    minimizedLeftDistance: 1,
    minimizedHeight: DEFAULT_MINIMIZED_HEIGHT,
    maximizedHeight: this.getMaximizedHeight(),
  };

  constructor(private togglerRef: TogglerRefService) {}

  ngOnChanges({ isOpen: isOpenChange, openHeight: openHeightChange }: SimpleChanges) {
    if (isOpenChange && isOpenChange.previousValue !== this.isOpen) {
      this.onStatusChange();
    }

    if (openHeightChange && openHeightChange.previousValue !== this.openHeight) {
      this.toggleButtonAnimationParams = {
        ...this.toggleButtonAnimationParams,
        maximizedHeight: this.getMaximizedHeight(),
      };
    }
  }

  onStatusChange() {
    this.panelStatus = this.isOpen ? STATUS_OPEN : STATUS_CLOSED;
    this.togglerRef.publishPanelStatus(this.isOpen);
    this.adjustPositionForAnimation();
  }

  openPanel() {
    if (!this.isOpen) {
      this.open.emit();
    }
  }

  closePanel() {
    if (this.isOpen) {
      this.close.emit();
    }
  }

  onAnimationEnd(event: AnimationEvent) {
    if (event.toState === STATUS_OPEN) {
      this.scrollContextElementIntoView();
    }
  }

  private getMaximizedHeight() {
    return this.openHeight || DEFAULT_MAXIMIZED_HEIGHT;
  }

  private scrollContextElementIntoView() {
    if (!this.contextElementSelector) {
      return;
    }
    const contentElement: Element = this.content.nativeElement;
    const selection = contentElement.querySelector(this.contextElementSelector);
    if (selection) {
      selection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private adjustPositionForAnimation() {
    const animationParams = this.togglerRef.calculatePlacement() || {
      minimizedHeight: 0,
      minimizedLeftDistance: 0,
    };
    this.toggleButtonAnimationParams = {
      ...this.toggleButtonAnimationParams,
      ...animationParams,
    };
  }
}
