import Campaign from "../models/Campaign.js";

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
      emailList,
      scheduleDate,
      scheduleTime,
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
      emailList,
      scheduleAt,
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
 * SEND TEST EMAIL (NO CAMPAIGN CREATION)
 */
export const sendTestEmail = async (req, res) => {
  const { subject, content, testEmail } = req.body;

  if (!subject || !content || !testEmail) {
    return res.status(400).json({ message: "Missing test email data" });
  }

  // 👉 integrate nodemailer / SendGrid here
  console.log("Sending test email to:", testEmail);

  res.json({ message: "Test email sent successfully" });
};
