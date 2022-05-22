export interface ValidationErrorDetail {
  keyword: string;
  dataPath: string;
  schemaPath?: string;
  message?: string;
  data?: any;
  params?: any;
}
