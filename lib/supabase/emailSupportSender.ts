"use server";

export async function sendSupportMail(formData: {
  subject: string;
  message: string;
  userEmail: string; // make userEmail required
}) {
  try {
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.default.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_EMAIL,
        pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
      },
    });

    const { subject, message, userEmail } = formData;

    if (!userEmail) {
      return { success: false, error: "User email is required." };
    }

    const mailOptions = {
      from: `${process.env.NEXT_PUBLIC_SMTP_EMAIL}`,
      to: "support@genpire.com",
      replyTo: userEmail,
      subject: `Support Request: ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From User Email:</strong> ${userEmail}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error: any) {
    console.error("Support email sending error:", error);
    return { success: false, error: error.message };
  }
}
