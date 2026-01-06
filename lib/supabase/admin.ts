"use server";

import { createClient } from "./server";

export interface Creator {
  id: string;
  full_name: string | null;
  email: string | null;
  user_id: string | null;
  role: string | null;
  country: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
  techpack_count: number;
  techpack_count_range: number;
}

export interface KPIData {
  totalCreators: number;
  activeCreators: number;
  techPacksGenerated: number;
  newSignups: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export async function getKPIs(fromDate: string, toDate: string): Promise<KPIData> {
  const supabase = await createClient();
  try {
    // Total creators
    const { count: totalCreators } = await supabase.from("users").select("*", { count: "exact", head: true });

    // Active creators (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: activeCreators } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", sevenDaysAgo.toISOString());

    // Tech packs generated in range
    const { count: techPacksGenerated } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "techpack.generate")
      .gte("created_at", fromDate)
      .lte("created_at", toDate);

    // New signups in range
    const { count: newSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", fromDate)
      .lte("created_at", toDate);

    return {
      totalCreators: totalCreators || 0,
      activeCreators: activeCreators || 0,
      techPacksGenerated: techPacksGenerated || 0,
      newSignups: newSignups || 0,
    };
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return {
      totalCreators: 0,
      activeCreators: 0,
      techPacksGenerated: 0,
      newSignups: 0,
    };
  }
}

export async function getCreators(
  page = 1,
  limit = 50,
  search = "",
  fromDate: string,
  toDate: string
): Promise<{ creators: Creator[]; total: number }> {
  const supabase = await createClient();

  try {
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase.from("creator_profile").select(
      `
        id,
        full_name,
        email,
        user_id,
        created_at,
        updated_at,
        role,
        country,
        website_url
      `,
      { count: "exact" }
    );

    // Search by name or email
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Order by most recently created
    const {
      data: profiles,
      error,
      count,
    } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    if (error) throw error;

    // Attach techpack counts
    const creatorsWithCounts = await Promise.all(
      (profiles || []).map(async (profile) => {
        // Count all product_ideas for this creator
        const { count: totalTechpacks, error: countError1 } = await supabase
          .from("product_ideas")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.user_id);

        if (countError1) console.error("Count total error:", countError1);

        // Count product_ideas within date range
        const { count: rangeTechpacks, error: countError2 } = await supabase
          .from("product_ideas")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.user_id)
          .gte("created_at", fromDate)
          .lte("created_at", toDate);

        if (countError2) console.error("Count range error:", countError2);

        return {
          ...profile,
          techpack_count: totalTechpacks ?? 0,
          techpack_count_range: rangeTechpacks ?? 0,
        };
      })
    );

    return {
      creators: creatorsWithCounts,
      total: count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching creators:", error);
    return { creators: [], total: 0 };
  }
}

export async function getSignupsChart(
  fromDate: string,
  toDate: string,
  granularity: "daily" | "weekly" | "monthly"
): Promise<ChartDataPoint[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("users")
      .select("created_at")
      .gte("created_at", fromDate)
      .lte("created_at", toDate)
      .order("created_at");

    if (error) throw error;

    const grouped = (data || []).reduce((acc, item) => {
      const date = new Date(item.created_at);
      let key = "";

      if (granularity === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (granularity === "weekly") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split("T")[0];
      } else if (granularity === "monthly") {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        key = `${year}-${month}`;
      } else {
        key = date.toISOString().split("T")[0];
      }

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, value]) => ({
      date,
      value,
    }));
  } catch (error) {
    console.error("Error fetching signups chart:", error);
    return [];
  }
}

export async function getTechpacksChart(
  fromDate: string,
  toDate: string,
  granularity: "daily" | "weekly" | "monthly"
): Promise<ChartDataPoint[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("product_ideas")
      .select("created_at")
      .gte("created_at", fromDate)
      .lte("created_at", toDate)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const grouped = (data || []).reduce((acc, item) => {
      const date = new Date(item.created_at);
      let key = "";

      if (granularity === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (granularity === "weekly") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split("T")[0];
      } else if (granularity === "monthly") {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        key = `${year}-${month}`;
      }

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, value]) => ({
      date,
      value,
    }));
  } catch (error) {
    console.error("Error fetching techpacks chart:", error);
    return [];
  }
}

export async function getCreatorDetail(id: string) {
  const supabase = await createClient();
  try {
    // Get creator profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", id).single();

    if (profileError) throw profileError;

    // Get techpacks
    const { data: techpacks, error: techpacksError } = await supabase
      .from("techpacks")
      .select("*")
      .eq("creator_id", id)
      .order("created_at", { ascending: false });

    if (techpacksError) throw techpacksError;

    // Get recent events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("creator_id", id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (eventsError) throw eventsError;

    return {
      profile,
      techpacks: techpacks || [],
      events: events || [],
    };
  } catch (error) {
    console.error("Error fetching creator detail:", error);
    return null;
  }
}

export async function getCreatorById(id: string) {
  const supabase = await createClient();
  try {
    const { data: profile, error } = await supabase.from("creator_profile").select("*").eq("id", id).single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error("Error fetching creator by ID:", error);
    return null;
  }
}

export async function getSupplierById(id: string) {
  const supabase = await createClient();

  try {
    // Fetch supplier profile
    const { data: profile, error: profileError } = await supabase
      .from("supplier_profile")
      .select("*")
      .eq("id", id)
      .single();

    if (profileError) throw profileError;

    // Fetch manufacturing capabilities
    if (profile.manufacturingID) {
      const { data: manufacturing, error: manufacturingError } = await supabase
        .from("manufacturing_capabilities")
        .select("*")
        .eq("id", profile.manufacturingID)
        .single();

      if (manufacturingError) throw manufacturingError;

      // 👇 Push manufacturing data inside profile object
      profile.manufacturing = manufacturing;
    } else {
      profile.manufacturing = null;
    }

    return profile;

  } catch (error) {
    console.error("Error fetching supplier by ID:", error);
    return null;
  }
}


export async function getCreatorTechPacks(creatorId: string) {
  const supabase = await createClient();
  try {
    const { data: techpacks, error } = await supabase
      .from("product_ideas")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return techpacks || [];
  } catch (error) {
    console.error("Error fetching creator tech packs:", error);
    return [];
  }
}
