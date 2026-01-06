import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { getCurrentUser } from "./lib/auth-service";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/faq",
  "/pricing",
  "/guide",
  "/terms",
  "/privacy",
  "/hire-tech-pack-designer",
  "/blog",
  "/suppliers",
  "/what-is-a-tech-pack",
  "/create-tech-pack-online",
  "/tech-pack-template",
  "/best-tech-pack-software",
  "/product-idea-generator",
  "/prototype-manufacturer-guide",
  "/sample-making-services",
  "/rapid-prototyping-accessories-home",
  "/ai-product-design-tools",
  "/how-to-find-a-manufacturer",
  "/low-moq-manufacturers",
  "/small-batch-manufacturing-guide",
  "/sustainable-manufacturing-options",
  "/clothing-manufacturers",
  "/custom-product-design-services",
  "/order-product-prototype",
  "/3d-printing-services",
  "/card-design-services",
  "/design-for-manufacturing",
  "/design-to-production",
  "/end-to-end-solutions",
  "/industrial-design",
  "/manufacturing-consultation",
  "/product-design-services",
  "/manufacturing-partners",
  "/market-research",
  "/product-development",
  "/product-launch-support",
  "/product-planning",
  "/quality-control",
  "/rapid-prototyping",
  "/supply-chain-management",
  "/vendor-management",
  "/reset-password",
  "/industry",
  "/friends",
  "/share",
  "/discover",
  "/enterprise",
  "/announcements",
  "/p", // Public product view pages
  "/showcase",
  "/welcome"
];

function setRedirectCookie(response: NextResponse, path: string) {
  response.cookies.set("redirectTo", path, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication for webhook endpoints and public API routes
  if (
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/polar/webhooks") ||
    pathname.startsWith("/api/proxy-3d-model") ||
    pathname.startsWith("/api/convert-to-cad") ||
    pathname.startsWith("/api/fb-server-events") ||
    pathname.startsWith("/api/public/") // Public API routes (e.g., public product view)
  ) {
    return NextResponse.next();
  }

  const response = await updateSession(request);
  const user = await getCurrentUser();

  if (pathname === "/") {
    if (user) {
      const userRole =
        user?.user_metadata?.user_role || user?.identities?.[0]?.provider;
      console.log("userRole ==> ", userRole);
      const isProfileComplete = user?.user_metadata?.profile_complete;
      if (
        userRole === "creator" &&
        (isProfileComplete === true || isProfileComplete === undefined)
      ) {
        return NextResponse.redirect(
          new URL("/creator-dashboard", request.url)
        );
      } else if (userRole === "google") {
        return NextResponse.redirect(
          new URL("/creator-dashboard", request.url)
        );
      } else if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (userRole === "supplier") {
        return NextResponse.redirect(
          new URL("/supplier-dashboard", request.url)
        );
      }
    }

    return response;
  }

  if (PUBLIC_PATHS.some((path) => path !== "/" && pathname.startsWith(path))) {
    return response;
  }

  if (!user) {
    // Redirect to homepage with auth=required query param to show login modal
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("auth", "required");
    const redirectResponse = NextResponse.redirect(homeUrl);
    setRedirectCookie(redirectResponse, pathname);
    return redirectResponse;
  }

  const userRole =
    user?.user_metadata?.user_role || user?.identities?.[0]?.provider;

  if (
    pathname.startsWith("/creator-dashboard") &&
    !(userRole === "creator" || userRole === "google")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/supplier-dashboard") && userRole !== "supplier") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/.*|api/genp-announcements/*|api/genp-announcements|api/ai-support-assistant/*|api/ai-support-assistant|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|mp3|wav|xml|txt)$|auth/callback|auth/.*).*)",
  ],
};
