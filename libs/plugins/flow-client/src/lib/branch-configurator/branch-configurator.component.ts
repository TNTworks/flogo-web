import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  GraphNode,
  SingleEmissionSubject,
  InstalledFunctionSchema,
} from '@flogo-web/lib-client/core';
import { LanguageService } from '@flogo-web/lib-client/language';
import { MapperController, MapperControllerFactory } from '@flogo-web/lib-client/mapper';

import { FlowState } from '../core/state';
import { AppState } from '../core/state/app.state';
import { FlogoFlowService as FlowsService, ItemBranch, FLOGO_TASK_TYPE } from '../core';
import { getStateWhenConfigureChanges } from '../shared/configurator/configurator.selector';
import { getInputContext } from '../core/models/task-configure/get-input-context';
import * as FlowActions from '../core/state/flow/flow.actions';
import { createSaveBranchAction } from '../task-configurator/models/save-action-creator';
import { createBranchMappingContext } from './branch-configurator-context';
import * as FlowSelectors from '../core/state/flow/flow.selectors';
import { MapperTranslator, makeSnippet } from '../shared/mapper';

@Component({
  selector: 'flogo-flow-branch-configurator',
  styleUrls: ['branch-configurator.component.less'],
  templateUrl: 'branch-configurator.component.html',
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('250ms ease-in'),
      ]),
      transition('* => void', [
        animate('250ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class BranchConfiguratorComponent implements OnInit {
  itemId: string;
  inputScope: any[];
  isActive = false;
  isSaveDisabled = false;
  isEmpty = false;
  parentActivity: string;
  childActivity: string;
  inputMapperController: MapperController;
  private contextChange$ = SingleEmissionSubject.create();
  private inputMapperStateSubscription: Subscription;
  private destroy$ = SingleEmissionSubject.create();
  private installedFunctions: InstalledFunctionSchema[];
  constructor(
    private store: Store<AppState>,
    private _flowService: FlowsService,
    private translate: LanguageService,
    private mapperControllerFactory: MapperControllerFactory,
    private mapperTranslator: MapperTranslator
  ) {}

  ngOnInit() {
    this.store
      .pipe(
        getStateWhenConfigureChanges([FLOGO_TASK_TYPE.TASK_BRANCH]),
        takeUntil(this.destroy$)
      )
      .subscribe(state => {
        if (state) {
          this.initConfigurator(state);
        } else if (this.isActive) {
          this.close();
        }
      });
    this.store
      .pipe(select(FlowSelectors.getInstalledFunctions), takeUntil(this.destroy$))
      .subscribe(functions => {
        this.installedFunctions = functions;
      });
  }

  private initConfigurator(state: FlowState) {
    this.itemId = state.taskConfigure;
    this.ensurePreviousContextCleanup();
    this.contextChange$ = SingleEmissionSubject.create();
    const selectedItem = <ItemBranch>(
      cloneDeep(state.mainItems[this.itemId] || state.errorItems[this.itemId])
    );
    this.createActivityLinksInfo(state);
    this.isSaveDisabled = true;
    this.inputScope = getInputContext(this.itemId, state);
    const { propsToMap, mappings } = createBranchMappingContext(selectedItem.condition);
    this.resetInputMappingsController(propsToMap, this.inputScope, mappings);
    this.open();
  }

  private ensurePreviousContextCleanup() {
    if (this.contextChange$ && !this.contextChange$.isStopped) {
      this.contextChange$.emitAndComplete();
    }
  }

  private createActivityLinksInfo(state) {
    const selectedLinksGraph = <GraphNode>(
      cloneDeep(state.mainGraph.nodes[this.itemId] || state.errorGraph.nodes[this.itemId])
    );
    const selectedLinksParentItem = cloneDeep(
      state.mainItems[selectedLinksGraph.parents[0]] ||
        state.errorItems[selectedLinksGraph.parents[0]]
    );
    const selectedLinksChildItem = cloneDeep(
      state.mainItems[selectedLinksGraph.children[0]] ||
        state.errorItems[selectedLinksGraph.children[0]]
    );
    this.childActivity = selectedLinksChildItem ? selectedLinksChildItem.name : null;
    this.parentActivity = selectedLinksParentItem ? selectedLinksParentItem.name : null;
  }

  private resetInputMappingsController(propsToMap, inputScope, mappings) {
    if (this.inputMapperStateSubscription && !this.inputMapperStateSubscription.closed) {
      this.inputMapperStateSubscription.unsubscribe();
    }
    this.inputMapperController = this.mapperControllerFactory.createController(
      propsToMap,
      inputScope,
      mappings,
      this.installedFunctions,
      makeSnippet,
      this.mapperTranslator
    );
    this.inputMapperStateSubscription = this.inputMapperController.state$
      .pipe(skip(1), takeUntil(this.contextChange$))
      .subscribe(state => {
        this.isEmpty = !state.mappings.condition;
        this.isSaveDisabled = !state.isDirty || !state.isValid || this.isEmpty;
      });
  }

  private open() {
    this.isActive = true;
  }
  private close() {
    if (!this.contextChange$.closed) {
      this.contextChange$.emitAndComplete();
    }
    this.isActive = false;
  }

  save() {
    createSaveBranchAction(this.store, {
      id: this.itemId,
      condition: this.inputMapperController.getCurrentState().mappings.condition
        .expression,
    }).subscribe(action => {
      this.store.dispatch(action);
      this.isActive = false;
    });
  }

  cancel() {
    this.store.dispatch(new FlowActions.CancelItemConfiguration());
  }
}
