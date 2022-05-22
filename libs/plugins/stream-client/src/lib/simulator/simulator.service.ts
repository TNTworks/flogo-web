import * as io from 'socket.io-client';
import {
  Observable,
  fromEvent,
  Subject,
  concat,
  of,
  EMPTY,
  pipe,
  BehaviorSubject,
} from 'rxjs';
import {
  takeUntil,
  shareReplay,
  filter,
  scan,
  windowWhen,
  switchMap,
  tap,
  take,
  map,
} from 'rxjs/operators';
import { isObject, isArray, get, isEmpty } from 'lodash';

import { Injectable, OnDestroy, Inject } from '@angular/core';
import { StreamSimulation } from '@flogo-web/core';
import { HOSTNAME, SingleEmissionSubject } from '@flogo-web/lib-client/core';

export type SimulationActionType = 'start' | 'restart' | 'resume' | 'pause' | 'stop';

export interface PipelineEvent {
  type: PipelineEventType;
  pipelineId: string;
  instanceId: string;
  stageId?: string;
  data: object;
}

type EventPhase = 'started' | 'finished';
type DataCacheGroup = { [key in EventPhase]: PipelineEvent[] };

interface DataCache {
  [id: string]: DataCacheGroup;
}
type NormalizerFn = (data) => any;

const pluckData = d => d.data;
export const ROOT_PIPELINE_ID = '::ROOT_PIPELINE::';

const lastCachedData = (id: string, phase: EventPhase) =>
  pipe(
    take(1),
    switchMap((cache: DataCache) => {
      const cachedEvents = cache && cache[id] && cache[id][phase];
      return cachedEvents ? of(cachedEvents.map(pluckData)) : EMPTY;
    })
  );

const focusedData = (id: string | number, phase: EventPhase) =>
  pipe(
    filter((event: PipelineEvent) => {
      const phaseInfo = getPhaseInfo(event);
      return `${phaseInfo.id}` === `${id}` && phaseInfo.phase === phase;
    }),
    map(event => [pluckData(event)])
  );

export enum PipelineEventType {
  PipelineStarted = 'pipeline-started',
  PipelineFinished = 'pipeline-finished',
  StageStarted = 'stage-started',
  StageFinished = 'stage-finished',
}

@Injectable({
  providedIn: 'root',
})
export class SimulatorService {
  private socket: SocketIOClient.Socket;
  public rawEvents$: Observable<PipelineEvent>;
  public status$: Observable<StreamSimulation.ProcessStatus>;
  public dataEvents$: Observable<PipelineEvent>;
  public start$ = new Subject<void>();
  private currentCacheSrc = new BehaviorSubject<DataCache>({});
  private destroy$ = SingleEmissionSubject.create();

  constructor(@Inject(HOSTNAME) private hostname: string) {
    this.init();
  }

  init() {
    this.socket = io.connect(`${this.hostname}/stream-simulator`);
    this.status$ = fromEvent(this.socket, 'simulator-status');
    this.rawEvents$ = fromEvent(this.socket, 'data');

    const normalizers = new Map<string, Map<EventPhase, NormalizerFn>>();
    this.dataEvents$ = this.rawEvents$.pipe(
      windowWhen(() => this.start$),
      tap(() => normalizers.clear()),
      switchMap(group$ =>
        group$.pipe(
          switchMap(event => {
            if (checkIsSpecialDemoEvent(event)) {
              return handleSpecialDemoEvent(event);
            } else {
              return of(event);
            }
          }),
          map(event => normalizeData(normalizers, event)),
          filter(event => !isEmpty(event.data))
        )
      ),
      shareReplay(1),
      takeUntil(this.destroy$)
    );
    this.dataEvents$
      .pipe(
        windowWhen(() => this.start$),
        switchMap(group$ => group$.pipe(scan(accumulateDataCache, {}))),
        takeUntil(this.destroy$)
      )
      .subscribe(this.currentCacheSrc);
  }

  clear() {
    console.log('disconnecting');
    this.destroy$.emitAndComplete();
    this.socket.disconnect();
  }

  start(
    pipelineId: string,
    simulationDataFile: string,
    mappingsType: StreamSimulation.InputMappingType
  ) {
    this.emitAction('start', {
      pipelineId,
      simulationDataFile,
      mappingsType,
    });
    this.start$.next();
  }

  stop() {
    this.emitAction('stop');
  }

