"use client";
import type React from "react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/zustand/useStore";
import { useUserProfileStore } from "@/lib/zustand/getUserProfile";
import { useCreatorProfileStore } from "@/lib/zustand/creator/getCreatorProfile";
import { useRouter } from "next/navigation";
import { useGetNotificationsStore } from "@/lib/zustand/notifications/getNotification";
import { useProductIdeasStore } from "@/lib/zustand/techpacks/getAllTechPacks";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";

import { GenPWidget } from "@/components/gen-p-widget";
import CreatorHeaderLoading from "@/app/creator-dashboard/headerLoading";
import CreatorSidebarLoading from "@/app/creator-dashboard/sidebarLoading";
import CreatorDashboardLoading from "@/app/creator-dashboard/loading";
const DashboardHeader = dynamic(
    () => import("@/components/dashboard/dashboard-header").then((mod) => mod.DashboardHeader),
    {
        loading: () => <CreatorHeaderLoading />,
    }
);
const RoleBasedSidebar = dynamic(
    () => import("@/components/shared/role-based-sidebar").then((mod) => mod.RoleBasedSidebar),
    {
        loading: () => <CreatorSidebarLoading />,
    }
);
export default function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
    console.log("🏠 CreatorDashboardLayout rendering");

    const [loading, setLoading] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const { loadingUserProfile, errorUserProfile, fetchUserProfile } = useUserProfileStore();
    const { fetchCreatorProfile, loadingCreatorProfile, errorCreatorProfile } = useCreatorProfileStore();
    const { fetchProductIdeas, productIdeas } = useProductIdeasStore();
    const { fetchCreatorCredits } = useGetCreditsStore();

    console.log("🔍 Layout state:", { loading, isMobileSidebarOpen });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                const userFetched = useUserProfileStore.getState().hasFetchedUserProfile;
                const creatorFetched = useCreatorProfileStore.getState().hasFetched;
                const creatorCreditsFetched = useGetCreditsStore.getState().hasFetchedCreatorCredits;
                const fetchPromises = [];

                if (!userFetched) {
                    fetchPromises.push(fetchUserProfile());
                }
                if (!creatorCreditsFetched) {
                    fetchPromises.push(fetchCreatorCredits());
                }

                if (!creatorFetched) {
                    fetchPromises.push(fetchCreatorProfile());
                }
                await Promise.all(fetchPromises);

                const user = useUserProfileStore.getState().getUserProfile;
                const creator = useCreatorProfileStore.getState().getCreatorProfile;
                useUserStore.getState().setUser(user);
                useUserStore.getState().setCreatorProfile(creator);
            } catch (err) {
                console.error("Error fetching profiles:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    useEffect(() => {
        if (!productIdeas) fetchProductIdeas();
    }, [productIdeas, fetchProductIdeas]);

    if (loading) {
        return <CreatorDashboardLoading />;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header - Full width, on top of everything */}
            <div id="dashboard-header" className="sticky top-0 z-50 w-full bg-background border-b">
                <DashboardHeader onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
            </div>

            {/* Sidebar - Fixed position, below header */}
            <div
                className="fixed left-0 bottom-0 z-40 w-64 hidden lg:block overflow-y-auto scrollbar-hide pointer-events-none"
                style={{ top: "var(--header-height, 64px)" }}
            >
                <RoleBasedSidebar isMobileOpen={isMobileSidebarOpen} onMobileOpenChange={setIsMobileSidebarOpen} />
            </div>

            {/* Main Content Area */}
            <div className="lg:ml-64 transition-all duration-300 ease-in-out">
                <main className="container mx-auto px-4 py-6 pt-8">{children}</main>
            </div>
            <GenPWidget />
        </div>
    );
}