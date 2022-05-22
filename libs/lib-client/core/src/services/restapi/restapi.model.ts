export interface ApiError {
  status: number;
  code: string;
  title: string;
  detail: string;
  meta: {
    [key: string]: any;
  };
}
