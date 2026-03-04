import Campaign from "../models/Campaign.js";
import sendMail from "../utils/mailer.js";
import { pickMailboxForCampaign } from "../services/senderSelector.js";

/**
 * HELPER: Send mails with randomized variations + mailbox rotation
 */
export const sendCampaignMails = async (campaign, userId) => {
  const { recipients, variations, senderName, batchSize = 500, batchDelay = 0 } = campaign;
  const results = { success: [], failure: [] };

  if (!recipients || recipients.length === 0) return results;

  console.log(
    `🚀 Starting campaign "${campaign.name}" with ${variations?.length || 0
    } variations for ${recipients.length} recipients. Batch Size: ${batchSize}, Delay: ${batchDelay}m`
  );

  // Group recipients into batches
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} recipients)`);

    const batchPromises = batch.map(async (person) => {
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
        const mailbox = await pickMailboxForCampaign(userId);

        if (!mailbox) {
          console.log("❌ No healthy mailbox available");
          return { email, success: false, error: "No healthy mailbox available" };
        }

        await sendMail(email, subject, body, {
          senderEmail: mailbox.email,
          senderName: senderName || mailbox.name || "MailMaster",
        });

        console.log(`✅ Sent (Var ${varIdx + 1}) from ${mailbox.email} → ${email}`);
        return { email, success: true };
      } catch (err) {
        console.error(`❌ Failed to ${email}:`, err.message);
        return { email, success: false, error: err.message };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach(res => {
      if (res.success) {
        results.success.push(res.email);
      } else {
        results.failure.push({ email: res.email, error: res.error });
      }
    });

    // Wait if there are more batches
    if (i + batchSize < recipients.length && batchDelay > 0) {
      console.log(`⏳ Waiting ${batchDelay} minutes before next batch...`);
      await new Promise(resolve => setTimeout(resolve, batchDelay * 60 * 1000));
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
      recipients,
      scheduleAt: scheduleAtFromClient,
      scheduleDate,
      scheduleTime,
      batchSize,
      batchDelay,
    } = req.body;

    const missing = [];
    if (!name) missing.push("name");
    if (!subject) missing.push("subject");
    if (!senderName) missing.push("senderName");
    if (!content) missing.push("content");
    if (!emailList) missing.push("emailList");

    if (missing.length > 0) {
      return res.status(400).json({ message: `Required fields missing: ${missing.join(", ")}` });
    }

    let scheduleAt = scheduleAtFromClient ? new Date(scheduleAtFromClient) : null;
    let status = scheduleAt ? "scheduled" : "draft";

    if (!scheduleAt && scheduleDate && scheduleTime) {
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
      recipients,
      scheduleAt,
      batchSize: batchSize || 500,
      batchDelay: batchDelay || 0,
      status,
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
      batchSize,
      batchDelay,
    } = req.body;

    const missing = [];
    if (!name) missing.push("name");
    if (!senderName) missing.push("senderName");
    if (!recipients || recipients.length === 0) missing.push("recipients");

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Required fields missing: ${missing.join(", ")}`,
      });
    }

    // subject is often derived from AI variations, but lets ensure we have one
    if (!subject && (!variations || variations.length === 0 || !variations[0].subject)) {
      return res.status(400).json({ message: "Subject is required (either in form or AI variations)" });
    }

    const campaign = await Campaign.create({
      name,
      mode,
      subject: subject || (variations?.[0]?.subject || ""),
      senderName,
      content: content || (variations?.[0]?.body || ""),
      variations,
      recipients,
      batchSize: batchSize || 500,
      batchDelay: batchDelay || 0,
      status: "sending",
      emailList: "CSV_UPLOAD",
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