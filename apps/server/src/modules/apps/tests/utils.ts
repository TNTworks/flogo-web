const RealDate = Date;

export function mockDate(isoDate) {
  // @ts-ignore
  global.Date = class extends RealDate {
    // @ts-ignore
    constructor(...args) {
      // @ts-ignore
      if (args.length) {
        // @ts-ignore
        return new RealDate(...args);
      }
      return new RealDate(isoDate);
    }
  };
}

export function restoreDate() {
  global.Date = RealDate;
}
