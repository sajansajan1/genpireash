import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const pixelId = process.env.NEXT_PUBLIC_PIXEL_ID!;
        const accessToken = process.env.NEXT_PUBLIC_META_ACCESS_TOKEN!;
        const apiVersion = process.env.FB_API_VERSION || "v17.0";

        // Include the test event code during testing ONLY
        const testEventCode = process.env.FB_TEST_EVENT_CODE;

        const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`;

        const payload = {
            data: [
                {
                    event_name: body.event_name || "PageView",
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: "website",
                    event_id: body.event_id || undefined,
                    user_data: {
                        client_ip_address: req.headers.get("x-forwarded-for") ?? "0.0.0.0",
                        client_user_agent: req.headers.get("user-agent") ?? "",
                        em: body.email ? [sha256(body.email)] : undefined,
                    },
                    custom_data: body.custom_data || {},
                },
            ],
            test_event_code: testEventCode,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const fbResponse = await response.json();
        return NextResponse.json(fbResponse);
    } catch (error) {
        console.error("CAPI Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// Simple SHA-256 hashing
function sha256(str: string) {
    return require("crypto").createHash("sha256").update(str).digest("hex");
}
