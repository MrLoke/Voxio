"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignInFormValues } from "@/lib/schemas/authSchema";
import {
  API_HCAPTCHA,
  AUTH_CALLBACK_ROUTE,
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  VERIFY_EMAIL_ROUTE,
} from "@/lib/constants";

export const signInAction = async (formData: SignInFormValues) => {
  const { email, password } = formData;

  if (!email || !password) {
    return { error: "Please enter your email address and password." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.user) {
    redirect(DASHBOARD_ROUTE);
  }

  if (error) {
    return { error: error.message || "Login error. Please try again." };
  }
};

export const signUpAction = async (formData: FormData) => {
  // TODO: Add SignUpFormValues instead of FormData and fix types
  try {
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const username = (formData.get("username") as string) || "";
    const avatarFile = formData.get("avatar") as File | null;
    const captcha = formData.get("captcha") as string | null;

    if (!email || !password || !username) {
      return { success: false, error: "Missing fields" };
    }

    if (!captcha) {
      return { success: false, error: "Captcha missing" };
    }

    const verifyRes = await fetch(API_HCAPTCHA, {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: captcha,
      }),
    });

    const captchaJson = await verifyRes.json();

    if (!captchaJson.success) {
      return { success: false, error: "Captcha verification failed" };
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${AUTH_CALLBACK_ROUTE}`,
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    let avatar_url: string | null = null;

    if (userId) {
      const admin = createAdminClient();

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${userId}/avatar.${ext}`;

        const { error: uploadError } = await admin.storage
          .from("avatars")
          .upload(path, avatarFile, {
            cacheControl: "3600",
            upsert: true,
            contentType: avatarFile.type,
          });

        if (!uploadError) {
          const { data } = admin.storage.from("avatars").getPublicUrl(path);
          avatar_url = data.publicUrl;
        }
      }

      const { error: userInsertError } = await admin.from("users").upsert(
        [
          {
            id: userId,
            username,
            nickname: username,
            avatar_url,
          },
        ],
        { onConflict: "id" }
      );

      if (userInsertError) {
        console.error("Error inserting user profile:", userInsertError);
      }
    }

    return {
      success: true,
      redirectUrl: VERIFY_EMAIL_ROUTE,
    };
  } catch (error) {
    console.error("SignUp Server Action error:", error);
    return { success: false, error: "Server error" };
  }
};

export const signOutAction = async () => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Błąd wylogowania:", error);
  }

  redirect(HOME_ROUTE);
};
