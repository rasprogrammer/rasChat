export interface ApiSuccess<T = any> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message?: string;
  data?: null;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;