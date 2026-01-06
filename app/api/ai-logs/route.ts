import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiLogger } from "@/lib/logging/ai-logger";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");
    const techPackId = searchParams.get("tech_pack_id");
    const sessionId = searchParams.get("session_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const limit = searchParams.get("limit");

    // Check if user is admin for viewing all logs
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    // Handle different actions
    if (action === "stats") {
      // Get usage statistics
      const stats = await aiLogger.getUsageStats(
        isAdmin ? undefined : user.id,
        startDate || undefined,
        endDate || undefined
      );

      return NextResponse.json({
        success: true,
        data: stats
      });
    } else if (action === "logs") {
      // Get logs with filters
      const logs = await aiLogger.getLogs({
        user_id: isAdmin ? undefined : user.id,
        tech_pack_id: techPackId || undefined,
        session_id: sessionId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        limit: limit ? parseInt(limit) : 100
      });

      return NextResponse.json({
        success: true,
        data: logs
      });
    } else if (action === "summary") {
      // Get a summary for the current user
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const [stats, recentLogs] = await Promise.all([
        aiLogger.getUsageStats(
          user.id,
          thirtyDaysAgo.toISOString(),
          today.toISOString()
        ),
        aiLogger.getLogs({
          user_id: user.id,
          limit: 10
        })
      ]);

      return NextResponse.json({
        success: true,
        data: {
          stats,
          recentLogs,
          period: {
            start: thirtyDaysAgo.toISOString(),
            end: today.toISOString()
          }
        }
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'stats', 'logs', or 'summary'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching AI logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "flush") {
      // Force flush pending logs to database
      await aiLogger.forceFlush();
      
      return NextResponse.json({
        success: true,
        message: "Logs flushed successfully"
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'flush'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing AI logs request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
