import { ErrorCodes } from '@flogo-web/lib-server/core';

export const ERROR_TYPES = {
  COMMON: {
    ...ErrorCodes.Common,
    BAD_SYNTAX: 'BadSyntax',
    REST_API: 'RestApiError',
    VALIDATION: 'ValidationError',
    ALREADY_EXISTS: 'AlreadyExists',
    NOT_FOUND: 'NotFoundError',
    HAS_SUBFLOW: 'HasSubflow',
  },
  ENGINE: {
    NOTHANDLED: 'CaseNotHandled',
    BACKUP: 'TakingBackupFailed',
    INSTALL: 'CouldNotInstall',
    BUILD: 'EngineBuildFailed',
    STOP: 'EngineStopFailed',
    START: 'EngineStartFailed',
    SYNC: 'DatabaseSyncFailed',
  },
};
