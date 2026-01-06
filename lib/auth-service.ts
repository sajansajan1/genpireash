"use server";
import { createClient } from "@/lib/supabase/server";
import axios from "axios";

export type AuthError = {
  message: string;
};

// export async function signUp(email: string, password: string, full_name: string, role: string) {
//   const supabase = await createClient();
//   if (!supabase) {
//     return { error: { message: "Failed to initialize Supabase client" } };
//   }
//   try {
//     console.log("Starting signup process in auth-service...");

//     // Step 1: Sign up the user in Supabase Auth (this stores the password securely)
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: full_name,
//           user_role: role,
//         },
//         emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
//       },
//     });

//     if (error) {
//       console.error("Auth signup error:", error);
//       return { error: { message: error.message } };
//     }

//     if (!data.user) {
//       return { error: { message: "Failed to create user" } };
//     }

//     return { user: data.user };
//   } catch (err) {
//     console.error("Unexpected error during signup:", err);
//     return { error: { message: "An unexpected error occurred during signup" } };
//   }
// }
// Adjust the import path as needed
// Adjust path if needed

export async function signUp(email: string, password: string, full_name: string, role: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: { message: "Failed to initialize Supabase client" } };
  }

  try {
    console.log("Starting signup process in auth-service...");

    // Step 1: Sign up the user in Supabase Auth (this stores the password securely)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name,
          user_role: role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error("Auth signup error:", error);
      return { error: { message: error.message } };
    }

    if (!data.user) {
      return { error: { message: "Failed to create user" } };
    }

    try {
      let webhookUrl = "https://hooks.zapier.com/hooks/catch/21093149/2vx1x3s";

      if (role === "supplier") {
        webhookUrl = "https://hooks.zapier.com/hooks/catch/21093149/2vx95c4/";
      }
      const zapierRes = await axios.post(
        webhookUrl,
        {
          name: full_name,
          email,
          role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!zapierRes || zapierRes.status !== 200) {
        console.error("Zapier Error:", zapierRes.statusText || "Unknown error");
      } else {
        console.log("Zapier webhook triggered successfully.");
      }
    } catch (zapierError) {
      console.error("Zapier webhook error:", zapierError);
      // Optional: Do not block user creation on Zapier failure
    }
    return { user: data.user };
  } catch (err) {
    console.error("Unexpected error during signup:", err);
    return { error: { message: "An unexpected error occurred during signup" } };
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      return { error: { message: error.message } };
    }
    return { user: data.user, session: data.session };
  } catch (err) {
    console.error("Unexpected error during sign in:", err);
    return {
      error: { message: "An unexpected error occurred during sign in" },
    };
  }
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: { message: error.message } };
  }

  return (window.location.href = "/");
}

export async function updatePassword(password: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("Password update error:", error);
      return { error: { message: error.message } };
    }

    return { user: data.user };
  } catch (err) {
    console.error("Unexpected error during password update:", err);
    return {
      error: { message: "An unexpected error occurred during password update" },
    };
  }
}

export async function VerifyOtp(email: string, otp: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "recovery", // Changed from "email" to "recovery" for password reset
    });

    if (error) {
      console.error("OTP verification error:", error);
      return { error: { message: error.message } };
    }

    return { user: data.user, session: data.session };
  } catch (err) {
    console.error("Unexpected error during OTP verification:", err);
    return {
      error: { message: "An unexpected error occurred during OTP verification" },
    };
  }
}

export async function sendPasswordReset(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`, // or your actual reset page
  });
  console.log(data, error, "reset password");
  if (error) {
    console.error("Error sending reset email:", error.message);
    return { error: error.message };
  }

  return { data };
}

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  console.log(data, "kadsfkjjads");
  if (error || !data.session) {
    return null;
  }

  return data.session;
}
// lib/getUser.ts
export const getCurrentUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
};

export async function getUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single();

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError);
    return null;
  }

  return profile;
}

export async function updateUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Error fetching user:", error);
    return null;
  }

  const { data, error: updateError } = await supabase
    .from("users")
    .update({
      verified_status: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .maybeSingle();

  if (updateError) {
    console.error("Error updating verified status:", updateError);
    return null;
  }

  return data;
}

export async function getProductIdeas() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data: productIdeas, error: productError } = await supabase
    .from("product_ideas")
    .select("*")
    .eq("user_id", user.id); // assuming "user_id" is the correct column

  if (productError || !productIdeas) {
    console.error("Product ideas fetch error:", productError);
    return null;
  }

  return productIdeas;
}

export async function signInWithGoogle(type?: "signin" | "signup") {
  const supabase = await createClient();

  const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`);
  if (type) {
    redirectUrl.searchParams.set("type", type);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl.toString(),
      // skipBrowserRedirect: true,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);
    return { error: { message: error.message } };
  }

  // For OAuth flow, we return the URL for redirect
  if (data.url) {
    return { url: data.url };
  }

  // This shouldn't happen in OAuth flow, but handle just in case
  return { error: { message: "No redirect URL received from Google" } };
}

export async function signInWithFacebook() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { url: data.url };
}
