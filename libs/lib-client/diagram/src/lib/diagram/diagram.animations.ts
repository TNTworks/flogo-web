import {
  animate,
  animateChild,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const diagramAnimations = [
  trigger('list', [
    transition(':enter', [
      query('@diagramRow', stagger(-60, animateChild()), { optional: true }),
    ]),
  ]),
  trigger('diagramRow', [
    transition(':enter', [
      style({
        transform: 'translate(-10px, -20px)',
        opacity: 0,
        height: 0,
        padding: 0,
      }),
      animate(
        '0.4s cubic-bezier(.8,-0.6,0.2,1.5)',
        style({
          transform: 'translate(0, 0)',
          opacity: 1,
          height: '*',
          padding: '*',
        })
      ),
    ]),
    transition(':leave', [
      style({ transform: 'translate(0, 0) scale(1)', opacity: 1, height: '*' }),
      animate(
        '0.3s cubic-bezier(0.4, 0.0, 1, 1)',
        // style({ transform: 'translate(-40px, -30px) scale(0.95)', opacity: 0, height: 0, padding: 0 }))
        style({
          transform: 'translate(-40px, -30px) scale(0.95)',
          opacity: 0,
          height: 0,
        })
      ),
    ]),
  ]),
];
