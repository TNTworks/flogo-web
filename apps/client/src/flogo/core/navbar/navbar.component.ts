import { Component, Inject } from '@angular/core';
import { FLOGO_VERSION } from '@flogo-web/lib-client/core';
import { ModalService } from '@flogo-web/lib-client/modal';
import { FlogoInstallerComponent } from '@flogo-web/lib-client/contrib-installer';

@Component({
  selector: 'flogo-navbar',
  templateUrl: 'navbar.tpl.html',
  styleUrls: ['navbar.component.less'],
})
export class FlogoNavbarComponent {
  public currentYear: number;
  isOpenMenu = false;

  constructor(
    @Inject(FLOGO_VERSION) public version: string,
    private modalService: ModalService
  ) {
    this.currentYear = new Date().getFullYear();
  }

  toggleNavMenu() {
    this.isOpenMenu = !this.isOpenMenu;
  }

  closeNavMenu() {
    this.isOpenMenu = false;
  }

  onInstallContrib() {
    this.modalService.openModal<void>(FlogoInstallerComponent);
  }
}
