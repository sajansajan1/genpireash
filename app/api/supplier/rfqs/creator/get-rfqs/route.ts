import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creatorId");
  if (!creatorId) {
    return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
  }
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  // Fetch RFQs for this creator
  const {
    data: rfqs,
    error: rfqsError,
    count,
  } = await supabase
    .from("rfq")
    .select("*", { count: "exact" })
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (rfqsError) {
    return NextResponse.json({ error: rfqsError.message }, { status: 500 });
  }

  if (!rfqs?.length) {
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

  // Collect related IDs
  const rfqIds = rfqs.map((r) => r.id);

  // Fetch supplier links
  const { data: rfqLinks, error: rfqLinkError } = await supabase
    .from("supplier_rfqs")
    .select("rfqs_id, supplier_id")
    .in("rfqs_id", rfqIds);

  if (rfqLinkError) {
    return NextResponse.json({ error: rfqLinkError.message }, { status: 500 });
  }

  // Fetch supplier quotes
  const { data: submittedQuotes, error: submitQuoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("*")
    .in("rfq_id", rfqIds);

  if (submitQuoteError) {
    console.error("Error fetching submitted quotes:", submitQuoteError);
  }

  // Create quote map
  const quoteMap = new Map();
  (submittedQuotes || []).forEach((q) => {
    quoteMap.set(`${q.rfq_id}_${q.supplier_id}`, q);
  });

  // Fetch techpacks
  const techpackIds = [...new Set(rfqs.map((r) => r.techpack_id))];
  const { data: techpacks, error: techpackError } = await supabase
    .from("product_ideas")
    .select("*")
    .in("id", techpackIds);

  if (techpackError) {
    return NextResponse.json({ error: techpackError.message }, { status: 500 });
  }

  const techpackMap = Object.fromEntries((techpacks || []).map((tp) => [tp.id, tp]));

  // Fetch supplier profiles
  const supplierIds = [...new Set(rfqLinks.map((link) => link.supplier_id))];
  const { data: suppliers, error: supplierError } = await supabase
    .from("supplier_profile")
    .select("*")
    .in("id", supplierIds);

  if (supplierError) {
    return NextResponse.json({ error: supplierError.message }, { status: 500 });
  }

  const supplierMap = Object.fromEntries((suppliers || []).map((s) => [s.id, s]));

  // Group suppliers + quotes under each RFQ
  const groupedMap = new Map();
  rfqLinks.forEach((link) => {
    const rfqId = link.rfqs_id;
    const key = `${rfqId}_${link.supplier_id}`;
    const supplierProfile = supplierMap[link.supplier_id];
    const quote = quoteMap.get(key);

    const supplierInfo = {
      profile: supplierProfile || null,
      quote: quote || null,
    };

    if (!groupedMap.has(rfqId)) {
      groupedMap.set(rfqId, []);
    }
    groupedMap.get(rfqId).push(supplierInfo);
  });

  // Combine final structure
  const result = rfqs.map((rfq) => ({
    rfq,
    techpack: techpackMap[rfq.techpack_id] || null,
    suppliers: groupedMap.get(rfq.id) || [],
  }));

  return NextResponse.json({
    data: result,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: offset + limit < (count || 0),
    },
  });
}
