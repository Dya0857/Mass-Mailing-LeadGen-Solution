import Campaign from "../models/Campaign.js";
import sendMail from "../utils/mailer.js";

/**
 * HELPER: Send mails with randomized variations
 */
export const sendCampaignMails = async (campaign, userId) => {
  const { recipients, variations, emailProvider = 'gmail', senderName } = campaign;
  const results = { success: [], failure: [] };

  if (!recipients || recipients.length === 0) return results;

  console.log(`🚀 Starting campaign "${campaign.name}" with ${variations.length} variations for ${recipients.length} recipients via ${emailProvider.toUpperCase()}.`);

  for (const email of recipients) {
    // Pick a random variation if available
    let subject = campaign.subject;
    let body = campaign.content;
    let varIdx = -1;

    if (variations && variations.length > 0) {
      varIdx = Math.floor(Math.random() * variations.length);
      subject = variations[varIdx].subject || subject;
      body = variations[varIdx].body || body;
    }

    try {
      await sendMail(email, subject, body, {
        provider: emailProvider,
        userId: userId,
        senderName: senderName || 'MailMaster'
      });
      results.success.push(email);
      console.log(`✅ Sent (Var ${varIdx + 1}) via ${emailProvider.toUpperCase()} to: ${email}`);
    } catch (err) {
      results.failure.push({ email, error: err.message });
      console.error(`❌ Failed (Var ${varIdx + 1}) via ${emailProvider.toUpperCase()} to: ${email}:`, err.message);
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
      scheduleDate,
      scheduleTime,
      emailProvider = 'gmail',
    } = req.body;



    if (!name) return res.status(400).json({ message: "Campaign Name is required" });
    if (!subject) return res.status(400).json({ message: "Subject is required" });
    if (!senderName) return res.status(400).json({ message: "Sender Name is required" });
    if (!content) return res.status(400).json({ message: "Email Content is required" });

    // Check for either emailListId or direct recipients
    if (!emailList && (!recipients || recipients.length === 0)) {
      return res.status(400).json({ message: "Please upload an email list or provide recipients" });
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
      previewText: previewText || "",
      senderName,
      content,
      variations,
      emailList: emailList || "DIRECT_RECIPIENTS",
      recipients: recipients || [],
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
 * SEND TEST EMAIL (NO CAMPAIGN CREATION)
 */
export const sendTestEmail = async (req, res) => {
  const { subject, content, testEmail } = req.body;

  if (!subject || !content || !testEmail) {
    return res.status(400).json({ message: "Missing test email data" });
  }

  try {
    await sendMail(testEmail, subject, content, {
      senderName: "MailMaster Test",
      userId: req.user.id
    });
    res.json({ message: "Test email sent successfully" });
  } catch (err) {
    console.error("Test email failed:", err);
    res.status(500).json({ message: "Failed to send test email" });
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
      emailProvider = 'gmail',
    } = req.body;

    if (!name || !senderName || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: "Required fields missing for Send Now (name, senderName, recipients)" });
    }

    const campaign = await Campaign.create({
      name,
      mode,
      subject: subject || (variations && variations[0] ? variations[0].subject : ""),
      senderName,
      content: content || (variations && variations[0] ? variations[0].body : ""),
      variations,
      recipients,
      status: "sending",
      emailList: "CSV_UPLOAD", // Placeholder for emailList link
      emailProvider,
      createdBy: req.user.id,
    });

    // Run sending in "background" (not really backround but for now)
    // We don't await so the user gets a response quickly? 
    // Actually, user expects a button to "Send Mails", let's await it for a small list, or just start it.
    // For small lists, await is fine. For large, we need a job.
    // Since this is a "send mails" button on UI, let's await so we can show success.

    const results = await sendCampaignMails(campaign, req.user.id);

    campaign.status = "completed";
    await campaign.save();

    res.status(200).json({
      message: "Campaign process finished",
      results,
      campaign,
    });
  } catch (error) {
    res.status(500).json({ message: "Campaign sending failed" });
  }
};

/**
 * GET GLOBAL TEMPLATES (From all admins)
 */
import User from "../models/User.js";
export const getGlobalTemplates = async (req, res) => {
  try {
    const admins = await User.find({ role: { $regex: /^admin$/i } }).select("templates");
    let allTemplates = [];

    admins.forEach(admin => {
      if (admin.templates && admin.templates.length > 0) {
        const plainTemplates = admin.templates.map(t => ({
          _id: t._id,
          name: t.name,
          subject: t.subject || "",
          body: t.body || ""
        }));
        allTemplates = [...allTemplates, ...plainTemplates];
      }
    });

    res.json(allTemplates);
  } catch (err) {
    console.error("Error in getGlobalTemplates:", err);
    res.status(500).json({ message: "Error fetching templates" });
  }
};

/**
 * UPLOAD IMAGE
 */
export const uploadImage = async (req, res) => {
  try {
    console.log("[uploadImage] DEBUG - Request Method:", req.method);
    console.log("[uploadImage] DEBUG - Request Headers:", JSON.stringify(req.headers, null, 2));
    console.log("[uploadImage] DEBUG - req.file:", req.file);
    console.log("[uploadImage] DEBUG - req.body:", req.body);

    if (!req.file) {
      console.warn("[uploadImage] No file received. Check if 'image' field is present in multiparty form data.");
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log("[uploadImage] Upload successful, returning URL:", imageUrl);
    res.json({ imageUrl });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};
