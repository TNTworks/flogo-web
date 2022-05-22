import { isArray, isString, isEmpty } from 'lodash';
import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChange,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { TAB } from '@angular/cdk/keycodes';

import {
  Observable,
  ReplaySubject,
  of as observableOf,
  concat,
  combineLatest,
  merge,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo-web/lib-client/core';

import { SettingValue } from '../settings-value';
import { FieldValueAccesorDirective } from '../settings/form-field/field.directive';
import {
  AUTOCOMPLETE_OPTIONS,
  AutoCompleteContentComponent,
  AutocompleteOptions,
} from './auto-complete-content.component';
import { filterSourceBy } from './filter-source-by';

const POPOVER_WIDTH = '344px';
const POPOVER_MAX_HEIGHT = '250px';
const DISTANCE_TO_VIEWPORT_MARGIN = 10;

const ensureObservable = value => {
  if (!value) {
    return observableOf([]);
  } else if (isArray(value)) {
    return observableOf(value);
  }
  return value;
};

const coerceSettingValueToString = (settingValue: SettingValue) =>
  isString(settingValue.viewValue)
    ? settingValue.viewValue
    : JSON.stringify(settingValue.viewValue);

@Directive({
  selector: '[fgTriggersConfigAutoComplete]',
})
export class AutoCompleteDirective implements OnChanges, OnInit, OnDestroy {
  @Input() formControl: AbstractControl;
  @Input() autoCompleteAllowedSource: Observable<string[]> | string[];
  @Input() autoCompleteVariablesSource: Observable<string[]> | string[];
  isOpen = false;

  popoverRef: OverlayRef;
  contentPortal: ComponentPortal<AutoCompleteContentComponent>;
  popoverComponentRef: ComponentRef<AutoCompleteContentComponent>;

  private variablesSources = new ReplaySubject<Observable<string[]>>(1);
  private allowedValuesSources = new ReplaySubject<Observable<string[]>>(1);
  private valueSources = new ReplaySubject<Observable<string[]>>(1);

  private filterTerm$: Observable<string>;
  private filteredAllowedValues$: Observable<string[]>;
  private filteredVariableOptions$: Observable<string[]>;

  private destroy$ = SingleEmissionSubject.create();

  constructor(
    private containerRef: ElementRef,
    private parentInjector: Injector,
    private overlay: Overlay,
    @Inject(DOCUMENT) private document: Document,
    @Optional() private valueAccessor: FieldValueAccesorDirective
  ) {}

  ngOnInit() {
    this.filterTerm$ = this.valueSources.pipe(
      switchMap<Observable<any>, any>(newValueSource => newValueSource),
      map((value: string | SettingValue) =>
        !isString(value) ? coerceSettingValueToString(value) : value
      ),
      shareReplay()
    );
    this.filteredAllowedValues$ = filterSourceBy(
      this.allowedValuesSources,
      this.filterTerm$
    ).pipe(takeUntil(this.destroy$));
    this.filteredVariableOptions$ = filterSourceBy(
      this.variablesSources,
      this.filterTerm$
    ).pipe(takeUntil(this.destroy$));
  }

  @HostListener('focus')
  onFocus() {
    this.open();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.popoverRef || !this.popoverRef.hasAttached) {
      return;
    }
    const clickTarget = <HTMLElement>event.target;
    const autocompleteTrigger = this.containerRef.nativeElement;
    if (
      clickTarget !== autocompleteTrigger &&
      this.popoverRef &&
      !this.popoverRef.overlayElement.contains(clickTarget)
    ) {
      this.close();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.popoverRef || !this.popoverRef.hasAttached) {
      return;
    }
    // tslint:disable-next-line:deprecation https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key#Browser_compatibility
    const keyCode = event.key !== undefined ? event.key : event.keyCode;
    if (keyCode === TAB) {
      this.close();
    }
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange }) {
    if (changes.formControl) {
      this.valueSources.next(
        concat(observableOf(this.formControl.value), this.formControl.valueChanges)
      );
    }
    if (changes.autoCompleteAllowedSource) {
      this.allowedValuesSources.next(ensureObservable(this.autoCompleteAllowedSource));
    }
    if (changes.autoCompleteVariablesSource) {
      this.variablesSources.next(ensureObservable(this.autoCompleteVariablesSource));
    }
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
    if (this.popoverRef) {
      this.close();
      this.popoverRef.dispose();
      this.popoverRef = null;
    }
  }

  private close() {
    if (this.popoverRef && this.popoverRef.hasAttached()) {
      this.popoverRef.detach();
    }
    if (this.contentPortal && this.contentPortal.isAttached) {
      this.contentPortal.detach();
    }
  }

  private open() {
    if (!this.contentPortal) {
      this.contentPortal = this.createPortal();
    }

    if (!this.popoverRef) {
      this.popoverRef = this.overlay.create({
        panelClass: 'overlay-flex',
        width: POPOVER_WIDTH,
        maxHeight: POPOVER_MAX_HEIGHT,
        scrollStrategy: this.getScrollStrategy(),
        positionStrategy: this.getPositionStrategy(),
      });
    }

    if (!this.popoverRef.hasAttached()) {
      this.popoverComponentRef = this.popoverRef.attach(this.contentPortal);
      // we need to manually trigger a position recalculation anytime the help section appears or dissapears because
      // it forces a change in the distribution of the container potentially clipping the autosuggestion list outside the view
      const reposition = () => setTimeout(() => this.popoverRef.updatePosition());
      merge(this.helpVisibilityChanges(), this.resultsContainerVisibilityChanges())
        .pipe(takeUntil(this.popoverRef.detachments()))
        .subscribe(reposition);
    }
  }

  private helpVisibilityChanges() {
    return this.filterTerm$.pipe(
      map(term => isEmpty(term)),
      distinctUntilChanged()
    );
  }

  private resultsContainerVisibilityChanges(): Observable<boolean> {
    const countResults = map((results: any[] | null) => (results ? results.length : 0));
    return combineLatest(
      this.filteredAllowedValues$.pipe(countResults),
      this.filteredVariableOptions$.pipe(countResults)
    ).pipe(
      map(([count1, count2]) => count1 + count2 === 0),
      distinctUntilChanged()
    );
  }

  private getScrollStrategy() {
    return this.overlay.scrollStrategies.reposition();
  }

  private getPositionStrategy() {
    return this.overlay
      .position()
      .flexibleConnectedTo(this.containerRef)
      .withFlexibleDimensions(true)
      .withViewportMargin(DISTANCE_TO_VIEWPORT_MARGIN)
      .withGrowAfterOpen(true)
      .withPush(false)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 6,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -6,
        },
      ]);
  }

  private optionSelected(option: string) {
    if (this.valueAccessor) {
      this.valueAccessor.update(option);
    } else {
      this.formControl.setValue(option);
    }
    this.close();
  }

  private createPortal() {
    const sources: AutocompleteOptions = {
      filterTerm: this.filterTerm$,
      allowedValues: this.filteredAllowedValues$,
      appVariables: this.filteredVariableOptions$,
      onOptionSelected: option => this.optionSelected(option),
    };
    const injector = new PortalInjector(
      this.parentInjector,
      new WeakMap<any, any>([[AUTOCOMPLETE_OPTIONS, sources]])
    );
    return new ComponentPortal(AutoCompleteContentComponent, null, injector);
  }
}
