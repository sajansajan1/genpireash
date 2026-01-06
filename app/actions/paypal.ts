"use server";

import { getCurrentUser } from "@/lib/auth-service";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
export async function createPayment({ price, des }: { price: number; des: string }) {
  console.log("description ==> ", des);
  console.log("price ==> ", price);
  if (!price || price <= 0 || !des) {
    return { error: "Invalid price or description" };
  }
  // const ALLOWED_PLANS: Record<string, string> = {
  //   "9.99": "15 Credits",
  //   "29.00": "50 Credits",
  //   "79.00": "150 Credits",
  //   "199.00": "500 Credits",
  // };

  // const formattedPrice = price.toFixed(2);

  // if (!(formattedPrice in ALLOWED_PLANS) || ALLOWED_PLANS[formattedPrice] !== des) {
  //   return { error: "Payment cancelled. Price or description mismatch." };
  // }
  const client_id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;
  const paypal_base_url = process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL;

  if (!client_id || !client_secret || !paypal_base_url) {
    console.error("Missing PayPal credentials or base URL");
    return { error: "Server configuration error" };
  }

  try {
    // Step 1: Get access token
    const authRes = await fetch(`${paypal_base_url}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.access_token) {
      console.error("Failed to get access token", authData);
      return { error: "Failed to authenticate with PayPal" };
    }

    const accessToken = authData.access_token;

    // Step 2: Create order
    const orderRes = await fetch(`${paypal_base_url}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: des,
            amount: {
              currency_code: "USD",
              value: price.toFixed(2),
            },
          },
        ],
        application_context: {
          user_action: "PAY_NOW",
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.id) {
      console.error("Failed to create PayPal order", orderData);
      return { error: "Failed to create PayPal order" };
    }

    return { success: true, id: orderData.id };
  } catch (error) {
    console.error("Error creating PayPal payment:", error);
    return { error: "Server error creating payment" };
  }
}

export async function createSubscription({ price, des }: { price: number; des: string }) {
  console.log("description ==> ", des);
  console.log("price ==> ", price);

  if (!price || price <= 0 || !des) {
    return { error: "Invalid price, description, or plan ID" };
  }
  //live creds
  const planIdMap: Record<string, string> = {
    "19.9": "P-1UP815479U477693UNDOQMHY",
    "39.9": "P-9K6176931R800784VNDOQMZQ",
    "178": "P-5TK03293UD298615ENDOQNFA",
    "358": "P-41S964089P8080520NDOQNPQ",
  };
  //sandbox creds
  // const planIdMap: Record<string, string> = {
  //   "19.9": "P-666303557S974712WNDNZI2I",
  //   "39.9": "P-4SR48308US546525GNDNZJOI",
  //   "178": "P-0D918129TL046734MNDNZKPA",
  //   "358": "P-8WV94625R0248794XNDNZK7I",
  // };

  const plan_id = planIdMap[price.toString()];
  //live
  const client_id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;

  //sandbox
  // const client_id = "AWYEMptRJXb6CEtKo2EzXxqL8ZmyzekusBRjqFtlcGkEQzgEMbZfHRKCy0kGqHGeiiFpNEOZJ4WoCnND";
  // const client_secret = "EK7tzV9wcBbuoviagoY_PYHLc3j0qwI9DT9fsNwvcAD_huIiauW0Gi7fna9kRYK1I86YagFEUsaLdw4U";
  const paypal_base_url = process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL;
  if (!client_id || !client_secret || !paypal_base_url) {
    console.error("Missing PayPal credentials or base URL");
    return { error: "Server configuration error" };
  }

  try {
    // Step 1: Get access token
    const authRes = await fetch(`${paypal_base_url}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.access_token) {
      console.error("Failed to get access token", authData);
      return { error: "Failed to authenticate with PayPal" };
    }

    const accessToken = authData.access_token;

    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 1); // Start 1 minute from now

    const subscriptionRes = await fetch(`${paypal_base_url}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "PayPal-Request-Id": "SUBSCRIPTION-21092019-001",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: plan_id,
        start_time: startTime.toISOString(),
        // shipping_amount: {
        //   currency_code: "USD",
        //   value: price,
        // },
        application_context: {
          brand_name: "Genpire",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: process.env.NEXT_PUBLIC_SITE_URL,
          cancel_url: process.env.NEXT_PUBLIC_SITE_URL,
        },
      }),
    });

    const subscriptionData = await subscriptionRes.json();
    console.log("subscriptionData ==> ", subscriptionData);

    if (!subscriptionRes.ok || !subscriptionData.id) {
      console.error("Failed to create PayPal subscription", subscriptionData);
      return { error: "Failed to create PayPal subscription" };
    }

    return { success: true, id: subscriptionData.id };
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);
    return { error: "Server error creating subscription" };
  }
}

export async function cancelSubscription({ subId, des }: { des: string; subId: string }) {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) {
    return { error: "User not authenticated" };
  }

  const client_id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;
  // const client_id = "AWYEMptRJXb6CEtKo2EzXxqL8ZmyzekusBRjqFtlcGkEQzgEMbZfHRKCy0kGqHGeiiFpNEOZJ4WoCnND";
  // const client_secret = "EK7tzV9wcBbuoviagoY_PYHLc3j0qwI9DT9fsNwvcAD_huIiauW0Gi7fna9kRYK1I86YagFEUsaLdw4U";
  const paypal_base_url = process.env.NEXT_PUBLIC_PAYPAL_API_BASE_URL;
  if (!client_id || !client_secret || !paypal_base_url) {
    console.error("Missing PayPal credentials or base URL");
    return { error: "Server configuration error" };
  }

  try {
    // Step 1: Get access token
    const authRes = await fetch(`${paypal_base_url}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.access_token) {
      console.error("Failed to get access token", authData);
      return { error: "Failed to authenticate with PayPal" };
    }

    const accessToken = authData.access_token;

    const subscriptionRes = await fetch(`${paypal_base_url}/v1/billing/subscriptions/${subId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        reason: des,
      }),
    });

    let subscriptionData = null;

    if (subscriptionRes.status !== 204) {
      try {
        const text = await subscriptionRes.text();
        subscriptionData = text ? JSON.parse(text) : null;
      } catch (err) {
        console.warn("Could not parse JSON from PayPal cancel response", err);
      }
    }

    if (!subscriptionRes.ok) {
      console.error("Failed to cancel PayPal subscription", subscriptionData);
      return { error: "Failed to cancel PayPal subscription" };
    }
    const { data: subData, error: subError } = await supabase
      .from("user_credits")
      .select("*")
      .eq("subscription_id", subId)
      .single();

    if (subError || !subData) {
      console.error("Failed to fetch user credits", subError);
      return { error: "Failed to fetch user credits" };
    }
    const createdAt = new Date(subData.created_at);
    const now = new Date();
    const year = now.getFullYear();
    const nextMonth = now.getMonth() + 1;
    const hours = createdAt.getHours();
    const minutes = createdAt.getMinutes();
    const seconds = createdAt.getSeconds();
    const expiresAt = new Date(year, nextMonth, 1, hours, minutes, seconds);
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({
        subscription_status_canceled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", subId);

    if (updateError) {
      console.error("Failed to update user credits", updateError);
      return { error: "Cancelled subscription but failed to update user credits" };
    }
    return {
      success: true,
      expiresAt: expiresAt.toISOString(),
      paypal: subscriptionData || { message: "Cancelled successfully" },
    };
  } catch (error) {
    console.error("Error cancel PayPal subscription:", error);
    return { error: "Server error cancelling subscription" };
  }
}
