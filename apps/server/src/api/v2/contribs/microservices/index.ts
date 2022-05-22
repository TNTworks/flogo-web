import { Container } from 'inversify';
import send from 'koa-send';

import { ContributionManager } from '../../../../modules/contributions';
import {
  getContribInstallationController as getInstallationController,
  EngineProcessDirector,
} from '../../../../modules/engine';
import { config } from '../../../../config';
import { logger } from '../../../../common/logging';
import { ERROR_TYPES, ErrorManager } from '../../../../common/errors';
import { install as installContributionToEngine } from '../../../../modules/contrib-installer/microservice';

const CONTRIBUTION_TYPE = new Map([
  ['activity', 'flogo:activity'],
  ['trigger', 'flogo:trigger'],
  ['function', 'flogo:function'],
  ['connection', 'flogo:connection'],
]);

export function contribs(router, container: Container) {
  const engineProcessDirector = container.get(EngineProcessDirector);
  router.get(`/contributions/microservices`, listContributions);
  router.post(`/contributions/microservices`, installContribution(engineProcessDirector));
  router.get(`/contributions/microservices/icons/:ref(.*)`, getIcon);
}

/**
 * Get all the contributions installed in the engine. The request have following optional query params:
 * filter[name] {string} name of the contribution which needs to be fetched.
 * filter[ref] {string} reference of the contribution which needs to be fetched.
 * filter[type] {string} can contain 'activity' or 'trigger' to fetch all contributions of one type.
 *                       If nothing provided, all the contributions for a microservices will be returned
 *
 */
async function listContributions(ctx) {
  const searchTerms: { name?: string; ref?: string; shim?: string; type?: string } = {};
  const filterName = ctx.request.query['filter[name]'];
  const filterRef = ctx.request.query['filter[ref]'];
  const filterShim = ctx.request.query['filter[shim]'];
  const filterType = CONTRIBUTION_TYPE.get(ctx.request.query['filter[type]']);

  if (filterName) {
    searchTerms.name = filterName;
  }
  if (filterRef) {
    searchTerms.ref = filterRef;
  }
  if (filterShim) {
    searchTerms.shim = filterShim;
  }
  if (filterType) {
    searchTerms.type = filterType;
  }

  const foundContributions = await ContributionManager.find(searchTerms);
  ctx.body = {
    data: foundContributions || [],
  };
}

async function getIcon(ctx) {
  const ref = ctx.params.ref;
  if (!ref) {
    // in theory this should never happen because if not ref provided then
    // it won't match url `:ref/icon` and this handler won't be called
  }

  const iconPath = await ContributionManager.getIconPathByRef(ref);
  if (!iconPath) {
    throw ErrorManager.createRestNotFoundError('Contribution icon not found', {
      title: 'Icon not found',
      detail: 'No icon found for specified contribution ref',
      value: ref,
    });
  }

  await send(ctx, iconPath, { root: process.env.GOPATH });
}

/**
 * Install new Trigger or Activity to the engine. The POST request need to have the following properties in the body:
 * url {string} Url to the contribution to be installed
 * type {string} Type of contribution to be installed.
 *
 */
function installContribution(engineProcess: EngineProcessDirector) {
  return async (ctx, next) => {
    ctx.req.setTimeout(0, null);
    const url = ctx.request.body.url;

    if (!url) {
      throw ErrorManager.createRestError('Unknown type of contribution', {
        type: ERROR_TYPES.ENGINE.INSTALL,
        message: 'Unknown type of contribution',
        params: {
          body:
            'Should be in the pattern: {"url": "path_to_contribution", "type": "activity"}',
        },
      });
    }

    logger.info(`[log] Install : '${url}'`);
    const installController = await getInstallationController(
      config.defaultEngine.path,
      (contribRef, engine) => installContributionToEngine(contribRef, engine),
      engineProcess
    );

    const result = await installController.install(url);
    ctx.body = { data: { ...result, originalUrl: url } };

    next();
  };
}
