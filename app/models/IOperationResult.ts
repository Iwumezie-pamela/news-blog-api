export type OperationResult<T = undefined> = {
  success: boolean;
  data?: T;
  errorMessage?: string;
  errorCode?: string;
};