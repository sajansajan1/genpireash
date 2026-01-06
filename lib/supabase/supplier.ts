"use server";

import { createClient } from "@/lib/supabase/server";
import { manufacturing_capabilities, supplierProfile } from "../types/tech-packs";

export async function createSupplierProfile({
  company_name,
  location,
  website,
  company_description,
  email,
  contact,
  full_name,
  address,
  company_logo, // if this is for images
  manufacturingID,
}: supplierProfile) {
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
    .from("supplier_profile")
    .insert({
      user_id: user.id,
      company_name,
      location,
      website,
      company_description,
      email,
      contact,
      full_name,
      address,
      manufacturingID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Insert error supplier profile:", error);
    return null;
  }

  return data;
}

export async function manufacturingCapabilities({
  product_categories,
  material_specialist,
  moq,
  leadTimeMin,
  leadTimeMax,
  samplePricing,
  productionCapacity,
  certifications,
  isExclusive,
  aboutFactory,
  export_market,
  product_capability,
}: manufacturing_capabilities) {
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
    .from("manufacturing_capabilities")
    .insert({
      product_categories,
      material_specialist,
      moq,
      leadTimeMin,
      leadTimeMax,
      samplePricing,
      productionCapacity,
      certifications,
      isExclusive,
      aboutFactory,
      product_capability,
      export_market,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Insert error manufacturing capability:", error);
    return null;
  }

  return data;
}

export async function getAllSuppliers() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data: suppliers, error } = await supabase
    .from("supplier_profile")
    .select("*, manufacturingID")
    .eq("role", "supplier");

  if (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }

  if (!suppliers.length) return [];

  const manufacturingIDs = [...new Set(suppliers.map((s) => s.manufacturingID).filter(Boolean))];

  const { data: manufacturingData, error: manufacturingError } = await supabase
    .from("manufacturing_capabilities")
    .select("*")
    .in("id", manufacturingIDs);
  if (manufacturingError) {
    console.error("Error fetching manufacturing details:", manufacturingError);
    return suppliers;
  }
  const manufacturingMap = Object.fromEntries(manufacturingData.map((m) => [m.id, m]));
  const enrichedSuppliers = suppliers.map((supplier) => ({
    ...supplier,
    manufacturing: manufacturingMap[supplier.manufacturingID] || null,
  }));

  return enrichedSuppliers;
}

export async function getSingleSupplier(supplier_id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }
  const { data: supplier, error: supplierError } = await supabase
    .from("supplier_profile")
    .select("*")
    .eq("id", supplier_id)
    .single();

  if (supplierError || !supplier) {
    console.error("Error fetching supplier:", supplierError);
    return null;
  }

  let manufacturing = null;
  if (supplier.manufacturingID) {
    const { data: manufacturingData, error: manufacturingError } = await supabase
      .from("manufacturing_capabilities")
      .select("*")
      .eq("id", supplier.manufacturingID)
      .single();

    if (manufacturingError) {
      console.error("Error fetching manufacturing details:", manufacturingError);
    } else {
      manufacturing = manufacturingData;
    }
  }

  return {
    ...supplier,
    manufacturing,
  };
}

export const getSupplierProfile = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }
  const { data: supplier, error: supplierError } = await supabase
    .from("supplier_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (supplierError || !supplier) {
    console.error("Error fetching supplier profile:", supplierError);
    return null;
  }

  let manufacturing = null;
  if (supplier.manufacturingID) {
    const { data: manufacturingData, error: manufacturingError } = await supabase
      .from("manufacturing_capabilities")
      .select("*")
      .eq("id", supplier.manufacturingID)
      .single();
    if (manufacturingError) {
      console.error("Error fetching manufacturing details:", manufacturingError);
    } else {
      manufacturing = manufacturingData;
    }
  }

  return {
    ...supplier,
    manufacturing,
  };
};

export async function updateSupplierProfile({
  company_name,
  full_name,
  email,
  contact,
  location,
  address,
  website,
  company_description,
  company_logo,
  manufacturing,
}: supplierProfile & { manufacturing?: any }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error:", userError);
    return null;
  }

  const { data: profileData, error: profileError } = await supabase
    .from("supplier_profile")
    .update({
      company_name,
      full_name,
      email,
      contact,
      location,
      address,
      website,
      company_description,
      company_logo: company_logo || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (profileError) {
    console.error("Update error supplier_profile:", profileError);
    return null;
  }
  // Initialize manufacturingData variable
  let manufacturingData = null;

  if (manufacturing) {
    const { data, error } = await supabase
      .from("manufacturing_capabilities")
      .update({
        product_categories: manufacturing.product_categories || [],
        product_capability: manufacturing.product_capability || [],
        material_specialist: manufacturing.material_specialist || [],
        export_market: manufacturing.export_market || [],
        moq: manufacturing.moq || "",
        leadTimeMin: manufacturing.leadTimeMin || "",
        leadTimeMax: manufacturing.leadTimeMax || "",
        samplePricing: manufacturing.samplePricing || "",
        productionCapacity: manufacturing.productionCapacity || "",
        certifications: manufacturing.certifications || [],
        aboutFactory: manufacturing.aboutFactory || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileData.manufacturingID)
      .select()
      .single();

    if (error) {
      console.error("Update error manufacturing_capabilities:", error);
    } else {
      manufacturingData = data;
    }
  }

  const mergedProfile = {
    ...profileData,
    manufacturing: manufacturingData,
  };

  return mergedProfile;
}
