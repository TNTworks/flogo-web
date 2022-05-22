export class FlogoError extends Error {
  public isOperational = true;
  public type: string;
  public details?: object;
  constructor(message, opts: { type?: string; details?: object; ctr?: Function } = {}) {
    super(message);
    this.name = 'FlogoError';
    this.stack = new Error().stack; // Optional

    this.isOperational = true;
    this.type = opts.type;

    Error.captureStackTrace(this, opts.ctr || FlogoError);

    if (opts.details) {
      this.details = Object.assign({}, opts.details);
    }
  }
}
