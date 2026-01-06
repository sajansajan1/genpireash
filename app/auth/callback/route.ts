import { checkCreatorProfileExists, createCreatorProfile } from "@/lib/supabase/creator";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("web auth callback route");

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type"); // 'signin' or 'signup'
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}`, { status: 301 });
  }

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}`, { status: 301 });
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

  if (authError) {
    console.error("Authentication error:", authError.message);
    return NextResponse.redirect(`${requestUrl.origin}`, { status: 301 });
  }

  const user = data.user;
  if (!user) {
    return NextResponse.redirect(`${requestUrl.origin}`, { status: 301 });
  }

  try {
    const existingProfile = await checkCreatorProfileExists(user.id);

    if (!existingProfile) {
      await createCreatorProfile({
        full_name: user.user_metadata?.full_name || "",
        avatar_url: "",
        country: "",
        categories: "",
        address: "",
        contact: "",
        email: user.email || "",
      });
      console.log("Creator profile created for user:", user.id);
    }

    const userRole = user.user_metadata?.user_role || "creator";

    // Check if this is a signup flow (more reliable than timestamp comparison)
    const isSignup = !existingProfile;

    if (userRole === "creator") {
      if (isSignup) {
        return NextResponse.redirect(`${requestUrl.origin}/creator-dashboard?onboarding=true`, { status: 301 });
      } else {
        return NextResponse.redirect(`${requestUrl.origin}/creator-dashboard`, { status: 301 });
      }
    }

    if (userRole === "supplier") {
      return NextResponse.redirect(`${requestUrl.origin}/supplier-dashboard`, { status: 302 });
    }

    return NextResponse.redirect(`${requestUrl.origin}`, { status: 301 });
  } catch (profileError) {
    console.error("Error handling user profile:", profileError);
    return NextResponse.redirect(`${requestUrl.origin}`, { status: 301 });
  }
}
