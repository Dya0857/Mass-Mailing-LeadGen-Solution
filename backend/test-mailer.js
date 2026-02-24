import sendMail from "./utils/mailer.js";

async function testMailer() {
    console.log("🧪 Starting SMTP test...");
    try {
        const result = await sendMail(
            "petkardhyeyaja@gmail.com",
            "Test SMTP Subject",
            "This is a test email sent via Nodemailer SMTP. **Bold text** and [CTA Button: Click Me]",
            { provider: 'ses' }
        );
        console.log("✅ Test successful:", result.messageId);
    } catch (err) {
        console.error("❌ Test failed:", err.message);
    }
}

testMailer();
