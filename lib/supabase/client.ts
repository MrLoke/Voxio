import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof window !== "undefined") {
          const cookies = document.cookie.split(";");
          return cookies.map((cookie) => {
            const [name, value] = cookie.trim().split("=", 2);
            return { name, value: value || "" };
          });
        }
        return [];
      },

      setAll(cookiesToSet) {
        if (typeof window !== "undefined") {
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=${
              options.path
            }; max-age=${options.maxAge}; secure=${options.secure ?? true}`;
          });
        }
      },
    },
  });
