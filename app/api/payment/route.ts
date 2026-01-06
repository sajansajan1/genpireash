import { sendRfqPurchaseConfiramtionEmail } from "@/app/actions/send-mail";
import { getCurrentUser } from "@/lib/auth-service";
import { CreateCredits, createPayment } from "@/lib/supabase/payments";
import { NextRequest, NextResponse } from "next/server";

function getQuantityFromPrice(price: string): string {
  if (price === "9.99") return "15";
  if (price === "29.00") return "50";
  if (price === "79.00") return "150";
  if (price === "199.00") return "500";
  return "0";
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const token = searchParams.get("token");

  const client_id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return NextResponse.json({ error: "PayPal credentials missing" }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  try {
    const authRes = await fetch(`${process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    if (!accessToken) {
      throw new Error("Failed to obtain PayPal access token");
    }

    const captureRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL}/v2/checkout/orders/${token}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = await captureRes.json();

    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) {
      console.error("Missing capture data");
      return NextResponse.json({ error: "Capture data not found" }, { status: 400 });
    }
    const price = capture.amount.value;
    const quantity = parseFloat(getQuantityFromPrice(price));
    const currency = capture.amount.currency_code;
    const paymentStatus = captureData.status;

    if (paymentStatus === "COMPLETED" && user) {
      const paymentCreation = await createPayment({
        user_id: user.id,
        quantity,
        price: price,
        payment_status: paymentStatus,
        payer_id: captureData.payer.payer_id,
        payer_name: `${captureData.payer.name.given_name} ${captureData.payer.name.surname}`,
        payer_address: captureData.payer.address.country_code,
        payer_email: captureData.payer.email_address,
        currency,
      });

      const userId = paymentCreation?.user_id;
      if (userId) {
        const data = await CreateCredits({
          user_id: userId,
          credits: quantity,
        });
      }
      const res = await sendRfqPurchaseConfiramtionEmail({
        email: user.email,
        creatorName: user.user_metadata.full_name,
        credits: quantity,
      });
      if (res.success) {
        console.log("Purchase email sent");
      } else {
        console.error(res.message);
      }
    } else if (paymentStatus !== "COMPLETED") {
      console.log("Payment failed or incomplete. No credits will be added.");
    }

    if (!captureRes.ok) {
      console.error("PayPal capture failed:", captureData);
      return NextResponse.json({ error: "Failed to capture payment" }, { status: 400 });
    }

    return NextResponse.json({ success: true, capture: captureData });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json({ error: "Internal error capturing payment" }, { status: 500 });
  }
}
