// app/api/paypal-capture/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getUserProfile } from "@/lib/auth-service";
import { CreateCredits, createPayment } from "@/lib/supabase/payments";
import { sendRfqPurchaseConfiramtionEmail } from "@/app/actions/send-mail";
import { createClient } from "@/lib/supabase/server";

function getQuantityFromPrice(price: string, hasOffer: boolean): string {
  console.log("price ==> ", price);

  let quantity = 0;

  if (price === "14.90") quantity = 30;
  else if (price === "11.90") quantity = 20;
  else if (price === "29.90") quantity = 65;
  else if (price === "49.90") quantity = 120;
  else if (price === "69.90") quantity = 200;
  else if (price === "99.90") quantity = 650;

  // Apply 25% extra if offer is true
  if (hasOffer) {
    quantity = Math.round(quantity * 1.25);
  }

  return quantity.toString();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("body ==> ", body);
  const { orderID } = body;
  const supabase = await createClient();
  const user = await getCurrentUser();
  const profile = await getUserProfile();
  console.log("profile ==> ", profile);
  console.log("user ==> ", user);

  const client_id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;

  if (!orderID || !client_id || !client_secret) {
    return NextResponse.json({ error: "Missing data or PayPal credentials" }, { status: 400 });
  }

  const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
  console.log("basicAuth ==> ", basicAuth);

  try {
    // Get access token
    const authRes = await fetch(`${process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();
    console.log("authData ==> ", authData);
    const accessToken = authData.access_token;

    if (!accessToken) throw new Error("No access token");

    // Capture order
    const captureRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
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
    if (!capture || captureData.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const price = capture.amount.value;
    console.log("price ==> ", price);
    const hasOffer = profile?.offers ?? false;
    const quantity = parseFloat(getQuantityFromPrice(price, hasOffer));
    console.log("quantity ==> ", quantity);
    const currency = capture.amount.currency_code;
    console.log("currency ==> ", currency);

    if (user) {
      console.log("user ==> ", user);
      const paymentCreation = await createPayment({
        user_id: user.id,
        quantity,
        price: price,
        payment_status: captureData.status,
        payer_id: captureData.payer.payer_id,
        payer_name: `${captureData.payer.name.given_name} ${captureData.payer.name.surname}`,
        payer_address: captureData.payer.address.country_code,
        payer_email: captureData.payer.email_address,
        currency,
      });

      if (paymentCreation?.user_id) {
        await supabase.from("user_credits").insert([
          {
            user_id: paymentCreation.user_id,
            credits: quantity,
            expires_at: null,
            subscription_id: null,
            status: "active",
            plan_type: "one_time",
            membership: price === "99.90" ? "pro" : "add_on",
            created_at: new Date().toISOString(),
          },
        ]);
        if (hasOffer) {
          console.log("Updating user offers info");
          const { data: updatedUser, error: updateError } = await supabase
            .from("users")
            .update({
              offers: false,
              offer_plan_buy: "one_time",
              offer_price_buy: price,
            })
            .eq("id", user.id)
            .select("id")
            .single();

          if (updateError) {
            console.error("Error updating user offers info:", updateError);
            // return NextResponse.json({ error: "Error updating user ambassador info" }, { status: 500 });
          }
        }
        // await CreateCredits({
        //   user_id: paymentCreation.user_id,
        //   credits: quantity,
        // });

        await sendRfqPurchaseConfiramtionEmail({
          email: user.email,
          creatorName: user.user_metadata.full_name,
          credits: quantity,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
