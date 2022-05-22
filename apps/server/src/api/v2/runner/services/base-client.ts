import * as got from 'got';
import { logger } from '../../../../common/logging';

export function createBaseClient() {
  return got.create({
    options: got.mergeOptions(got.defaults.options, { json: true }),
    methods: got.defaults.methods,
    handler: requestLogger,
  });
}

const tag = name => `[TestRunner][${name}]`;
const logRequest = req =>
  logger.info(tag('Request'), `${req.method} ${req.href}`, req.body);
const logResponse = res =>
  logger.info(
    tag('Response'),
    `${res.req.method} ${res.requestUrl} - ${res.statusCode} ${res.statusMessage} - `,
    res.body
  );
async function requestLogger(options, next) {
  logRequest(options);
  const response = await next(options);
  logResponse(response);
  return response;
}
