import { config } from '../../../../config/app-config';
import { createBaseClient } from './base-client';

// keyof config
type ServiceName = 'stateServer' | 'processServer' | 'engine';

export interface Service {
  client: Client;
  getUrl: () => string;
}

export interface Response {
  body?: any;
  statusCode: number;
}
export type Client = Record<
  'get' | 'post' | 'put' | 'patch' | 'delete',
  (url: string, options?: { body: any }) => Promise<Response>
>;

export const Services = {
  stateServer: service('stateServer'),
  flowsServer: service('processServer'),
  engine: service('engine'),
};

interface UrlInfo {
  protocol: string;
  host: string;
  port?: string;
  basePath?: string;
}

const serviceConfig = (serviceName: ServiceName): UrlInfo => config[serviceName];
function service(serviceName: ServiceName): Service {
  return {
    get client() {
      return createClient(serviceConfig(serviceName));
    },
    getUrl: () => buildUrl(serviceConfig(serviceName)),
  };
}

const baseClient = createBaseClient();
function createClient(urlConfig: UrlInfo) {
  return baseClient.extend({
    baseUrl: buildUrl(urlConfig),
  });
}

function buildUrl(urlInfo: UrlInfo) {
  let url = urlInfo.protocol + '://' + urlInfo.host;
  if (urlInfo.port) {
    url += ':' + urlInfo.port;
  }
  if (urlInfo.basePath) {
    url += urlInfo.basePath;
  }
  return url;
}
