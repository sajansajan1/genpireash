import { Html, Text, Head, Preview } from "@react-email/components";

interface EmailTemplateProps {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}
interface EmailTemplateForRFQProps {
  supplierName?: string;
  creatorName?: string;
  productName?: string;
  rfqLink?: string;
  credits?: string;
  techPackLink?: string;
  activateLink?: string;
  dashboardLink?: string;
  inviteLink?: string;
  kickoffLink?: string;
  ambassadorEmail?: string;
}

export function EmailTemplateForSignUp({ name }: EmailTemplateProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Welcome to Genpire — Let’s Create Something Real ✨</title>
      </Head>

      <Preview>Turn ideas into factory-ready products with AI.</Preview>

      <Text>
        Hi <strong>{name}</strong>,
      </Text>

      <Text>
        Welcome to <strong style={{ color: "#ff4d00" }}>Genpire</strong> — where ideas turn into real products.
      </Text>

      <Text>
        You’ve just joined a community of designers, makers, and brands using AI to generate visuals, edit designs, and
        produce complete factory-ready tech packs — all in one workflow.
      </Text>

      <Text>
        <strong>Here’s how to get started:</strong>
      </Text>

      <ul>
        <li>
          <strong>Generate your first product</strong> — Type an idea or upload a design
        </li>
        <li>
          <strong>Edit & refine</strong> — Customize shapes, materials, and details with AI
        </li>
        <li>
          <strong>Export for production</strong> — Download factory-ready files instantly
        </li>
      </ul>

      <Text>
        <strong>Features you’ll love:</strong>
      </Text>

      <ul>
        <li>
          🧠 <strong>AI Product Generator</strong> — Create products from text, sketches, or photos
        </li>
        <li>
          ✨ <strong>AI Micro Editor</strong> — Edit measurements, materials, and construction details
        </li>
        <li>
          🎨 <strong>Brand DNA (Pro / Super)</strong> — Designs aligned with your brand style
        </li>
        <li>
          📸 <strong>Try-On Studio (Pro / Super)</strong> — Create realistic ads and lifestyle visuals
        </li>
        <li>
          📦 <strong>Manufacturer-Ready Output</strong> — Tech packs with materials, measurements, and quality standards
        </li>
        <li>
          📐 <strong>Technical Spec Files</strong> — Extra sketches, details, and close-ups (PDF & SVG)
        </li>
      </ul>

      <Text>
        <strong>Plan options:</strong>
      </Text>

      <ul>
        <li>
          <strong>Creator Build credit packs</strong> — One-time credits
        </li>
        <li>
          <strong>Pro & Super</strong> — Unlock Brand DNA, Collections & Try-On Studio
        </li>
      </ul>

      <Text>
        👉 Start here:{" "}
        <a href="https://www.genpire.com" style={{ color: "#ff4d00", textDecoration: "none" }}>
          https://www.genpire.com
        </a>
      </Text>

      <Text>
        👉 View plans:{" "}
        <a href="https://www.genpire.com/pricing" style={{ color: "#ff4d00", textDecoration: "none" }}>
          https://www.genpire.com/pricing
        </a>
      </Text>

      <Text>Let’s make something real.</Text>

      <Text>— The Genpire Team</Text>
    </Html>
  );
}

export function EmailTemplateForRFQ({ supplierName, creatorName, productName, rfqLink }: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Text>
        Hi <strong>{supplierName}</strong>,
      </Text>

      <Text>
        You just received a new <strong>Request for Quote (RFQ)</strong> from <strong>{creatorName}</strong> for their
        product "<strong>{productName}</strong>".
      </Text>

      <Text>
        🔍 You can view the full tech pack and submit your quote here: <a href={rfqLink}>View RFQ</a>
      </Text>

      <Text>Don’t wait too long — great projects move fast!</Text>

      <Text>
        – <strong style={{ color: "#ff4d00" }}>Genpire</strong> Matching Engine
      </Text>
    </Html>
  );
}

export function EmailTemplateForRFQConfirmation({ supplierName, creatorName, productName }: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        Your RFQ for <strong>{productName}</strong> was just sent to
        <strong>{supplierName}</strong>.
      </Text>

      <Text>
        We’ll notify you once they respond. In the meantime, you can manage this project and others in your dashboard
      </Text>

      <Text>Thanks for building with Genpire 🚀</Text>
    </Html>
  );
}

