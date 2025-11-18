import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "./lib/supabase/updateSession";

import {
  PUBLIC_ROUTES,
  SIGNIN_ROUTE,
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  SIGNUP_ROUTE,
} from "@/lib/constants";

export async function middleware(request: NextRequest) {
  let response = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // Set cookies for temporary response, main cookies are set in updateSession
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  // Redirect instant to /dashboard after verifying email because
  // after clicking the link you got code in the url like this /signin?code=...

  const code = request.nextUrl.searchParams.get("code");

  if (code && [SIGNIN_ROUTE, SIGNUP_ROUTE].includes(pathname)) {
    await supabase.auth.exchangeCodeForSession(code);

    const url = request.nextUrl.clone();
    url.searchParams.delete("code");
    url.pathname = DASHBOARD_ROUTE;

    response = NextResponse.redirect(url, { headers: response.headers });

    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
