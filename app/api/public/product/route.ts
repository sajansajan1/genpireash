import { NextRequest, NextResponse } from "next/server";
import { createApiServiceRoleClient } from "@/lib/supabase/api-client";

export async function GET(
    request: NextRequest,
) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");
        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        console.log("[Public Product API] Fetching product:", productId);

        // Use service role to bypass RLS for public products
        let supabaseAdmin;
        try {
            supabaseAdmin = createApiServiceRoleClient();
        } catch (envError) {
            console.error("[Public Product API] Service role client error:", envError);
            return NextResponse.json(
                { error: "Server configuration error", details: String(envError) },
                { status: 500 }
            );
        }

        // Fetch product - all products are publicly viewable via this endpoint
        const { data: product, error } = await supabaseAdmin
            .from("product_ideas")
            .select("id, prompt, tech_pack, image_data, tech_files_data, is_public, created_at, selected_revision_id")
            .eq("id", productId)
            .single();

        if (error) {
            console.error("[Public Product API] Database error:", error);
            return NextResponse.json(
                { error: "Product not found or is not public", details: error.message },
                { status: 404 }
            );
        }

        if (!product) {
            console.log("[Public Product API] Product not found or not public:", productId);
            return NextResponse.json(
                { error: "Product not found or is not public" },
                { status: 404 }
            );
        }

        console.log("[Public Product API] Product found:", product.id);

        // Fetch tech files from the tech_files table (same as product page)
        let techFilesData = {
            baseViews: [] as any[],
            components: [] as any[],
            closeups: [] as any[],
            sketches: [] as any[],
        };

        // Build the query for tech files
        let query = supabaseAdmin
            .from("tech_files")
            .select("*")
            .eq("product_idea_id", productId)
            .eq("status", "completed")
            .order("created_at", { ascending: false });

        // Filter by revision ID if available
        if (product.selected_revision_id) {
            query = query.eq("revision_id", product.selected_revision_id);
        }

        const { data: techFiles, error: techFilesError } = await query;

        if (!techFilesError && techFiles && techFiles.length > 0) {
            // Organize tech files by type (same as getTechFilesForProduct)
            techFilesData.baseViews = techFiles
                .filter((f: any) => f.file_type === "base_view")
                .map((f: any) => ({
                    id: f.id,
                    file_type: f.file_type,
                    view_type: f.view_type,
                    file_category: f.file_category,
                    file_url: f.file_url,
                    thumbnail_url: f.thumbnail_url,
                    analysis_data: f.analysis_data,
                    confidence_score: f.confidence_score,
                    created_at: f.created_at,
                    revision_id: f.revision_id,
                }));

            techFilesData.components = techFiles
                .filter((f: any) => f.file_type === "component")
                .map((f: any) => ({
                    id: f.id,
                    file_type: f.file_type,
                    view_type: f.view_type,
                    file_category: f.file_category,
                    file_url: f.file_url,
                    thumbnail_url: f.thumbnail_url,
                    analysis_data: f.analysis_data,
                    confidence_score: f.confidence_score,
                    created_at: f.created_at,
                    revision_id: f.revision_id,
                }));

            techFilesData.closeups = techFiles
                .filter((f: any) => f.file_type === "closeup")
                .map((f: any) => ({
                    id: f.id,
                    file_type: f.file_type,
                    view_type: f.view_type,
                    file_category: f.file_category,
                    file_url: f.file_url,
                    thumbnail_url: f.thumbnail_url,
                    analysis_data: f.analysis_data,
                    confidence_score: f.confidence_score,
                    created_at: f.created_at,
                    revision_id: f.revision_id,
                }));

            techFilesData.sketches = techFiles
                .filter((f: any) => f.file_type === "sketch")
                .map((f: any) => ({
                    id: f.id,
                    file_type: f.file_type,
                    view_type: f.view_type,
                    file_category: f.file_category,
                    file_url: f.file_url,
                    thumbnail_url: f.thumbnail_url,
                    analysis_data: f.analysis_data,
                    confidence_score: f.confidence_score,
                    created_at: f.created_at,
                    revision_id: f.revision_id,
                }));
        }

        // Return sanitized product data (no user_id or sensitive info)
        return NextResponse.json({
            success: true,
            data: {
                id: product.id,
                techPack: product.tech_pack,
                imageData: product.image_data,
                techFilesData: techFilesData,
                prompt: product.prompt,
                createdAt: product.created_at,
            },
        });
    } catch (error) {
        console.error("Error fetching public product:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
