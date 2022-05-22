export enum EnumMapperErrorCodes {
  M_INVALID_IDENTIFIER = 4000,
  M_INVALID_FUNCTION,
  M_INVALID_TYPE,
  M_INVALID_SYNTAX,
}

/**
 *  Mapping Error Code to Error Messages
 *  load messages from file/resource
 */
export interface IMappingError {
  errorCode: EnumMapperErrorCodes;
  errorMsg: string;

  /**
   * returns errorcode
   */
  getErrorCode(): EnumMapperErrorCodes | number;

  getErrorMessage(): string;

  toString(): string;
}
