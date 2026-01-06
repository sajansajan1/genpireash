import { render } from "@react-email/render";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  currentEmail: string;
  creatorName?: string;
  supplierName?: string;
  productName?: string;
  rfqLink?: string;
  number?: string;
  techPackLink?: string;
  activateLink?: string;
  dashboardLink?: string;
  inviteLink?: string;
  kickoffLink?: string;
  ambassadorEmail?: string;
  type?:
  | "signup"
  | "rfq"
  | "rfq-confirmation"
  | "purchase-confirmation"
  | "contact-confirmation"
  | "saver-purchase-confirmation"
  | "pro-purchase-confirmation"
  | "tech-pack-creation"
  | "ambassador-application"
  | "ambassador-welcome"
  | "ambassador-interest"
  | "supplier-application"
  | "supplier-application-approved"
  | "super-purchase-confirmation";
  credits?: string;
}

export async function sendMail(formData: FormData): Promise<{ success: boolean; message?: string }> {
  // Check if we're in a server environment
  if (typeof window !== "undefined") {
    // If we're in the browser, make an API call instead
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Error sending email via API:", error);
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  // Server-side email sending (only runs on server)
  const nodemailer = await import("nodemailer");
  const {
    EmailTemplateForPurchaseConfirmation,
    EmailTemplateForRFQ,
    EmailTemplateForRFQConfirmation,
    EmailTemplateForSignUp,
    EmailTemplateForContactConfirmation,
    EmailTemplateForTechPackCreation,
    EmailTemplateForAmbassadorApplication,
    EmailTemplateForAmbassadorWelcomeEmail,
    EmailTemplateForAmbassadorInterest,
    EmailTemplateForProPlanSubscriptionConfirmation,
    EmailTemplateForSaverPlanSubscriptionConfirmation,
    EmailTemplateForSupplierApplication,
    EmailTemplateForSupplierApplicationApproved,
    EmailTemplateForSuperPlanSubscriptionConfirmation
  } = await import("@/components/emailTemplates");

  const transporter = nodemailer.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NEXT_PUBLIC_SMTP_EMAIL,
      pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
    },
  });

  const {
    currentEmail,
    email,
    creatorName,
    supplierName,
    productName,
    rfqLink,
    type,
    credits,
    number,
    message,
    techPackLink,
    activateLink,
    dashboardLink,
    inviteLink,
    kickoffLink,
    ambassadorEmail,
  } = formData;

  try {
    switch (type) {
      case "signup": {
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: "Welcome to Genpire – Let's Build Your Product Empire",
          html: await render(EmailTemplateForSignUp({ name: creatorName })),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "rfq": {
        if (!creatorName || !supplierName || !productName || !rfqLink) {
          return { success: false, message: "Missing RFQ data." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `You've Received a New RFQ from ${creatorName}`,
          html: await render(
            EmailTemplateForRFQ({
              creatorName,
              supplierName,
              productName,
              rfqLink,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "rfq-confirmation": {
        if (!creatorName || !supplierName || !productName) {
          return { success: false, message: "Missing RFQ Confirmation data." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Your RFQ Has Been Sent to ${supplierName}`,
          html: await render(
            EmailTemplateForRFQConfirmation({
              creatorName,
              supplierName,
              productName,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "purchase-confirmation": {
        if (!creatorName) {
          return {
            success: false,
            message: "Missing purchase confirmation data.",
          };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Genpire Credits Successfully Added to Your Account`,
          html: await render(EmailTemplateForPurchaseConfirmation({ creatorName, credits })),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "contact-confirmation": {
        if (!creatorName || !email || !number || !message) {
          return {
            success: false,
            message: "Missing Contact data.",
          };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Thanks for contacting Genpire`,
          html: await render(EmailTemplateForContactConfirmation({ creatorName })),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "saver-purchase-confirmation": {
        if (!creatorName) {
          return {
            success: false,
            message: "Missing purchase confirmation data.",
          };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Genpire Credits Successfully Added to Your Account`,
          html: await render(EmailTemplateForSaverPlanSubscriptionConfirmation({ creatorName, credits })),
        };
        await transporter.sendMail(mailOptions);
        break;
      }
      case "pro-purchase-confirmation": {
        if (!creatorName) {
          return {
            success: false,
            message: "Missing purchase confirmation data.",
          };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Genpire Credits Successfully Added to Your Account`,
          html: await render(EmailTemplateForProPlanSubscriptionConfirmation({ creatorName, credits })),
        };
        await transporter.sendMail(mailOptions);
        break;
      }
      case "super-purchase-confirmation": {
        if (!creatorName) {
          return {
            success: false,
            message: "Missing purchase confirmation data.",
          };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Genpire Credits Successfully Added to Your Account`,
          html: await render(EmailTemplateForSuperPlanSubscriptionConfirmation({ creatorName, credits })),
        };
        await transporter.sendMail(mailOptions);
        break;
      }
      case "tech-pack-creation": {
        if (!creatorName || !productName || !techPackLink) {
          return { success: false, message: "Missing detailsin tech pack." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Your product is ready 🎉`,
          html: await render(
            EmailTemplateForTechPackCreation({
              creatorName,
              productName,
              techPackLink,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "ambassador-application": {
        if (!creatorName) {
          return { success: false, message: "Missing details in ambassador." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Thanks for applying to become a Genpire Ambassador 🌍`,
          html: await render(
            EmailTemplateForAmbassadorApplication({
              creatorName,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "ambassador-welcome": {
        if (!creatorName || !activateLink || !dashboardLink) {
          return { success: false, message: "Missing detailsin tech pack." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Welcome to the Genpire Ambassador Program 🎉`,
          html: await render(
            EmailTemplateForAmbassadorWelcomeEmail({
              creatorName,
              activateLink,
              dashboardLink,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "ambassador-interest": {
        if (!creatorName || !ambassadorEmail || !activateLink) {
          return { success: false, message: "Missing detailsin tech pack." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Welcome to the Genpire Ambassador Program 🎉`,
          html: await render(
            EmailTemplateForAmbassadorInterest({
              creatorName,
              ambassadorEmail,
              activateLink,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "supplier-application": {
        if (!supplierName) {
          return { success: false, message: "Missing details in tech pack." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `We’ve received your Genpire Supplier application 🎉`,
          html: await render(
            EmailTemplateForSupplierApplication({
              supplierName,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      case "supplier-application-approved": {
        if (!supplierName) {
          return { success: false, message: "Missing detailsin tech pack." };
        }
        const mailOptions = {
          from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
          to: email,
          subject: `Your Genpire Supplier profile is approved🎉`,
          html: await render(
            EmailTemplateForSupplierApplicationApproved({
              supplierName,
            })
          ),
        };
        await transporter.sendMail(mailOptions);
        break;
      }

      default:
        return { success: false, message: "Invalid or missing email type." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, message: `Error: ${error.message}` };
  }
}
