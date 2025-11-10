import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  PUBLIC_ROUTES,
  HOME_ROUTE,
  DASHBOARD_ROUTE,
  SIGNIN_ROUTE,
  SIGNUP_ROUTE,
} from "./lib/constants";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const createRedirectUrl = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return url;
  };

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = !PUBLIC_ROUTES.includes(pathname);

  if (
    user &&
    (pathname === HOME_ROUTE ||
      pathname === SIGNIN_ROUTE ||
      pathname === SIGNUP_ROUTE) // FIX IT - this is ugly asf
  ) {
    return NextResponse.redirect(createRedirectUrl(DASHBOARD_ROUTE));
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(createRedirectUrl(SIGNIN_ROUTE));
  }

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.).*)"],
};
