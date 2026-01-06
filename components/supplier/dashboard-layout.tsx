"use client";
import type React from "react";
import { RoleBasedSidebar, type RoleBasedSidebarRef } from "@/components/shared/role-based-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState, useRef } from "react";
import type { UserDetails, UserProfile } from "@/lib/types/tech-packs";
import { getUserProfile } from "@/lib/auth-service";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useRouter } from "next/navigation";
import { getSupplierProfile } from "@/lib/supabase/supplier";
import { useUserStore } from "@/lib/zustand/useStore";
import SupplierDashboardLoading from "@/app/supplier-dashboard/loading";
import ShowSupplierStatus from "@/app/supplier-dashboard/application-approval";


export default function SupplierDashboardLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const sidebarRef = useRef<RoleBasedSidebarRef>(null);
    const { supplierProfile } = useUserStore();
    useEffect(() => {
        async function fetchProfile() {
            const fetchedUser = await getUserProfile();
            if (fetchedUser?.verified_status === false) {
                router.push("/onboarding/manufacturer");
                return;
            }
            const fetchedProfile = await getSupplierProfile();
            console.log("fetchedProfile ==> ", fetchedProfile);

            useUserStore.getState().setUser(fetchedUser);
            useUserStore.getState().setSupplierProfile(fetchedProfile);
            setLoading(false);
        }

        fetchProfile();
    }, []);

    const handleMobileMenuToggle = () => {
        sidebarRef.current?.toggleMobileMenu();
    };

    if (loading) {
        return <SupplierDashboardLoading />;
    }

    if (!supplierProfile?.verified_profile) {
        return <ShowSupplierStatus />;
    }
    return (
        <div className="flex h-screen flex-col overflow-hidden">
            <DashboardHeader onMobileMenuToggle={handleMobileMenuToggle} />

            <div className="flex flex-1 overflow-hidden">
                <RoleBasedSidebar ref={sidebarRef} role="supplier" />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>

            <Toaster />
        </div>
    );
}
