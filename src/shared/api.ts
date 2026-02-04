// client/src/shared/api.ts

export enum ApiErrorCode {
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: ApiError };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/**
 * Guard minimal (shape)
 * Ne valide pas le type de data (ça se fait via les guards métier).
 */
export function isApiResponse(obj: unknown): obj is ApiResponse<unknown> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "success" in obj &&
    typeof (obj as Record<string, unknown>).success === "boolean"
  );
}
