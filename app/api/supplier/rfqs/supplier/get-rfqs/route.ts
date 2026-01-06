import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate supplier
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get("supplierId");
  if (!supplierId) {
    return NextResponse.json({ error: "Missing supplierId" }, { status: 400 });
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  // First: get total count
  const {
    data: allLinks,
    error: allLinkError,
    count: totalCount,
  } = await supabase.from("supplier_rfqs").select("rfqs_id", { count: "exact" }).eq("supplier_id", supplierId);

  if (allLinkError) {
    return NextResponse.json({ error: allLinkError.message }, { status: 500 });
  }

  // Fetch RFQ links for the supplier
  const { data: rfqLinks, error: rfqLinkError } = await supabase
    .from("supplier_rfqs")
    .select("rfqs_id")
    .eq("supplier_id", supplierId)
    .range(offset, offset + limit - 1);

  if (rfqLinkError) {
    return NextResponse.json({ error: rfqLinkError.message }, { status: 500 });
  }

  if (!rfqLinks || rfqLinks.length === 0) {
    return NextResponse.json({
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });
  }

  const rfqIds = rfqLinks.map((link) => link.rfqs_id);

  // Fetch RFQs
  const { data: rfqs, error: rfqsError } = await supabase
    .from("rfq")
    .select("*")
    .in("id", rfqIds)
    .order("created_at", { ascending: false });

  if (rfqsError) {
    return NextResponse.json({ error: rfqsError.message }, { status: 500 });
  }

  // Fetch supplier quotes
  const { data: submittedQuotes, error: quoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("*")
    .eq("supplier_id", supplierId)
    .in("rfq_id", rfqIds);

  const quoteMap = Object.fromEntries((submittedQuotes || []).map((q) => [q.rfq_id, q]));

  // Fetch techpacks
  const techpackIds = [...new Set(rfqs.map((r) => r.techpack_id))];

  const { data: techpacks, error: techpackError } = await supabase
    .from("product_ideas")
    .select("*")
    .in("id", techpackIds);

  const techpackMap = Object.fromEntries((techpacks || []).map((tp) => [tp.id, tp]));

  // Fetch creators
  const creatorIds = [...new Set(rfqs.map((r) => r.creator_id))];

  const { data: creators, error: creatorError } = await supabase
    .from("creator_profile")
    .select("*")
    .in("id", creatorIds);

  const creatorMap = Object.fromEntries((creators || []).map((c) => [c.id, c]));

  const result = rfqs.map((rfq) => ({
    rfq,
    techpack: techpackMap[rfq.techpack_id] || null,
    creator: creatorMap[rfq.creator_id] || null,
    quote: quoteMap[rfq.id] || null,
  }));

  // Total count for pagination
  const total = totalCount || 0;

  return NextResponse.json({
    data: result,
    pagination: {
      page,
      limit,
      total: total || 0,
      totalPages: Math.ceil((total || 0) / limit),
      hasMore: offset + limit < (total || 0),
    },
  });
}
