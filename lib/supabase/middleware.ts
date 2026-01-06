// import { createServerClient } from "@supabase/ssr";
// import { type NextRequest, NextResponse } from "next/server";

// export async function updateSession(request: NextRequest) {
//   // Create the Supabase client
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
//         },
//       },
//     }
//   );

//   try {
//     const { data, error } = await supabase.auth.getUser();

//     if (error) {
//       console.error("Error fetching user:", error.message);
//       return null;
//     }

//     if (data?.user) {
//       return data.user;
//     }

//     return null;
//   } catch (err) {
//     console.error("Unexpected error in updateSession:", err);
//     return null;
//   }
// }

// middleware.ts or a similar file
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refresh the session and get the user
  // This is where the session is updated on the response
  await supabase.auth.getUser();

  return response;
}
