export async function sendServerEvent() {
    await fetch("/api/fb-server-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            event_name: "PageView",
            event_id: "pageview-123", // must match browser pixel for deduplication
            custom_data: {},
        }),
    });
}