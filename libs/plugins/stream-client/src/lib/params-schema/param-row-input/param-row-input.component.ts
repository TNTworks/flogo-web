import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flogo-stream-params-schema-input-param-row',
  templateUrl: 'param-row-input.component.html',
  styleUrls: ['param-row-input.component.less'],
})

/**
 * @private
 */
export class ParamRowInputComponent implements OnChanges {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Input() groupBy;
  @Output() removeParam: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectGroupBy: EventEmitter<string> = new EventEmitter<string>();
  @Output() unselectGroupBy: EventEmitter<void> = new EventEmitter();
  showGroupByBtn = true;
  selectedAsGroupBy = false;
  isOpen: boolean;

  constructor() {}

  ngOnChanges({ groupBy: groupByChange }: SimpleChanges): void {
    if (groupByChange) {
      this.setGroupBySelected();
    }
  }

  setGroupBySelected() {
    if (this.groupBy) {
      const inputParam =
        this.paramGroup &&
        this.paramGroup.get('name') &&
        this.paramGroup.get('name').value;
      if (inputParam === this.groupBy) {
        this.showGroupByBtn = true;
        this.selectedAsGroupBy = true;
      } else {
        this.showGroupByBtn = false;
        this.selectedAsGroupBy = false;
      }
    } else {
      this.showGroupByBtn = true;
      this.selectedAsGroupBy = false;
    }
  }

  onRemoveParam() {
    this.removeParam.emit(this.inputIndex);
  }

  selectType(type) {
    this.paramGroup.patchValue({ type });
    this.isOpen = false;
  }

  updateGroupByParam() {
    if (this.selectedAsGroupBy) {
      this.updateGroupBy();
    }
  }

  updateGroupBy() {
    const param = this.paramGroup.get('name');
    if (param.value && param.valid) {
      if (this.groupBy === param.value) {
        this.unselectGroupBy.emit();
      } else {
        this.selectGroupBy.emit(param.value);
      }
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
