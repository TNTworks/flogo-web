import { transition, style, animate } from '@angular/animations';

export const OpenCloseMenuAnimation = [
  transition('void => *', [style({ opacity: 0 }), animate('100ms ease-out')]),
  transition('* => void', [animate('100ms ease-in', style({ opacity: 0 }))]),
];
