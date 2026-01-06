"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/lib/zustand/useStore";
import OrderManagement from "./orderManagement";

export default function OrdersPage() {
  const params = useParams();
  const { id } = params;

  return <OrderManagement id={id} />;
}
