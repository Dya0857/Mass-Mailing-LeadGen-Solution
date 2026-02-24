import Campaign from "../models/Campaign.js";
import { sendCampaignMails } from "../controllers/campaignController.js";

export const processCampaigns = async () => {
  try {
    const campaigns = await Campaign.find({
      status: "scheduled",
      scheduleAt: { $lte: new Date() },
    });

    if (campaigns.length > 0) {
      console.log(`🕒 Cron Job: Found ${campaigns.length} scheduled campaigns to process.`);
    }

    for (const campaign of campaigns) {
      try {
        // Mark as sending
        campaign.status = "sending";
        await campaign.save();

        console.log(`📨 Processing scheduled campaign: ${campaign.name} for ${campaign.recipients.length} recipients.`);

        // Use the existing sending logic from the controller
        // We pass campaign.createdBy as the userId for mailer configuration
        const results = await sendCampaignMails(campaign, campaign.createdBy);

        console.log(`✅ Finished scheduled campaign: ${campaign.name}. Success: ${results.success.length}, Failure: ${results.failure.length}`);

        // After successful process
        campaign.status = "completed";
        await campaign.save();
      } catch (err) {
        console.error(`❌ Error processing campaign ${campaign._id}:`, err);
        // Maybe revert status to scheduled or mark as failed? 
        // For now, let's keep it in "sending" or mark as "draft" to avoid infinite loop if it fails before sendCampaignMails
        campaign.status = "draft";
        await campaign.save();
      }
    }
  } catch (error) {
    console.error("Campaign job error:", error);
  }
};
