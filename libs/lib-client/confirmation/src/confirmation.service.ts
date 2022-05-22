import { ElementRef, Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentType, ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ConfirmationControl } from './confirmation-control';
import { ConfirmationContent } from './confirmation-content';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  constructor(private injector: Injector, private overlay: Overlay) {}

  openModal<T extends ConfirmationContent>(
    contentComponent: ComponentType<T>,
    customTokens?: WeakMap<any, any>
  ): ConfirmationControl {
    const overlayRef = this.createModalOverlay();
    return this.buildAndAttach(overlayRef, contentComponent, customTokens);
  }

  openPopover<T>(
    connectedToRef: ElementRef,
    contentComponent: ComponentType<T>,
    customTokens?: WeakMap<any, any>
  ): ConfirmationControl {
    const overlayRef = this.createPopoverOverlay(connectedToRef);
    return this.buildAndAttach(overlayRef, contentComponent, customTokens);
  }

  private buildAndAttach<T>(
    overlayRef: OverlayRef,
    contentComponent: ComponentType<T>,
    customTokens?: WeakMap<any, any>
  ): ConfirmationControl {
    const control = new ConfirmationControl(overlayRef);
    const portal = this.createPortal(contentComponent, customTokens, control);
    overlayRef.attach(portal);
    overlayRef.backdropClick().subscribe(() => control.cancel());
    return control;
  }

  private createPortal<T>(
    componentType: ComponentType<T>,
    customTokens: WeakMap<any, any>,
    control: ConfirmationControl
  ) {
    const injector = this.createInjector(customTokens, control);
    return new ComponentPortal(componentType, null, injector);
  }

  private createInjector(
    customTokens: WeakMap<any, any>,
    control: ConfirmationControl
  ): PortalInjector {
    const injectionTokens = customTokens || new WeakMap<any, any>();
    injectionTokens.set(ConfirmationControl, control);
    return new PortalInjector(this.injector, injectionTokens);
  }

  private createModalOverlay() {
    const overlayConfig = this.getModalOverlayConfig();
    return this.overlay.create(overlayConfig);
  }

  private createPopoverOverlay(connectedToRef: ElementRef) {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'transparent',
      scrollStrategy: this.getPopoverScrollStrategy(),
      positionStrategy: this.getPopoverPositionStrategy(connectedToRef),
    });
  }

  private getPopoverScrollStrategy() {
    return this.overlay.scrollStrategies.close();
  }

  private getPopoverPositionStrategy(connectedToRef: ElementRef) {
    return this.overlay
      .position()
      .flexibleConnectedTo(connectedToRef)
      .withPositions([
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
      ]);
  }

  private getModalOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });
  }
}
