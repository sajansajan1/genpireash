import {
  sendSaverSubscriptionConfirmationMail,
  sendProSubscriptionConfirmationMail,
  sendSuperSubscriptionConfirmationMail,
} from "@/app/actions/send-mail";
import { getCurrentUser, getUserProfile } from "@/lib/auth-service";
import { createPayment } from "@/lib/supabase/payments";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subscriptionID, price, membership, planType } = body;
  const supabase = await createClient();
  const user = await getCurrentUser();
  const profile = await getUserProfile();
  console.log("profile ==> ", profile);
  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  if (!profile) {
    return NextResponse.json({ error: "Error to find the profile details of the user" }, { status: 401 });
  }

  const user_id = user.id;
  const hasOffer = profile?.offers ?? false;
  const isEduEmail = user?.email ? /@[\w.-]*\.edu(\.[\w]+)?$/i.test(user.email) : false;

  // Base pro credits, ignoring edu bonus if there's an offer
  const proCredits = !hasOffer && isEduEmail ? 250 : 150;

  // Determine quantity based on membership type
  let quantity = membership === "saver" ? 75 : proCredits;

  // Apply offer multiplier if there's an offer
  if (hasOffer) {
    quantity = Math.round(quantity * 1.25);
  }
  try {
    // ===========================================
    // STEP 1: Find and expire existing active credits, carry over remaining credits
    // ===========================================
    const { data: existingCredits, error: fetchError } = await supabase
      .from("user_credits")
      .select("id, credits, membership, plan_type, status")
      .eq("user_id", user_id)
      .eq("status", "active");

    if (fetchError) {
      console.error("Error fetching existing credits:", fetchError);
    }

    let carryOverCredits = 0;

    if (existingCredits && existingCredits.length > 0) {
      console.log(`Found ${existingCredits.length} existing active credit records for user ${user_id}`);

      // Sum up all remaining credits from existing records
      for (const record of existingCredits) {
        console.log(`Existing record: ${record.id}, membership: ${record.membership}, credits: ${record.credits}`);
        carryOverCredits += record.credits || 0;

        // Mark the old record as expired
        const { error: expireError } = await supabase
          .from("user_credits")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", record.id);

        if (expireError) {
          console.error(`Error expiring old credit record ${record.id}:`, expireError);
        } else {
          console.log(`Expired old credit record ${record.id}`);
        }
      }

      console.log(`Total carry-over credits from old records: ${carryOverCredits}`);
    }

    // Add carry-over credits to new subscription credits
    const totalCredits = quantity + carryOverCredits;
    console.log(`New subscription credits: ${quantity}, Carry-over: ${carryOverCredits}, Total: ${totalCredits}`);

    // ===========================================
    // STEP 2: Create the new subscription credit record
    // ===========================================

    // For $49 monthly subscription - give monthly credits that expire
    if (planType === "monthly") {
      const expires_at = new Date();
      expires_at.setMonth(expires_at.getMonth() + 1);

      const { error, data } = await supabase.from("user_credits").insert([
        {
          user_id,
          credits: totalCredits,
          expires_at: expires_at.toISOString(),
          subscription_id: subscriptionID,
          status: "active",
          plan_type: "monthly",
          membership,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Database Credits error:", error);
        return NextResponse.json({ error: error || "Failed to Save the credits in database" }, { status: 500 });
      }
      console.log(data, "data");
      console.log(`Monthly subscription activated for user ${user_id} with ${totalCredits} credits (${carryOverCredits} carried over)`);
    } else {
      const expires_at = new Date();
      expires_at.setFullYear(expires_at.getFullYear() + 1); // Add 1 year

      const { data, error } = await supabase.from("user_credits").insert([
        {
          user_id,
          credits: totalCredits,
          expires_at: expires_at.toISOString(),
          subscription_id: subscriptionID,
          status: "active",
          plan_type: "yearly",
          membership,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Database Credits error:", error);
        return NextResponse.json({ error: error || "Failed to Save the credits in database" }, { status: 500 });
      }
      console.log(data, "data");
      console.log(`Yearly subscription activated for user ${user_id} with ${totalCredits} credits (${carryOverCredits} carried over)`);
    }

    if (user) {
      console.log("user ==> ", user);
      const data = await createPayment({
        user_id: user.id,
        quantity: quantity,
        price: price,
        payment_status: "",
        payer_id: subscriptionID,
        payer_name: ``,
        payer_address: "",
        payer_email: "",
        currency: "USD",
      });
      if (!data) {
        console.error("Failed to save payment Details");
        // NextResponse.json({ error: "Error updating user ambassador info" }, { status: 500 });
      }
      if (hasOffer) {
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({
            offers: false,
            offer_plan_buy: membership,
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
    }

    switch (membership) {
      case "saver":
        await sendSaverSubscriptionConfirmationMail({
          email: user.email,
          creatorName: user.user_metadata.full_name,
          credits: quantity,
        });
        break;

      case "pro":
        await sendProSubscriptionConfirmationMail({
          email: user.email,
          creatorName: user.user_metadata.full_name,
          credits: quantity,
        });
        break;

      case "super":
        await sendSuperSubscriptionConfirmationMail({
          email: user.email,
          creatorName: user.user_metadata.full_name,
          credits: quantity,
        });
        break;
    }


    return NextResponse.json({ success: true }); // ADD return statement
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 }); // ADD return statement
  }
}