export function EmailTemplateForPurchaseConfirmation({
  creatorName,
  credits,
}: EmailTemplateForRFQProps) {
  const creditsText = credits ?? "0";

  return (
    <Html lang="en">
      <Head>
        <title>Your Genpire Credits Are Ready 🎨</title>
      </Head>

      <Preview>Your account has been credited with {creditsText} credits.</Preview>

      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        Thank you for purchasing a{" "}
        <strong style={{ color: "#ff4d00" }}>Creator Build Pack</strong>.
      </Text>

      <Text>
        Your account has been credited with <strong>{creditsText}</strong> credits.
      </Text>

      <Text>You can now:</Text>

      <ul>
        <li>Generate new products</li>
        <li>Edit visuals</li>
        <li>Export factory-ready tech packs</li>
        <li>And much more</li>
      </ul>

      <Text>
        <strong>Current balance:</strong> {creditsText} credits
      </Text>

      <Text>
        👉{" "}
        <a
          href="https://www.genpire.com/"
          style={{ color: "#ff4d00", textDecoration: "none" }}
        >
          Start creating
        </a>
      </Text>

      <Text>— The Genpire Team</Text>
    </Html>
  );
}

export function EmailTemplateForContactConfirmation({
  creatorName,
}: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Head>
        <title>We’ve Received Your Message</title>
      </Head>

      <Preview>Thanks for reaching out — our team will get back to you shortly.</Preview>

      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        Thanks for reaching out! We’ve received your message and our team will get
        back to you shortly.
      </Text>

      <Text>In the meantime, you can:</Text>

      <ul>
        <li>Manage projects from your dashboard</li>
        <li>Refine or regenerate designs</li>
      </ul>

      <Text>
        👉{" "}
        <a
          href="https://www.genpire.com"
          style={{ color: "#ff4d00", textDecoration: "none" }}
        >
          Go to Dashboard
        </a>
      </Text>

      <Text>— The Genpire Team</Text>
    </Html>
  );
}

export function EmailTemplateForSaverPlanSubscriptionConfirmation({ creatorName, credits }: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Head>
        <title>You’re In! Saver Plan Activated 🚀</title>
      </Head>

      <Preview>Your Genpire subscription is now active — let’s start creating.</Preview>

      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        Welcome to the <strong style={{ color: "#ff4d00" }}>Saver Plan</strong> — your subscription is now active.
      </Text>

      <Text>You now have:</Text>

      <ul>
        <li>
          <strong>75</strong> credits per month
        </li>
        <li>Lower credit costs per Tech Pack</li>
        <li>Full access to Genpire’s AI creation workflow</li>
      </ul>

      <Text>
        <strong>Your current balance:</strong> {credits} Credits
      </Text>

      <Text>Your credits refresh automatically each month, so you can create anytime.</Text>
      <Text>
        👉{" "}
        <a href="https://www.genpire.com/creator-dashboard" style={{ color: "#ff4d00" }}>
          Go to Your Dashboard
        </a>
      </Text>

      <Text>Let’s make ideas happen,</Text>

      <Text>— The Genpire Team</Text>
    </Html>
  );
}

export function EmailTemplateForProPlanSubscriptionConfirmation({
  creatorName,
  credits,
}: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Welcome to the Pro Plan 🚀</title>
      </Head>

      <Preview>Your Pro subscription is live — premium tools unlocked.</Preview>

      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        You’re now on the{" "}
        <strong style={{ color: "#ff4d00" }}>Genpire Pro Plan</strong> — your
        all-access pass to premium tools.
      </Text>

      <Text>What’s included:</Text>

      <ul>
        <li>
          <strong>200</strong> credits per month
        </li>
        <li>Brand DNA, Collection Generator & Try-On Studio</li>
        <li>Priority support & early feature access</li>
      </ul>

      <Text>
        <strong>Current balance:</strong> {credits} credits
      </Text>

      <Text>
        👉{" "}
        <a
          href="https://www.genpire.com"
          style={{ color: "#ff4d00", textDecoration: "none" }}
        >
          Open Genpire Studio
        </a>
      </Text>

      <Text>— The Genpire Team</Text>
    </Html>
  );
}

