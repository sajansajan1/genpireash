import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function escapeLike(str: string) {
  return str.replace(/[%_]/g, "\\$&"); // escapes % and _
}

export async function GET(req: Request) {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("user_credits").select(`plan_type, *, users:users!inner(email)`, { count: "exact" });

  if (search) {
    const escapedSearch = search.replace(/[%_]/g, "\\$&");

    // Search plan_type on main table
    query = query.ilike("plan_type", `%${escapedSearch}%`);

    // Search email on joined users table
    query = query.or(`email.ilike.%${escapedSearch}%`, {
      referencedTable: "users",
    });
  }

  const { data, error, count } = await query.range(from, to).order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
    { status: 200 }
  );
}
