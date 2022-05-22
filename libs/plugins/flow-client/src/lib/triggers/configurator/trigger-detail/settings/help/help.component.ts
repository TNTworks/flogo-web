import { Component, Input } from '@angular/core';

@Component({
  selector: 'flogo-triggers-configuration-settings-help',
  templateUrl: 'help.component.html',
  styleUrls: ['help.component.less'],
})
export class SettingsHelpComponent {
  @Input()
  trigger;
  isHelpMenuOpen = false;

  toggleMenu() {
    this.isHelpMenuOpen = !this.isHelpMenuOpen;
  }

  closeMenu() {
    this.isHelpMenuOpen = false;
  }
}