export function EmailTemplateForSuperPlanSubscriptionConfirmation({
  creatorName,
  credits,
}: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Welcome to the Super Plan 🚀</title>
      </Head>

      <Preview>Your Super subscription is live — premium tools unlocked.</Preview>

      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        You’re now on the{" "}
        <strong style={{ color: "#ff4d00" }}>Genpire Super Plan</strong> — your
        all-access pass to premium tools.
      </Text>

      <Text>What’s included:</Text>

      <ul>
        <li>
          <strong>650</strong> credits per month
        </li>
        <li>Brand DNA, Collection Generator & Try-On Studio</li>
        <li>Priority support & early feature access</li>
      </ul>

      <Text>
        <strong>Current balance:</strong> {credits} credits
      </Text>

      <Text>
        👉{" "}
        <a
          href="https://www.genpire.com"
          style={{ color: "#ff4d00", textDecoration: "none" }}
        >
          Open Genpire Studio
        </a>
      </Text>

      <Text>— The Genpire Team</Text>
    </Html>
  );
}

export function EmailTemplateForTechPackCreation({
  creatorName,
  productName,
  techPackLink,
}: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Head>
        <title>Your Product Is Ready in Genpire</title>
      </Head>

      <Preview>
        Your product is fully created and ready to move toward production.
      </Preview>

      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        Nice work — your <strong>{productName}</strong> is now fully created in
        Genpire and ready to move toward production.
      </Text>

      <Text>Here’s what you can do next:</Text>

      <ul>
        <li>
          Review your agentic product page with all designs, specs, and files in
          one place
        </li>
        <li>
          Refine details using the AI Editor — visuals, materials, construction,
          and BOM
        </li>
        <li>
          Export files or documents if needed — no PDFs required unless you want
          them
        </li>
      </ul>

      <Text>
        👉{" "}
        <a
          href={techPackLink}
          style={{ color: "#ff4d00", textDecoration: "none" }}
        >
          View your product
        </a>
      </Text>

      <Text>
        Your product page is your single source of truth — always up to date,
        fully editable, and ready for the factory floor.
      </Text>

      <Text>Best regards,</Text>
      <Text>— The Genpire Team</Text>
    </Html>
  );
}

export function EmailTemplateForAmbassadorApplication({ creatorName }: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        Thanks for applying to join the <strong>Genpire Ambassador Program</strong>! 🎉
      </Text>

      <Text>
        We’re thrilled that you want to be part of our growing community of creators, designers, and innovators building
        the future of product creation with AI.
      </Text>

      <Text>Our team is currently reviewing your application. Once approved, you will get:</Text>

      <ul>
        <li>
          Early access to your free <strong>Pro Plan</strong> and Genpire features
        </li>
        <li>Your unique referral code</li>
        <li>Exclusive ambassador perks</li>
      </ul>

      <Text>You’ll hear from us soon! 🚀</Text>

      <Text>
        Best,
        <br />
        The <strong style={{ color: "#ff4d00" }}>Genpire</strong> Team
      </Text>
    </Html>
  );
}