  pause() {
    this.emitAction('pause');
  }

  resume() {
    this.emitAction('resume');
  }

  observeData(id: any, type: EventPhase): Observable<object[]> {
    return concat(
      this.currentCacheSrc.pipe(lastCachedData(id, type)),
      this.dataEvents$.pipe(focusedData(id, type))
    );
  }

  private emitAction(type: SimulationActionType, data?: any) {
    this.socket.emit('simulator-action', {
      type,
      data,
    });
  }
}

function normalizeData(
  rootNormalizers: Map<string, Map<EventPhase, NormalizerFn>>,
  event: PipelineEvent
): PipelineEvent {
  const normalize = getOrCreateNormalizer(rootNormalizers, event);
  return {
    ...event,
    data: normalize(event.data),
  };
}

function getOrCreateNormalizer(
  rootNormalizers: Map<string, Map<EventPhase, NormalizerFn>>,
  event: PipelineEvent
): NormalizerFn {
  const phaseInfo = getPhaseInfo(event);
  let stageNormalizers = rootNormalizers.get(phaseInfo.id);
  if (!stageNormalizers) {
    stageNormalizers = new Map<EventPhase, NormalizerFn>();
    rootNormalizers.set(phaseInfo.id, stageNormalizers);
  }
  let normalizer = stageNormalizers.get(phaseInfo.phase);
  if (!normalizer && event.data) {
    normalizer = makeNormalizer(event);
    stageNormalizers.set(phaseInfo.phase, normalizer);
  } else if (!normalizer) {
    normalizer = identity;
  }
  return normalizer;
}

function checkIsSpecialDemoEvent(event: PipelineEvent) {
  const data = event.data as any;
  return isObject(data) && data.hasOwnProperty('result') && data.hasOwnProperty('report');
}

const replaceEventData = event => data => ({ ...event, data });
function handleSpecialDemoEvent(event) {
  const data = event.data as any;
  if (isArray(data.result) && data['result'].length > 0) {
    return of(...data.result.map(replaceEventData(event)));
  } else {
    return EMPTY;
  }
}

function accumulateDataCache(cache: DataCache, event: PipelineEvent) {
  const { id, phase } = getPhaseInfo(event);
  return saveCacheEntry(cache, id, phase, event);
}

function getPhaseInfo(event: PipelineEvent): { id: string; phase: EventPhase } {
  let id;
  let phase: EventPhase;
  switch (event.type) {
    case PipelineEventType.PipelineStarted:
      id = ROOT_PIPELINE_ID;
      phase = 'started';
      break;
    case PipelineEventType.PipelineFinished:
      id = ROOT_PIPELINE_ID;
      phase = 'finished';
      break;
    case PipelineEventType.StageStarted:
      id = event.stageId;
      phase = 'started';
      break;
    case PipelineEventType.StageFinished:
      id = event.stageId;
      phase = 'finished';
      break;
  }
  return { id, phase };
}

function getOrCreateCacheGroup(cache: DataCache, id: string) {
  let entry = cache[id];
  if (!entry) {
    entry = {
      started: [],
      finished: [],
    };
    cache[id] = entry;
  }
  return entry;
}

const wrapPrimitive = data => ({ data });
const identity = i => i;

function makeNormalizer(event: PipelineEvent): (data) => any {
  if (!isObject(event.data)) {
    return wrapPrimitive;
  }
  const firstKey = getFirstKey(event.data);
  if (isObject(event.data[firstKey])) {
    return objectNormalizer(event.data[firstKey], [firstKey]);
  } else {
    return identity;
  }
}

function objectNormalizer(fromObject: object, keys = []) {
  const firstKey = getFirstKey(fromObject);
  if (isObject(fromObject[firstKey])) {
    return objectNormalizer(fromObject[firstKey], [...keys, firstKey]);
  } else {
    return extractPath(keys);
  }
}

const extractPath = (keys: string[]) => data => get(data, keys, null);

function getFirstKey(fromObject: object) {
  for (const key in fromObject) {
    if (fromObject.hasOwnProperty(key)) {
      return key;
    }
  }
}

function saveCacheEntry(
  cache: DataCache,
  entityId: string,
  eventPhase: EventPhase,
  event: PipelineEvent
) {
  const group = getOrCreateCacheGroup(cache, entityId);
  const entries = group[eventPhase];
  entries.push(event);
  return cache;
}
