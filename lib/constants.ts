// --- AUTH ---
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 72;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;

// --- ROUTES ---
export const HOME_ROUTE = "/";
export const SIGNIN_ROUTE = "/signin";
export const SIGNUP_ROUTE = "/signup";
export const AUTH_CALLBACK_ROUTE = "/auth/callback";
export const VERIFY_EMAIL_ROUTE = "/auth/verify-email";
export const DASHBOARD_ROUTE = "/dashboard";

export const PUBLIC_ROUTES = [
  HOME_ROUTE,
  SIGNIN_ROUTE,
  SIGNUP_ROUTE,
  AUTH_CALLBACK_ROUTE,
  VERIFY_EMAIL_ROUTE,
];