export function EmailTemplateForAmbassadorWelcomeEmail({
  creatorName,
  activateLink,
  dashboardLink,
}: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Text>
        Hi <strong>{creatorName}</strong>,
      </Text>

      <Text>
        Great news — your application has been approved! We’re excited to welcome you as a{" "}
        <strong>Genpire Ambassador</strong> and partner with you — helping creators turn their ideas into real products
        faster than ever before.
      </Text>

      <Text>
        <strong>What you get:</strong>
      </Text>

      <ul>
        <li>Free Pro-Plan access</li>
        <li>25% extra credits for your referred users on their first purchase</li>
        <li>Ongoing commissions for every paying referral (15% fee)</li>
        <li>Exclusive product sneak peeks on our Genpire Ambassadors Slack Channel</li>
        <li>Direct support from the Genpire team</li>
        <li>Early access to new Genpire features and drops</li>
        <li>Monthly payouts (within 10 business days after month-end)</li>
      </ul>

      <Text>
        <strong>Next steps (2 minutes):</strong>
      </Text>

      <ol>
        <li>
          Sign-up / Sign-in to your ambassador account:{" "}
          <a href={activateLink} style={{ color: "#ff4d00", textDecoration: "underline" }}>
            Activate Account
          </a>
        </li>
        <li>Copy referral link and share it with your followers</li>
        <li>Track signups, paying users, and commissions</li>
        <li>Connect PayPal or bank info for payouts</li>
        <li>Access promotional assets and updates</li>
        <li>
          Access your dashboard:{" "}
          <a href={dashboardLink} style={{ color: "#ff4d00", textDecoration: "underline" }}>
            Dashboard
          </a>
        </li>
      </ol>

      <Text>Welcome aboard — we’re thrilled to build with you! 🎉</Text>

      <Text>
        If you need anything, simply reply to us at{" "}
        <a href="mailto:support@genpire.com" style={{ color: "#ff4d00" }}>
          support@genpire.com
        </a>
      </Text>

      <Text>
        Best,
        <br />
        The <strong style={{ color: "#ff4d00" }}>Genpire</strong> Team
        <br />
        <a href="mailto:support@genpire.com">support@genpire.com</a> | <a href="https://genpire.co">genpire.co</a>
      </Text>
    </Html>
  );
}

export function EmailTemplateForAmbassadorInterest({
  creatorName,
  ambassadorEmail,
  activateLink,
}: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Text>
        <strong>Subject:</strong> New Ambassador Application Submitted
      </Text>

      <Text>
        A new <strong>Genpire Ambassador</strong> application has been submitted! 🎉
      </Text>

      <Text>
        <strong>Creator Name:</strong> {creatorName}
        <br />
        <strong>Email:</strong> {ambassadorEmail}
      </Text>

      <Text>
        Review the application here:{" "}
        <a href={activateLink} style={{ color: "#ff4d00", textDecoration: "underline" }}>
          Review Application
        </a>{" "}
        and approve it to activate the Ambassador account.
      </Text>

      <Text>
        Best,
        <br />
        The <strong style={{ color: "#ff4d00" }}>Genpire</strong> Team
        <br />
        <a href="mailto:support@genpire.com">support@genpire.com</a> | <a href="https://genpire.com">genpire.com</a>
      </Text>
    </Html>
  );
}

export function EmailTemplateForSupplierApplication({ supplierName }: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Text>
        <strong>Subject:</strong> We’ve received your Genpire Supplier application ✅
      </Text>

      <Text>
        Hi <strong>{supplierName}</strong>,
      </Text>

      <Text>Welcome to Genpire! Your application has been received and is currently under review.</Text>

      <Text>
        Our goal is to connect you with brands and creators who are actively looking for trusted suppliers. Once your
        application is processed, you’ll get access to opportunities that fit your capabilities.
      </Text>

      <Text>We’ll update you soon with next steps.</Text>

      <Text>
        Thank you for partnering with us,
        <br />
        The <strong style={{ color: "#ff4d00" }}>Genpire</strong> Team
        <br />
        <a href="mailto:support@genpire.com">support@genpire.com</a> | <a href="https://genpire.com">genpire.com</a>
      </Text>
    </Html>
  );
}

export function EmailTemplateForSupplierApplicationApproved({ supplierName }: EmailTemplateForRFQProps) {
  return (
    <Html lang="en">
      <Text>
        <strong>Subject:</strong> Your Genpire Supplier profile is approved 🎉
      </Text>

      <Text>
        Hi <strong>{supplierName}</strong>,
      </Text>

      <Text>Great news — your application to join the Genpire Supplier Network has been approved! 🎉</Text>

      <Text>
        Your profile is now live, and you can begin connecting with brands and designers looking for trusted suppliers
        like you.
      </Text>

      <Text>
        <strong>👉 Next step:</strong> Log in to your account to update your profile and get ready to receive match
        requests.
      </Text>

      <Text>We’re excited to have you on board. Welcome to Genpire!</Text>

      <Text>
        Best regards,
        <br />
        The <strong style={{ color: "#ff4d00" }}>Genpire</strong> Team
        <br />
        <a href="mailto:support@genpire.com">support@genpire.com</a> | <a href="https://genpire.com">genpire.com</a>
      </Text>
    </Html>
  );
}
