import * as Koa from 'koa';

export interface BuildOptions {
  compile: { os?: string; arch?: string };
}

export type BuilderFn = (
  ctx: Koa.Context,
  options: BuildOptions
) => Promise<{ fileName: string; content: any }>;

export function buildHandler(performBuild: BuilderFn): Koa.Middleware {
  return async function build(context) {
    context.req.setTimeout(0, <any>undefined);
    const options = getCompileOptions(context);
    const { fileName, content } = await performBuild(context, options);
    context.attachment(fileName);
    context.body = content;
  };
}

function getCompileOptions(context: Koa.Context) {
  const options: BuildOptions = { compile: {} };
  options.compile.os = context.query.os || null;
  options.compile.arch = context.query.arch || null;
  return options;
}
