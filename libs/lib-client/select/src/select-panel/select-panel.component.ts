import {
  Component,
  ViewChild,
  Input,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { TemplatePortalDirective } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { takeUntil } from 'rxjs/operators';
import { SelectOptionComponent } from '../select-option/select-option.component';

@Component({
  selector: 'flogo-select-panel',
  templateUrl: './select-panel.component.html',
  styleUrls: ['./select-panel.component.less'],
})
export class SelectPanelComponent {
  @Input() origin: HTMLElement;
  @Input() labeledBy: string;
  @Input() activeDescendantId?: string;
  @Output() select = new EventEmitter();

  @ViewChild(TemplatePortalDirective, { static: true })
  contentTemplate: TemplatePortalDirective;
  isOpen: boolean;
  private overlayRef: OverlayRef;

  constructor(protected overlay: Overlay) {}

  open() {
    if (this.isOpen) {
      return;
    }
    this.overlayRef = this.overlay.create(this.createOverlayConfig());
    this.overlayRef.attach(this.contentTemplate);
    this.syncWidth();
    this.isOpen = true;
    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this.overlayRef.detachments()))
      .subscribe(() => this.close());
  }

  close() {
    if (this.overlayRef && this.overlayRef) {
      this.overlayRef.detach();
      this.isOpen = false;
      this.overlayRef = null;
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.syncWidth();
  }

  private syncWidth() {
    if (!this.overlayRef) {
      return;
    }
    const originWidth = this.origin.getBoundingClientRect().width;
    this.overlayRef.updateSize({ minWidth: originWidth });
  }

  private createOverlayConfig(): OverlayConfig {
    return {
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.origin)
        .withPush(true)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
        ]),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    };
  }
}
