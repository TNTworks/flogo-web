import { Injectable, InjectionToken, Injector } from '@angular/core';
import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ModalInstance } from './modal-instance';
import { ModalModule } from './modal.module';

/**
 * @deprecated should be replaced by ModalInstance.data
 */
export const MODAL_TOKEN = new InjectionToken<any>('flogo/core/modal-token');

@Injectable({
  providedIn: ModalModule,
})
export class ModalService {
  constructor(private injector: Injector, private overlay: Overlay) {}

  openModal<T>(contentComponent: ComponentType<any>, componentData?: T): ModalInstance {
    const data = new WeakMap<any, any>();
    data.set(MODAL_TOKEN, componentData);
    const overlayRef = this.createModalOverlay();
    const modalInstance = new ModalInstance(overlayRef, componentData);
    return this.buildAndAttach(overlayRef, contentComponent, modalInstance, data);
  }

  private buildAndAttach<T>(
    overlayRef: OverlayRef,
    contentComponent: ComponentType<T>,
    control: ModalInstance,
    customTokens?: WeakMap<any, any>
  ): ModalInstance {
    const portal = this.createPortal(contentComponent, customTokens, control);
    overlayRef.attach(portal);
    overlayRef.backdropClick().subscribe(() => control.close());
    return control;
  }

  private createPortal<T>(
    componentType: ComponentType<T>,
    customTokens: WeakMap<any, any>,
    control: ModalInstance
  ) {
    const injector = this.createInjector(customTokens, control);
    return new ComponentPortal(componentType, null, injector);
  }

  private createInjector(
    customTokens: WeakMap<any, any>,
    control: ModalInstance
  ): PortalInjector {
    const injectionTokens = customTokens || new WeakMap<any, any>();
    injectionTokens.set(ModalInstance, control);
    return new PortalInjector(this.injector, injectionTokens);
  }

  private createModalOverlay() {
    const overlayConfig = this.getModalOverlayConfig();
    return this.overlay.create(overlayConfig);
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
