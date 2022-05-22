import {
  animate,
  animateChild,
  group,
  keyframes,
  query,
  sequence,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

const INITIAL_TRIGGER_POSITION = 'translate(-20px, 80px)';

export const configuratorAnimations = [
  trigger('configurationPanel', [
    transition('void => *', [
      group([
        query('.background', [
          style({ width: '88px', transform: 'translateY(167px)', opacity: 0 }),
          group([
            animate(
              '100ms ease-out',
              keyframes([
                style({ opacity: 0.5, offset: 0.3 }),
                style({ opacity: 1, offset: 1 }),
              ])
            ),
            animate(
              '200ms ease-out',
              style({
                transform: 'translate(0)',
              })
            ),
            animate(
              '200ms ease-in-out',
              style({
                width: '100%',
              })
            ),
          ]),
        ]),
        query('.js-trigger-element', [
          style({
            width: '56px',
            marginBottom: '17px',
            opacity: 0,
            transform: INITIAL_TRIGGER_POSITION,
          }),
          group([
            sequence([
              animate('50ms ease', style({ opacity: 1 })),
              group([
                animate('100ms ease', style({ marginBottom: '*' })),
                animate('250ms ease-in-out', style({ width: '*' })),
                animate(
                  '250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                  style({ transform: 'translate(0)' })
                ),
              ]),
            ]),
          ]),
        ]),
        query('@triggerConfiguratorLayoutElement', [animateChild()]),
      ]),
    ]),
    transition('* => void', [
      query('@triggerConfiguratorLayoutElement', [
        animate('80ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
      group([
        query('.js-trigger-element', [
          style('*'),
          sequence([
            animate(
              '200ms 50ms cubic-bezier(0.4, 0.0, 0.2, 1)',
              style({
                transform: INITIAL_TRIGGER_POSITION,
                width: '56px',
                marginBottom: '17px',
              })
            ),
            animate('150ms ease-in-out', style({ opacity: 0 })),
          ]),
        ]),
        query('.background', [
          style('*'),
          group([
            animate(
              '350ms 80ms ease-out',
              style({
                width: '88px',
                transform: 'translateY(167px)',
              })
            ),
            animate('150ms 200ms ease-out', style({ opacity: 0 })),
          ]),
        ]),
      ]),
    ]),
  ]),
  trigger('triggerConfiguratorLayoutElement', [
    state('*', style({ opacity: 1 })),
    transition('void => *', [
      style({ opacity: '*' }),
      animate(
        '300ms 200ms cubic-bezier(0.0, 0.0, 0.2, 1)',
        style({
          opacity: 1,
        })
      ),
    ]),
  ]),
];
