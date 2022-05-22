import { isEqual } from 'lodash';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  HostBinding,
} from '@angular/core';

import {
  BUTTON_INSERT_CLASS,
  DiagramSelection,
  DiagramSelectionType,
  SELECTED_INSERT_TILE_CLASS,
} from '@flogo-web/lib-client/diagram';

import { AddActivityService } from './add-activity.service';

const BRANCH_ANIMATION_DURATION = 300;

@Directive({
  selector: '[fgAddStage]',
})
export class AddStageDirective implements OnInit, OnChanges, OnDestroy {
  @Input() currentSelection: DiagramSelection;

  @HostBinding('style.opacity') buttonOpacity: 1 | undefined = undefined;

  constructor(private el: ElementRef, private addStageService: AddActivityService) {}

  ngOnInit() {
    this.addStageService.startSubscriptions();
  }

  ngOnChanges({ currentSelection: selection }: SimpleChanges) {
    if (selection && !selection.firstChange) {
      const currentSelection = selection.currentValue;
      const previousSelection = selection.previousValue;
      /*************
       * The popover is closed under the following conditions:
       *    1. If there is no currentSelection (when clicked outside)
       *    2. If the current selection is not of type Insert
       *    3. If the current selection and the previous selection are of Insert type and with the same parent taskId
       */
      if (
        !currentSelection ||
        currentSelection.type !== DiagramSelectionType.Insert ||
        isEqual(currentSelection, previousSelection)
      ) {
        setTimeout(() => {
          this.buttonOpacity = undefined;
          this.addStageService.close();
        }, 0);
      } else {
        setTimeout(() => {
          this.buttonOpacity = 1;
          const selectedInsertTile = this.el.nativeElement.querySelector(
            `.${SELECTED_INSERT_TILE_CLASS} .${BUTTON_INSERT_CLASS}`
          );
          this.addStageService.open(selectedInsertTile, currentSelection.taskId);
        }, BRANCH_ANIMATION_DURATION);
      }
    }
  }

  ngOnDestroy() {
    this.addStageService.closeAndDestroy();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const popoverRef = this.addStageService.popoverReference;
    const keepActive = this.addStageService.shouldKeepPopoverActive;
    if (!keepActive && popoverRef && popoverRef.hasAttached()) {
      const clickTarget = <HTMLElement>event.target;
      const overlayHost = popoverRef.hostElement;
      if (clickTarget !== overlayHost && !overlayHost.contains(clickTarget)) {
        this.addStageService.cancel();
      }
    }
  }
}
