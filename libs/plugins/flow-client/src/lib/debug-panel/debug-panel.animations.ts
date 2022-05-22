import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata,
  group,
  query,
  animateChild,
  keyframes,
} from '@angular/animations';
import {
  MINIMIZED_TRANSFORM,
  OPEN_DELAY,
  OPENED_HEIGHT,
  MINIMIZED_WIDTH,
  MINIMIZED_LEFT_DISTANCE,
  CLOSE_WRAPPER_ANIMATION_DURATION,
} from './variables';

export const debugPanelAnimations: {
  readonly panelContainer: AnimationTriggerMetadata;
  readonly panel: AnimationTriggerMetadata;
  readonly wrappedContent: AnimationTriggerMetadata;
} = {
  wrappedContent: trigger('wrappedContentState', [
    state('open', style({ 'margin-bottom': '40vh' })),
    state('closed', style({ 'margin-bottom': 0 })),
    transition(
      'open => closed',
      animate(`${CLOSE_WRAPPER_ANIMATION_DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1)`)
    ),
    transition('closed => open', animate(`300ms 100ms cubic-bezier(0.25, 0.8, 0.25, 1)`)),
  ]),
  panelContainer: trigger('debugPanelContainerState', [
    state(
      'open',
      style({
        transform: 'translate3d(0, 0, 0)',
        zIndex: 3,
      })
    ),
    state(
      'closed',
      style({
        transform: `translate3d(${MINIMIZED_LEFT_DISTANCE}, 0, 0)`,
        zIndex: 3,
      })
    ),
    transition('closed => open', [
      group([
        animate(
          `${OPEN_DELAY} cubic-bezier(0.25, 0.8, 0.25, 1)`,
          style({ transform: 'translate3d(0, 0, 0)' })
        ),
        query('@debugPanelState', animateChild()),
      ]),
      animate(
        `${OPEN_DELAY} cubic-bezier(0.25, 0.8, 0.25, 1)`,
        style({ transform: 'translate3d(0, 0, 0)' })
      ),
    ]),
    transition('open => closed', [
      group([
        animate(
          `300ms 100ms cubic-bezier(0.25, 0.8, 0.25, 1)`,
          style({ transform: `translate3d(${MINIMIZED_LEFT_DISTANCE}, 0, 0)` })
        ),
        query('@debugPanelState', animateChild()),
      ]),
    ]),
  ]),
  panel: trigger('debugPanelState', [
    state(
      'open',
      style({
        width: '100%',
        transform: 'translate3d(0, -100%, 0)',
        height: OPENED_HEIGHT,
      })
    ),
    transition('* => open', [
      style({ overflow: 'hidden', height: OPENED_HEIGHT, width: '*' }),
      query('.js-debug-panel-content', style({ opacity: 0 })),
      animate(
        `${OPEN_DELAY} cubic-bezier(0.25, 0.8, 0.25, 1)`,
        keyframes([
          style({ width: '*', transform: MINIMIZED_TRANSFORM }),
          style({ width: '100%', transform: `translate3d(0, -50%, 0)` }),
          style({ transform: 'translate3d(0, -100%, 0)' }),
        ])
      ),
      query('.js-debug-panel-content', animate('100ms', style({ opacity: 1 }))),
    ]),
    transition('open => *', [
      style({
        overflow: 'hidden',
        height: OPENED_HEIGHT,
        width: '*',
        transform: '*',
        opacity: 1,
      }),
      query('.js-debug-panel-content', animate('100ms', style({ opacity: 0 }))),
      group([
        animate(
          '350ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({
            width: MINIMIZED_WIDTH,
            transform: MINIMIZED_TRANSFORM,
          })
        ),
        animate('100ms 250ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ]),
};
