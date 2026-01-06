"use server";

import { createClient } from "@/lib/supabase/server";
import type { AcceptRFQ, rfq, SubmitRfq, supplierRfq } from "../types/tech-packs";

export async function createRFQ({
  title,
  product_idea,
  techpack_id,
  timeline,
  quantity,
  creator_id,
  target_price,
  status,
}: rfq) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data, error } = await supabase
    .from("rfq")
    .insert({
      title,
      product_idea,
      techpack_id,
      timeline,
      quantity,
      target_price,
      status,
      creator_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Insert error for create rfq:", error);
    return null;
  }

  return data;
}

export async function getSingleSupplierRfq(rfqId: string, supplierId: string) {
  const supabase = await createClient();

  const { data: rfq, error: rfqError } = await supabase.from("rfq").select("*").eq("id", rfqId).single();

  if (rfqError || !rfq) {
    console.error("Error fetching RFQ:", rfqError);
    return null;
  }
  const { data: submittedQuotes, error: submitQuoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("*")
    .eq("rfq_id", rfqId)
    .eq("supplier_id", supplierId)
    .single();
  if (submitQuoteError) {
    console.error("Error fetching submitted quotes:", submitQuoteError);
  }

  const { data: techpack, error: techpackError } = await supabase
    .from("product_ideas")
    .select("*")
    .eq("id", rfq.techpack_id)
    .single();

  if (techpackError) {
    console.error("Error fetching techpack:", techpackError);
  }

  const { data: creator, error: creatorError } = await supabase
    .from("creator_profile")
    .select("*")
    .eq("id", rfq.creator_id)
    .single();

  if (creatorError) {
    console.error("Error fetching creator:", creatorError);
  }

  return {
    rfq,
    techpack: techpack || null,
    creator: creator || null,
    submittedQuotes: submittedQuotes || null,
  };
}

export async function supplierRfq({ supplier_ids, rfqs_id }: { supplier_ids: string[]; rfqs_id: string }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const now = new Date().toISOString();

  const insertData = supplier_ids.map((supplier_id) => ({
    supplier_id,
    rfqs_id,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await supabase.from("supplier_rfqs").insert(insertData).select("*");

  if (error || !data) {
    console.error("Insert error for supplier rfq:", error);
    return null;
  }

  return data;
}

export async function fetchSupplierRfqs(supplierId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return [];
  }
  console.log(supplierId, "suppliere");
  const { data: rfqLinks, error: rfqLinkError } = await supabase
    .from("supplier_rfqs")
    .select("rfqs_id")
    .eq("supplier_id", supplierId);
  if (rfqLinkError || !rfqLinks?.length) {
    console.error("Error fetching supplier RFQ links:", rfqLinkError);
    return [];
  }

  const rfqIds = rfqLinks.map((link) => link.rfqs_id);

  const { data: rfqs, error: rfqsError } = await supabase.from("rfq").select("*").in("id", rfqIds);

  if (rfqsError || !rfqs?.length) {
    console.error("Error fetching RFQs:", rfqsError);
    return [];
  }

  const { data: submittedQuotes, error: submitQuoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("*")
    .eq("supplier_id", supplierId)
    .in("rfq_id", rfqIds);

  if (submitQuoteError) {
    console.error("Error fetching submitted quotes:", submitQuoteError);
  }

  const quoteMap = Object.fromEntries((submittedQuotes || []).map((q) => [q.rfq_id, q]));

  const techpackIds = [...new Set(rfqs.map((rfq) => rfq.techpack_id))];

  const { data: techpacks, error: techpackError } = await supabase
    .from("product_ideas")
    .select("*")
    .in("id", techpackIds);

  if (techpackError) {
    console.error("Error fetching techpacks:", techpackError);
    return [];
  }

  const techpackMap = Object.fromEntries(techpacks.map((tp) => [tp.id, tp]));

  const creatorIds = [...new Set(rfqs.map((rfq) => rfq.creator_id))];

  const { data: creators, error: creatorError } = await supabase
    .from("creator_profile")
    .select("*")
    .in("id", creatorIds);

  if (creatorError) {
    console.error("Error fetching creators:", creatorError);
    return [];
  }

  const creatorMap = Object.fromEntries(creators.map((c) => [c.id, c]));

  const combined = rfqs.map((rfq) => ({
    rfq,
    techpack: techpackMap[rfq.techpack_id] || null,
    creator: creatorMap[rfq.creator_id] || null,
    quote: quoteMap[rfq.id] || null,
  }));

  return combined;
}

export async function submitRFQ({ rfq_id, supplier_id, sample_price, moq, lead_time, message, status }: SubmitRfq) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  // Step 1: Check if a record already exists in supplier_rfqs_quotes
  const { data: existingQuote, error: fetchQuoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("id")
    .eq("rfq_id", rfq_id)
    .eq("supplier_id", supplier_id)
    .single();

  if (fetchQuoteError && fetchQuoteError.code !== "PGRST116") {
    console.error("Error fetching existing quote:", fetchQuoteError);
    return null;
  }

  let quoteData;

  if (existingQuote) {
    // If the quote exists, update it
    const { data, error: updateQuoteError } = await supabase
      .from("supplier_rfqs_quotes")
      .update({
        sample_price,
        moq,
        lead_time,
        message,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingQuote.id)
      .select("id")
      .single();

    if (updateQuoteError || !data) {
      console.error("Error updating quote:", updateQuoteError);
      return null;
    }

    quoteData = data;
  } else {
    // If the quote doesn't exist, insert a new one
    const { data, error: insertQuoteError } = await supabase
      .from("supplier_rfqs_quotes")
      .insert({
        rfq_id,
        supplier_id,
        sample_price,
        moq,
        lead_time,
        message,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertQuoteError || !data) {
      console.error("Error inserting new quote:", insertQuoteError);
      return null;
    }

    quoteData = data;
  }

  const { error: updateSupplierRfqError } = await supabase
    .from("supplier_rfqs_quotes")
    .update({ status: "responded", updated_at: new Date().toISOString() })
    .eq("rfq_id", rfq_id)
    .eq("supplier_id", supplier_id);

  if (updateSupplierRfqError) {
    console.error("Error updating supplier_rfqs_quotes status:", updateSupplierRfqError);
  }

  // Step 3: Update the rfq status to "quotes_recieved"
  const { error: updateRfqError } = await supabase
    .from("rfq")
    .update({ status: "quotes_recieved", updated_at: new Date().toISOString() })
    .eq("id", rfq_id);

  if (updateRfqError) {
    console.error("Error updating RFQ status:", updateRfqError);
  }

  return quoteData;
}

export const updateRfqStatus = async (rfqId: string, supplier_id: string, status: string | null) => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  // First, check if the record exists
  const { data: existingRecord, error: fetchError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("*")
    .eq("rfq_id", rfqId)
    .eq("supplier_id", supplier_id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is a "No rows found" error
    console.error("Error fetching record:", fetchError);
    return null;
  }

  // If the record exists, update the status
  if (existingRecord) {
    const { error: updateError } = await supabase
      .from("supplier_rfqs_quotes")
      .update({
        status, // can be null (archived, pending, etc.)
        updated_at: new Date().toISOString(),
      })
      .match({ rfq_id: rfqId, supplier_id });

    if (updateError) {
      console.error("Error updating RFQ status:", updateError);
      return null;
    }
  } else {
    // If no record exists, insert a new one with the status
    const { error: insertError } = await supabase.from("supplier_rfqs_quotes").insert({
      rfq_id: rfqId,
      supplier_id: supplier_id,
      status, // can be null
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error inserting new RFQ status:", insertError);
      return null;
    }
  }

  return true;
};

export async function fetchCreatorRfqs(creatorId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return [];
  }

  const { data: rfqs, error: rfqsError } = await supabase.from("rfq").select("*").eq("creator_id", creatorId);

  if (rfqsError || !rfqs?.length) {
    console.error("Error fetching RFQs:", rfqsError);
    return [];
  }

  const rfqIds = rfqs.map((r) => r.id);

  const { data: rfqLinks, error: rfqLinkError } = await supabase
    .from("supplier_rfqs")
    .select("rfqs_id, supplier_id")
    .in("rfqs_id", rfqIds);

  if (rfqLinkError) {
    console.error("Error fetching supplier RFQ links:", rfqLinkError);
    return [];
  }

  const { data: submittedQuotes, error: submitQuoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("*")
    .in("rfq_id", rfqIds);

  if (submitQuoteError) {
    console.error("Error fetching submitted quotes:", submitQuoteError);
  }

  const quoteMap = new Map();
  (submittedQuotes || []).forEach((q) => {
    quoteMap.set(`${q.rfq_id}_${q.supplier_id}`, q);
  });

  const techpackIds = [...new Set(rfqs.map((r) => r.techpack_id))];
  const { data: techpacks, error: techpackError } = await supabase
    .from("product_ideas")
    .select("*")
    .in("id", techpackIds);

  if (techpackError) {
    console.error("Error fetching techpacks:", techpackError);
    return [];
  }

  const techpackMap = Object.fromEntries(techpacks.map((tp) => [tp.id, tp]));

  const supplierIds = [...new Set(rfqLinks.map((link) => link.supplier_id))];
  const { data: suppliers, error: supplierError } = await supabase
    .from("supplier_profile")
    .select("*")
    .in("id", supplierIds);

  if (supplierError) {
    console.error("Error fetching supplier profiles:", supplierError);
    return [];
  }

  const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s]));

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

  const result = rfqs.map((rfq) => ({
    rfq,
    techpack: techpackMap[rfq.techpack_id] || null,
    suppliers: groupedMap.get(rfq.id) || [],
  }));

  return result;
}

export async function getSingleCreatorRfq(rfqId: string, creator_id: string) {
  const supabase = await createClient();

  // Fetch the RFQ based on rfqId and creator_id
  const { data: rfq, error: rfqError } = await supabase
    .from("rfq")
    .select("*")
    .eq("id", rfqId)
    .eq("creator_id", creator_id) // Use creator_id for validation
    .single();

  if (rfqError || !rfq) {
    console.error("Error fetching RFQ:", rfqError);
    return null;
  }

  // Fetch the related RFQ links for suppliers
  const { data: rfqLinks, error: rfqLinkError } = await supabase
    .from("supplier_rfqs")
    .select("rfqs_id, supplier_id")
    .eq("rfqs_id", rfqId);

  if (rfqLinkError) {
    console.error("Error fetching supplier RFQ links:", rfqLinkError);
    return null;
  }

  // Fetch submitted quotes for the RFQ
  const { data: submittedQuotes, error: submitQuoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .select("*")
    .eq("rfq_id", rfqId);

  if (submitQuoteError) {
    console.error("Error fetching submitted quotes:", submitQuoteError);
  }

  // Create a map for the quotes to match rfq_id and supplier_id
  const quoteMap = new Map();
  (submittedQuotes || []).forEach((q) => {
    quoteMap.set(`${q.rfq_id}_${q.supplier_id}`, q);
  });

  // Fetch the techpack data based on rfq.techpack_id
  const { data: techpack, error: techpackError } = await supabase
    .from("product_ideas")
    .select("*")
    .eq("id", rfq.techpack_id)
    .single();

  if (techpackError) {
    console.error("Error fetching techpack:", techpackError);
  }

  // Fetch the creator profile data based on rfq.creator_id
  const { data: creator, error: creatorError } = await supabase
    .from("creator_profile")
    .select("*")
    .eq("id", creator_id) // Use creator_id to fetch the correct creator profile
    .single();

  if (creatorError) {
    console.error("Error fetching creator:", creatorError);
  }

  // Map suppliers and their status + quotes
  const supplierIds = [...new Set(rfqLinks.map((link) => link.supplier_id))];
  const { data: suppliers, error: supplierError } = await supabase
    .from("supplier_profile")
    .select("*")
    .in("id", supplierIds);

  if (supplierError) {
    console.error("Error fetching supplier profiles:", supplierError);
    return null;
  }

  const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s]));

  const groupedMap = new Map();
  rfqLinks.forEach((link) => {
    const rfqId = link.rfqs_id;
    const key = `${rfqId}_${link.supplier_id}`;
    const supplierProfile = supplierMap[link.supplier_id];
    const quote = quoteMap.get(key);

    const supplierInfo = {
      profile: supplierProfile || null,
      // status: link.status || null,
      quote: quote || null,
    };

    if (!groupedMap.has(rfqId)) {
      groupedMap.set(rfqId, []);
    }
    groupedMap.get(rfqId).push(supplierInfo);
  });

  // Return the required structure with rfq, techpack, creator, and suppliers
  return {
    rfq,
    techpack: techpack || null,
    creator: creator || null,
    suppliers: groupedMap.get(rfq.id) || [],
  };
}

export async function AcceptRFQ({ rfq_id, supplier_id, status }: AcceptRFQ) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  // Step 1: Insert supplier quote
  const { data: quoteData, error: quoteError } = await supabase
    .from("supplier_rfqs_quotes")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("rfq_id", rfq_id)
    .eq("supplier_id", supplier_id)
    .select();
  if (quoteError || !quoteData) {
    console.error("Insert quote error:", quoteError);
    return null;
  }

  return quoteData;
}

export const updateRfqCreatorStatus = async (rfqId: string, status: string) => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { error: updateSupplierRfqError } = await supabase
    .from("rfq")
    .update({
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rfqId);

  if (updateSupplierRfqError) {
    console.error("Error updating RFQ status:", updateSupplierRfqError);
    return null;
  }

  return true;
};
