import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/updateSession";

import {
  PUBLIC_ROUTES,
  SIGNIN_ROUTE,
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  SIGNUP_ROUTE,
} from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  const isProtectedRoutes = !PUBLIC_ROUTES.includes(pathname);

  if (!user && isProtectedRoutes) {
    const url = request.nextUrl.clone();
    url.pathname = SIGNIN_ROUTE;
    return NextResponse.redirect(url);
  }

  if (user && [HOME_ROUTE, SIGNIN_ROUTE, SIGNUP_ROUTE].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = DASHBOARD_ROUTE;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.|api/).*)", "/"],
};
