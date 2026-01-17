import Campaign from "../models/Campaign.js";

export const processCampaigns = async () => {
  try {
    const campaigns = await Campaign.find({
      status: "scheduled",
      scheduleAt: { $lte: new Date() },
    });

    for (const campaign of campaigns) {
      // Mark as sending
      campaign.status = "sending";
      await campaign.save();

      /*
        🔔 SEND EMAILS HERE
        - Fetch email list
        - Loop recipients
        - Use nodemailer / SES / SendGrid
      */

      console.log(`📨 Sending campaign: ${campaign.name}`);

      // After successful send
      campaign.status = "completed";
      await campaign.save();
    }
  } catch (error) {
    console.error("Campaign job error:", error);
  }
};
