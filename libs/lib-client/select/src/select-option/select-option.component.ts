import { Component, Input, HostBinding, Optional, HostListener } from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';
import { SelectionService } from '../selection.service';

@Component({
  selector: 'flogo-select-option',
  templateUrl: './select-option.component.html',
  styleUrls: ['./select-option.component.less'],
})
export class SelectOptionComponent implements Highlightable {
  @Input() label: string;
  @Input() value: any;

  @HostBinding('class.is-active')
  @HostBinding('attr.aria-selected')
  isActive: boolean;

  @HostBinding('attr.role') role = 'option';

  @HostBinding('id') get fieldId() {
    return this.selectionService && this.selectionService.prefixOptionId(this.value);
  }

  constructor(@Optional() private selectionService: SelectionService) {}

  getLabel() {
    return this.label;
  }

  setActiveStyles() {
    this.isActive = true;
  }

  setInactiveStyles() {
    this.isActive = false;
  }

  @HostListener('click')
  public onClick() {
    this.selectionService.select({
      value: this.value,
      label: this.label,
    });
  }
}
