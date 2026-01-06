"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/lib/zustand/useStore";
import FinancialEstimator from "./financialEstimator";

interface TechPack {
  id: string;
  tech_pack: {
    productName: string;
    productOverview: string;
  };
  user_id: string;
}

export default function FinancialsPage() {
  const params = useParams();
  const { id } = params;

  return <FinancialEstimator id={id} />;
}
