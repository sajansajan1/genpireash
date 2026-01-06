import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, pdfBuffer, fileName } = await request.json()

    if (!email || !pdfBuffer) {
      return NextResponse.json({ error: "Email and PDF buffer are required" }, { status: 400 })
    }

    const nodemailer = await import("nodemailer")

    // Configure transporter
    const transporter = nodemailer.default.createTransporter({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_EMAIL,
        pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.NEXT_PUBLIC_SMTP_EMAIL,
      to: email,
      subject: "Your PDF Document",
      text: "Please find your PDF attachment.",
      attachments: [
        {
          filename: fileName || "document.pdf",
          content: Buffer.from(pdfBuffer, "base64"),
          contentType: "application/pdf",
        },
      ],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
