import { fromPairs, isArray, isObjectLike, isEmpty } from 'lodash';
import {
  Component,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { fromEvent, EMPTY, of } from 'rxjs';
import {
  switchMap,
  debounceTime,
  takeUntil,
  map,
  filter,
  catchError,
} from 'rxjs/operators';
import { Router } from '@angular/router';

import { Resource } from '@flogo-web/core';
import {
  ActivatedResourceRoute,
  ResourceService,
  SingleEmissionSubject,
  FlowGraph,
  Dictionary,
  NodeType,
  GraphNode,
} from '@flogo-web/lib-client/core';
import { isString } from 'util';


const SAMPLE_DATA = `{
  "tasks": [{
     "id": "root",
     "name": "My Root task"
  }]
}`;

@Component({
  selector: '<%= dasherize(prefix) %>-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less'],
})
export class MainComponent implements AfterViewInit, OnDestroy {
  public editData: string;
  // replace  <any> with your own resource interface
  public resource: Resource<any>;
  public isSaving = false;
  @ViewChild('resourceEdit', { static: true }) public textArea: ElementRef;
  public renderableResource: FlowGraph;
  public error: string;

  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private activatedResource: ActivatedResourceRoute,
    private resourceApiService: ResourceService,
    private router: Router
  ) {
    this.resource = this.activatedResource.resource;
    if (isEmpty(this.resource.data)) {
      this.editData = SAMPLE_DATA;
    } else {
      this.editData = JSON.stringify(this.resource.data, null, 1);
    }
    this.renderResource(this.editData);
  }

  back() {
    this.router.navigate(['/apps', (<any>this.resource).appId]);
  }

  save(editData) {
    try {
      this.isSaving = true;
      const data = JSON.parse(editData);
      this.resourceApiService
        .updateResource(this.resource.id, { ...this.resource, data })
        .pipe(switchMap(() => this.resourceApiService.getResource(this.resource.id)))
        .subscribe(r => (this.resource = r));
    } catch (e) {
      console.log('Could not parse', this.editData);
    }
    this.isSaving = false;
  }

  ngAfterViewInit(): void {
    this.observeTextAreaChanges();
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  private renderResource(value) {
    const { parsedValue, error } = parseValueToJson(value);

    if (!parsedValue) {
      this.error = error;
      return;
    }

    const rootId = parsedValue.tasks[0].id;
    this.renderableResource = {
      rootId: parsedValue.tasks[0].id,
      nodes: toDiagramModel(rootId, parsedValue),
    };
  }

  private observeTextAreaChanges() {
    fromEvent(this.textArea.nativeElement, 'input')
      .pipe(
        debounceTime(500),
        takeUntil(this.ngDestroy$),
        map((e: any) => e.target.value),
        switchMap(value => {
          try {
            return of(JSON.parse(value));
          } catch (e) {
            this.error = 'Malformed data (not a valid json?)';
            return EMPTY;
          }
        }),
        catchError(e => {
          console.error(e);
          return EMPTY;
        }),
        // ignore empty values
        filter(Boolean)
      )
      .subscribe(
        value => {
          this.error = null;
          this.renderableResource = null;
          this.renderResource(value);
        },
        () => {}
      );
  }
}

function parseValueToJson(
  value: unknown
): {
  error?: string;
  parsedValue?: any;
} {
  let data;
  if (isString(value)) {
    try {
      data = JSON.parse(value as string);
    } catch (e) {
      return { error: 'Malformed data (not a valid json?)' };
    }
  } else if (isObjectLike(value)) {
    data = value;
  } else {
    return { parsedValue: null };
  }

  if (!data || !data.tasks || !data.tasks[0]) {
    return { parsedValue: null };
  } else if (data.tasks[0] && !data.tasks[0].id) {
    return { error: 'Missing id for root task' };
  }
  return { parsedValue: data };
}

function toDiagramModel(rootId, data): FlowGraph['nodes'] {
  const nodes: FlowGraph['nodes'] =
    !isEmpty(data.tasks) && isArray(data.tasks)
      ? fromPairs(
          data.tasks
            .filter(t => isObjectLike(t) && t.id)
            .map(t => [
              t.id,
              {
                id: t.id,
                title: t.name || 'No name',
                type: NodeType.Task,
                children: [],
                parents: [],
                status: {},
                features: {
                  final: false,
                  canHaveChildren: true,
                },
              } as GraphNode,
            ])
        )
      : {};

  const links: Dictionary<any> =
    !isEmpty(data.links) && isArray(data.links)
      ? data.links.filter(l => isObjectLike(l) && l.from && l.to)
      : [];

  let branchIdCount = 0;
  links.forEach(link => {
    const fromNode = nodes[link.from];
    const toNode = nodes[link.to];
    if (!fromNode || !toNode) {
      return;
    }

    if (link.type === 'expression') {
      const branchId = `branch__${branchIdCount++}`;
      nodes[branchId] = {
        id: branchId,
        type: NodeType.Branch,
        children: [toNode.id],
        parents: [fromNode.id],
        status: {},
        features: {},
      };
      fromNode.children.push(branchId);
      toNode.parents.push(branchId);
    } else {
      fromNode.children.push(toNode.id);
      toNode.parents.push(fromNode.id);
    }
  });

  return nodes;
}
