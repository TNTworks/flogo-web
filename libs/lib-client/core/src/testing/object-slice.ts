// todo: jasmine.arrayContaining. We need something like jasmine.ArrayContaining<T[P][0]> but right now typescript complains with that
// as a workaround force typecast Partial<T>jasmine.arrayContains<TYPE>()
export type ObjectSlice<T> = {
  [P in keyof T]?: Partial<T[P]> | jasmine.ObjectContaining<T[P]> | T[P];
};
