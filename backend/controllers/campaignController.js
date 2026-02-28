import Campaign from "../models/Campaign.js";
import sendMail from "../utils/mailer.js";
import { pickMailboxForCampaign } from "../services/senderSelector.js";

/**
 * HELPER: Send mails with randomized variations + mailbox rotation
 */
export const sendCampaignMails = async (campaign, userId) => {
  const { recipients, variations, senderName } = campaign;
  const results = { success: [], failure: [] };

  if (!recipients || recipients.length === 0) return results;

  console.log(
    `🚀 Starting campaign "${campaign.name}" with ${
      variations?.length || 0
    } variations for ${recipients.length} recipients.`
  );

  for (const person of recipients) {
    // If recipients are stored as plain email strings
    const email = typeof person === "string" ? person : person.email;

    // Pick random variation
    let subject = campaign.subject;
    let body = campaign.content;
    let varIdx = -1;

    if (variations && variations.length > 0) {
      varIdx = Math.floor(Math.random() * variations.length);
      subject = variations[varIdx].subject || subject;
      body = variations[varIdx].body || body;
    }

    try {
      // 🔥 ROTATION PER RECIPIENT
      const mailbox = await pickMailboxForCampaign(userId);

      if (!mailbox) {
        console.log("❌ No healthy mailbox available");
        results.failure.push({ email, error: "No healthy mailbox available" });
        continue;
      }

      await sendMail(email, subject, body, {
        senderEmail: mailbox.email,
        senderName: senderName || mailbox.name || "MailMaster",
      });

      results.success.push(email);

      console.log(
        `✅ Sent (Var ${varIdx + 1}) from ${mailbox.email} → ${email}`
      );
    } catch (err) {
      results.failure.push({ email, error: err.message });
      console.error(`❌ Failed to ${email}:`, err.message);
    }
  }

  return results;
};

/**
 * CREATE CAMPAIGN (Draft / Scheduled)
 */
export const createCampaign = async (req, res) => {
  try {
    const {
      name,
      mode,
      subject,
      previewText,
      senderName,
      content,
      variations,
      emailList,
      scheduleDate,
      scheduleTime,
      emailProvider = "gmail",
    } = req.body;

    if (!name || !subject || !senderName || !content || !emailList) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    let scheduleAt = null;
    let status = "draft";

    if (scheduleDate && scheduleTime) {
      scheduleAt = new Date(`${scheduleDate}T${scheduleTime}`);
      status = "scheduled";
    }

    const campaign = await Campaign.create({
      name,
      mode,
      subject,
      previewText,
      senderName,
      content,
      variations,
      emailList,
      scheduleAt,
      status,
      emailProvider,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Campaign creation failed" });
  }
};

/**
 * GET ALL CAMPAIGNS (Logged-in user)
 */
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("emailList", "name");

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
};

/**
 * SEND TEST EMAIL
 */
export const sendTestEmail = async (req, res) => {
  const { subject, content, testEmail } = req.body;

  if (!subject || !content || !testEmail) {
    return res.status(400).json({ message: "Missing test email data" });
  }

  try {
    const mailbox = await pickMailboxForCampaign(req.user.id);

    if (!mailbox) {
      return res.status(400).json({ message: "No healthy mailbox available" });
    }

    await sendMail(testEmail, subject, content, {
      senderEmail: mailbox.email,
      senderName: mailbox.name || "MailMaster",
    });

    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Test email failed" });
  }
};

/**
 * SEND NOW (Immediate Send)
 */
export const sendNow = async (req, res) => {
  try {
    const {
      name,
      mode,
      subject,
      senderName,
      content,
      variations,
      recipients,
      emailProvider = "gmail",
    } = req.body;

    if (!name || !senderName || !recipients || recipients.length === 0) {
      return res.status(400).json({
        message: "Required fields missing (name, senderName, recipients)",
      });
    }

    const campaign = await Campaign.create({
      name,
      mode,
      subject: subject || (variations?.[0]?.subject || ""),
      senderName,
      content: content || (variations?.[0]?.body || ""),
      variations,
      recipients,
      status: "sending",
      emailList: "CSV_UPLOAD",
      emailProvider,
      createdBy: req.user.id,
    });

    const results = await sendCampaignMails(campaign, req.user.id);

    campaign.status = "completed";
    await campaign.save();

    res.status(200).json({
      message: "Campaign process finished",
      results,
      campaign,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Campaign sending failed" });
  }
};