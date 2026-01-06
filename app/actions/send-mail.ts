"use server";

import { sendMail } from "@/lib/utils/emailSender";

export async function sendSignupEmail(formData: any) {
  return await sendMail({ ...formData, type: "signup" });
}
export async function sendRfqEmail(formData: any) {
  return await sendMail({ ...formData, type: "rfq" });
}

export async function sendRfqConfiramtionEmail(formData: any) {
  return await sendMail({ ...formData, type: "rfq-confirmation" });
}
export async function sendRfqPurchaseConfiramtionEmail(formData: any) {
  return await sendMail({ ...formData, type: "purchase-confirmation" });
}
export async function sendRfqContactEmail(formData: any) {
  return await sendMail({ ...formData, type: "contact-confirmation" });
}

export async function sendSaverSubscriptionConfirmationMail(formData: any) {
  return await sendMail({ ...formData, type: "saver-purchase-confirmation" });
}

export async function sendProSubscriptionConfirmationMail(formData: any) {
  return await sendMail({ ...formData, type: "pro-purchase-confirmation" });
}

export async function sendTechPackCreation(formData: any) {
  return await sendMail({ ...formData, type: "tech-pack-creation" });
}

export async function sendAmbassadorApllication(formData: any) {
  return await sendMail({ ...formData, type: "ambassador-application" });
}

export async function sendAmbassadorWelcome(formData: any) {
  return await sendMail({ ...formData, type: "ambassador-welcome" });
}

export async function sendAmbassadorInterest(formData: any) {
  return await sendMail({ ...formData, type: "ambassador-interest" });
}

export async function sendSupplierApplication(formData: any) {
  return await sendMail({ ...formData, type: "supplier-application" });
}

export async function sendSupplierApplicationApproved(formData: any) {
  return await sendMail({ ...formData, type: "supplier-application-approved" });
}
export async function sendSuperSubscriptionConfirmationMail(formData: any) {
  return await sendMail({ ...formData, type: "super-purchase-confirmation" });
}
