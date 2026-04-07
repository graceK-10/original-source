import express from "express";
import sgMail from "@sendgrid/mail";

const router = express.Router();

router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if ((process.env.CONTACT_PROVIDER || "").toLowerCase() !== "sendgrid_api") {
      return res.status(500).json({ error: "Invalid CONTACT_PROVIDER or SendGrid not configured" });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: process.env.CONTACT_TO,
      from: { email: process.env.CONTACT_FROM, name: "Original Source Contact Form" },
      replyTo: { email },
      subject: `Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `Message: <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p>${message.replace(/\n/g, "<br>")}</p>`,
    };

    console.log("📨 SendGrid →", { to: msg.to, from: msg.from.email, replyTo: email });
    const [resp] = await sgMail.send(msg);
    console.log("✅ SendGrid status:", resp?.statusCode);

    return res.json({
      success: true,
      provider: "sendgrid_api",
      statusCode: resp?.statusCode,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("❌ SendGrid API error:", e?.response?.body || e);
    return res.status(500).json({
      error: "Failed to send email",
      reason: "SendGrid API error",
      details: e?.response?.body || e?.message,
    });
  }
});

export default router;
