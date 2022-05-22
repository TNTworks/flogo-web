import {
  Component,
  Input,
  ViewChild,
  ContentChildren,
  QueryList,
  AfterContentInit,
  AfterViewInit,
  OnChanges,
  SimpleChange,
  Output,
  EventEmitter,
  OnInit,
  HostBinding,
} from '@angular/core';
import { TemplatePortalDirective } from '@angular/cdk/portal';
import { Overlay } from '@angular/cdk/overlay';
import { SelectPanelComponent } from '../select-panel/select-panel.component';
import { SelectOptionComponent } from '../select-option/select-option.component';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { SelectionService } from '../selection.service';
import { SelectEvent } from '../select-event';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { takeUntil } from 'rxjs/operators';

const ENABLER_KEYS = ['Enter', ' ', 'ArrowDown', 'Down', 'ArrowUp', 'Up'];
const NAVIGATION_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];

@Component({
  selector: 'flogo-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.less'],
  providers: [SelectionService],
})
export class SelectComponent
  implements AfterContentInit, AfterViewInit, OnChanges, OnInit {
  @Input() label: string;
  @Output() select = new EventEmitter<{ label: string; value: any }>();
  @Input() value: any;
  /**
   * Unique id in the form. Used for accesibility id generation
   */
  @Input() fieldId: string;

  @ViewChild(TemplatePortalDirective)
  contentTemplate: TemplatePortalDirective;

  @ViewChild(SelectPanelComponent, { static: true })
  panel: SelectPanelComponent;

  @ContentChildren(SelectOptionComponent) options: QueryList<SelectOptionComponent>;

  currentOption: SelectOptionComponent;
  activeDescendant: string;

  private keyManager: ActiveDescendantKeyManager<SelectOptionComponent>;
  private destroy$ = SingleEmissionSubject.create();

  constructor(protected overlay: Overlay, private selectionService: SelectionService) {
    this.selectionService.selection$.subscribe();
  }

  ngOnChanges({
    value: valueChange,
    fieldId: fieldIdChange,
  }: { [key in keyof this]?: SimpleChange }) {
    if (valueChange) {
      this.updateCurrentOption();
    }
    if (fieldIdChange) {
      this.selectionService.fieldId = this.fieldId;
    }
  }

  ngOnInit() {
    this.selectionService.selection$
      .pipe(takeUntil(this.destroy$))
      .subscribe(option => this.onSelectOption(option));
  }

  ngAfterContentInit() {
    this.options.changes.subscribe(() => {
      this.updateCurrentOption();
    });
    setTimeout(() => this.updateCurrentOption(), 0);
  }

  ngAfterViewInit() {
    this.keyManager = new ActiveDescendantKeyManager(this.options)
      .withVerticalOrientation()
      .withWrap();
    this.keyManager.change.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const activeItem = this.keyManager.activeItem;
      const optionId = activeItem ? activeItem.value : null;
      if (optionId) {
        this.activeDescendant = this.selectionService.prefixOptionId(optionId);
      } else {
        this.activeDescendant = undefined;
      }
    });
  }

  @HostBinding('class.is-open')
  get isOpen(): boolean {
    return this.panel && this.panel.isOpen;
  }

  open() {
    if (this.panel) {
      this.panel.open();
      this.keyManager.setActiveItem(undefined);
    }
  }

  openWithKeyNavigation() {
    this.panel.open();
    if (!this.options.length) {
      return;
    }

    if (this.currentOption) {
      this.keyManager.setActiveItem(this.currentOption);
    } else {
      this.keyManager.setFirstItemActive();
    }
  }

  close() {
    if (this.panel) {
      this.panel.close();
    }
  }

  onSelectOption(option: SelectEvent) {
    if (option) {
      this.select.emit({ value: option.value, label: option.label });
      this.close();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (ENABLER_KEYS.includes(event.key)) {
      if (!this.panel.isOpen) {
        this.openWithKeyNavigation();
        event.preventDefault();
        return;
      }

      if (!this.options.length) {
        event.preventDefault();
        return;
      }
    }

    if (event.key === 'Enter' || event.key === ' ') {
      this.onSelectOption(this.keyManager.activeItem);
      event.preventDefault();
    } else if (event.key === 'Escape' && this.panel.isOpen) {
      this.close();
      event.preventDefault();
    } else if (NAVIGATION_KEYS.includes(event.key)) {
      this.keyManager.onKeydown(event);
    }
  }

  private updateCurrentOption() {
    if (this.options) {
      this.currentOption = this.options.find(option => option.value === this.value);
    }
  }
}
