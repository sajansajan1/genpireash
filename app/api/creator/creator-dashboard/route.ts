import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const { data: creator, error: creatorError } = await supabase
      .from("creator_profile")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creatorError || !creator) {
      console.error("Creator fetch error:", creatorError);
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Product ideas count
    const {
      data: productIdeas,
      error: ideaError,
      count: productCount,
    } = await supabase.from("product_ideas").select("*", { count: "exact" }).eq("user_id", user.id);

    if (ideaError || !productIdeas) {
      console.error("Product ideas fetch error:", ideaError);
      return NextResponse.json({ error: "Product ideas fetch error" }, { status: 500 });
    }

    // RFQ count
    const {
      data: rfqs,
      error: rfqsError,
      count: openRfqCount,
    } = await supabase.from("rfq").select("*", { count: "exact" }).eq("creator_id", creatorId).eq("status", "open");

    if (rfqsError || !rfqs) {
      console.error("RFQ fetch error:", rfqsError);
      return NextResponse.json({ error: "RFQ fetch error" }, { status: 500 });
    }

    // Get suppliers
    const { data: suppliers, error: supplierError } = await supabase
      .from("supplier_profile")
      .select("*, manufacturingID")
      .eq("role", "supplier");

    if (supplierError || !suppliers) {
      console.error("Supplier fetch error:", supplierError);
      return NextResponse.json({ error: "Supplier fetch error" }, { status: 500 });
    }

    const manufacturingIDs = [...new Set(suppliers.map((s) => s.manufacturingID).filter(Boolean))];

    const { data: manufacturingData, error: manufacturingError } = await supabase
      .from("manufacturing_capabilities")
      .select("*")
      .in("id", manufacturingIDs);

    if (manufacturingError || !manufacturingData) {
      console.error("Manufacturing fetch error:", manufacturingError);
      return NextResponse.json({ error: "Manufacturing fetch error" }, { status: 500 });
    }

    const manufacturingMap = Object.fromEntries(manufacturingData.map((m) => [m.id, m]));

    const enrichedSuppliers = suppliers.map((supplier) => ({
      ...supplier,
      manufacturing: manufacturingMap[supplier.manufacturingID] || null,
    }));

    const matchedSuppliers = enrichedSuppliers.filter((supplier) =>
      supplier?.manufacturing?.product_categories?.includes(creator.categories)
    );

    return NextResponse.json({
      totalOpenRFQs: openRfqCount || 0,
      totalMatchedSuppliers: matchedSuppliers.length,
      totalProducts: productCount || 0,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
