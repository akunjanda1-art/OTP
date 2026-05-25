/**
 * Standardized API error codes (PRD §9).
 */
export type ApiErrorCode =
  | "INVALID_API_KEY"
  | "INSUFFICIENT_BALANCE"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "OTP_NOT_FOUND"
  | "OTP_EXPIRED"
  | "INVALID_OTP"
  | "MAX_ATTEMPT_REACHED"
  | "PROVIDER_ERROR"
  | "CHANNEL_NOT_AVAILABLE"
  | "CLIENT_SUSPENDED"
  | "INTERNAL_ERROR";

const HTTP_STATUS: Record<ApiErrorCode, number> = {
  INVALID_API_KEY: 401,
  INSUFFICIENT_BALANCE: 402,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  OTP_NOT_FOUND: 404,
  OTP_EXPIRED: 400,
  INVALID_OTP: 400,
  MAX_ATTEMPT_REACHED: 429,
  PROVIDER_ERROR: 502,
  CHANNEL_NOT_AVAILABLE: 400,
  CLIENT_SUSPENDED: 403,
  INTERNAL_ERROR: 500,
};

export function apiError(
  code: ApiErrorCode,
  message?: string,
  extra: Record<string, unknown> = {}
) {
  return Response.json(
    {
      success: false,
      message: message ?? code.replaceAll("_", " ").toLowerCase(),
      error_code: code,
      ...extra,
    },
    { status: HTTP_STATUS[code] }
  );
}

export function apiOk<T extends Record<string, unknown>>(
  data: T,
  message = "OK"
) {
  return Response.json({ success: true, message, data });
}
