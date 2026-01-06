"use client";

import { useEffect } from "react";
import LogRocket from "logrocket";
import { supabase } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export function LogRocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize LogRocket in production OR when explicitly enabled for testing
    const isProduction = process.env.NODE_ENV === "production";
    const enableInDev = process.env.NEXT_PUBLIC_ENABLE_LOGROCKET === "true";

    if (isProduction || enableInDev) {
      // Initialize LogRocket
      LogRocket.init("kwvo0f/genpire-prod");

      // Log initialization for debugging
      console.log("🚀 LogRocket initialized", {
        environment: process.env.NODE_ENV,
        enabledInDev: enableInDev,
      });

      // Get and log session URL for debugging
      LogRocket.getSessionURL((sessionURL) => {
        // console.log("📹 LogRocket Session URL:", sessionURL);
      });

      // Identify user if authenticated
      const identifyUser = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            // Identify the user in LogRocket
            LogRocket.identify(user.id, {
              email: user.email || "",
              name: user.user_metadata?.full_name || "",
              createdAt: user.created_at,
              role: user.role || "user",
            });
            console.log("👤 LogRocket user identified:", user.email);
          } else {
            console.log("👤 No user logged in for LogRocket");
          }
        } catch (error) {
          console.error("Error identifying user for LogRocket:", error);
        }
      };

      identifyUser();

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          if (event === "SIGNED_IN" && session?.user) {
            LogRocket.identify(session.user.id, {
              email: session.user.email || "",
              name: session.user.user_metadata?.full_name || "",
              createdAt: session.user.created_at,
              role: session.user.role || "user",
            });
          } else if (event === "SIGNED_OUT") {
            // Clear LogRocket session on logout - use getSessionURL to start new session
            LogRocket.getSessionURL((sessionURL) => {
              console.log("LogRocket session ended:", sessionURL);
            });
          }
        }
      );

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  return <>{children}</>;
}
