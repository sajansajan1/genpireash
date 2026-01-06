"use client";

import { useState } from "react";
import {
  Bell,
  Pin,
  Briefcase,
  MessageCircle,
  BellRing,
  CreditCard,
  CheckCircle2,
  PartyPopper
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { fetchNotification, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/supabase/notifications";
import useSWR, { mutate } from "swr";

export function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    data: notifications,
    error: notificationError,
    isLoading: loadingnotification,
  } = useSWR("notification", () => fetchNotification(), {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  const handleNotificationClick = async (notificationId: string) => {
    if (!notifications) return;

    const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n));

    mutate("notification", updatedNotifications, false);

    try {
      await markNotificationAsRead(notificationId);
      mutate("notification");
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      mutate("notification", notifications, false);
    }
    setOpen(false);
  };

  const markAllAsRead = async () => {
    if (!notifications) return;

    const updatedNotifications = notifications.map((n) => ({
      ...n,
      read: true,
    }));

    mutate("notification", updatedNotifications, false);

    try {
      await markAllNotificationsAsRead();
      mutate("notification");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      mutate("notification", notifications, false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";

    switch (type) {
      case "rfq_response":
        return <Pin className={`${iconClass} text-[#8B7355]`} />; // Medium brown
      case "rfq_update":
        return <Briefcase className={`${iconClass} text-[#6B5D4F]`} />; // Dark brown
      case "message":
        return <MessageCircle className={`${iconClass} text-[#9C8573]`} />; // Light brown
      case "system":
        return <BellRing className={`${iconClass} text-[#A89584]`} />; // Accent beige
      case "billing":
        return <CreditCard className={`${iconClass} text-[#7A6B5D]`} />; // Medium-dark brown
      case "tech_pack_ready":
        return <CheckCircle2 className={`${iconClass} text-[#8B7355]`} />; // Medium brown
      case "welcome":
        return <PartyPopper className={`${iconClass} text-[#9C8573]`} />; // Light brown
      default:
        return <Pin className={`${iconClass} text-[#736558]`} />; // Muted brown
    }
  };

  if (loadingnotification || !notifications) {
    return (
      <div>
        <Button variant="outline" size="icon" className="relative bg-white">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  if (notificationError) {
    return (
      <div>
        {" "}
        <Button variant="outline" size="icon" className="relative bg-transparent">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white border-2 border-background text-[10px]">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-[#1C1917]">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto text-xs py-1 text-[#8B7355] hover:text-[#6B5D4F] hover:bg-[#F4F3F0]"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem
                  className={`flex flex-col items-start p-3 cursor-pointer transition-colors ${
                    !notification.read ? "bg-[#F4F3F0]" : "hover:bg-[#FAFAF9]"
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex w-full gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 w-full">
                        <p className="font-medium text-sm flex-1 text-[#1C1917]">{notification.title}</p>
                        <p className="text-xs text-[#736558] whitespace-nowrap">
                          {formatDistanceToNow(notification.created_at, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-[#8B7355] mt-1 line-clamp-2">{notification.message}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < notifications.length - 1 && (
                  <div className="mx-3 border-b border-[#E5DDD5]" />
                )}
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-[#1C1917]">
              <p>No notifications</p>
            </div>
          )}
        </DropdownMenuGroup>
        {/* Commented out - View all notifications button */}
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm font-medium text-[#8B7355] hover:text-[#6B5D4F] hover:bg-[#F4F3F0]"
          onClick={() => {
            router.push("/creator-dashboard/notifications");
            setOpen(false);
          }}
        >
          View all notifications
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
