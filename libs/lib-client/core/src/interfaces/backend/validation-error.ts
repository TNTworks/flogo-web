export interface ServerValidationError {
  meta: ErrorMetaData;
  detail: string;
  status: number;
  title: string;
}

interface ErrorMetaData {
  details: ValidationDetail[];
}

export interface ValidationDetail {
  keyword: string;
  dataPath: string;
  schemaPath: string;
  message: string;
  data?: any;
  params?: any;
}
