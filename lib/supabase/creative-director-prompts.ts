"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchAiCreativeDirectorPrompts() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    // if no auth → return null
    if (userError || !user) {
        console.error("Auth error:", userError?.message);
        return null;
    }

    // Get the most recent entry
    const { data, error } = await supabase
        .from("ai_creative_director_prompts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        // It's normal to have no rows if user hasn't generated anything yet
        if (error.code !== 'PGRST116') {
            console.error("Fetch error:", error.message);
        }
        return null;
    }

    return data;
}

export async function insertAiCreativeDirectorPrompts(prompts: any[], url: string) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Auth error:", userError?.message);
        return null;
    }

    // Use upsert with onConflict to update existing row
    const { data, error } = await supabase
        .from("ai_creative_director_prompts")
        .upsert({
            user_id: user.id,
            url: url,
            prompts: prompts,
            updated_at: new Date().toISOString() // Optional: track update time
        }, {
            onConflict: 'user_id', // Assuming user_id is unique constraint
            ignoreDuplicates: false // Force update
        })
        .select()
        .single();

    if (error) {
        console.error("Upsert error:", error.message);
        return null;
    }

    return data;
}
