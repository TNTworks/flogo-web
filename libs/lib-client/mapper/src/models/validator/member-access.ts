import { ILocation } from '../expr-visitor';

export interface MemberAccess {
  type: 'property' | 'accessor';
  name: string;
  location: ILocation;
}
