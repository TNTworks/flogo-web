import { trigger, style, animate, transition } from '@angular/animations';

export const modalAnimate = [
  trigger('modalAnimate', [
    transition('void => *', [
      style({ transform: 'translateY(-100%)', opacity: 0 }),
      animate('250ms ease-in'),
    ]),
    transition('* => void', [
      animate('250ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 })),
    ]),
  ]),
];
