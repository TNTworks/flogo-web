import {
  animate,
  group,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';

const shrink = animate(
  '0.3s ease-out',
  keyframes([
    style({ width: '*', offset: 0 }),
    style({ width: '*', offset: 0.6 }),
    style({ width: 0, offset: 1 }),
  ])
);

export const rowAnimations = [
  trigger('tileGeneric', [
    transition(':leave', [
      style({ transform: 'scale(1)', opacity: 1, width: '*' }),
      shrink,
    ]),
  ]),
  trigger('tileTask', [
    transition(':enter', [
      style({ transform: 'scale(0.7)', opacity: 0 }),
      animate(
        '0.3s cubic-bezier(.8,-0.6,0.2,1.5)',
        style({ transform: 'scale(1)', opacity: 1 })
      ),
    ]),
    transition(':leave', [
      style({ transform: 'scale(1)', opacity: 1, width: '*' }),
      group([
        animate('0.15s ease-in', style({ transform: 'scale(0.7)', opacity: 0 })),
        shrink,
      ]),
    ]),
  ]),
  trigger('tileInsert', [
    transition(':leave', [
      style({ opacity: 1, position: 'relative', zIndex: '-1' }),
      animate('0s cubic-bezier(.8,-0.6,0.2,1.5)', style({ opacity: 0 })),
    ]),
  ]),
];
