import Campaign from "../models/Campaign.js";
import { sendCampaignMails } from "../controllers/campaignController.js";

export const processCampaigns = async () => {
  try {
    const now = new Date();
    // Diagnostic logging
    const allScheduled = await Campaign.find({ status: "scheduled" }).sort({ scheduleAt: 1 });
    if (allScheduled.length > 0) {
      console.log(`\n--- 🕒 CRON DIAGNOSTIC REPORT ---`);
      console.log(`Server Current Time (UTC): ${now.toISOString()}`);
      console.log(`Total Scheduled Campaigns: ${allScheduled.length}`);
      allScheduled.forEach((c, i) => {
        console.log(`  [${i + 1}] Name: "${c.name}", triggers at: ${c.scheduleAt?.toISOString()}`);
      });
      console.log(`---------------------------------\n`);
    }

    const campaigns = await Campaign.find({
      status: "scheduled",
      scheduleAt: { $lte: now },
    });

    if (campaigns.length > 0) {
      console.log(`🕒 Cron: Found ${campaigns.length} scheduled campaigns to process.`);
    }

    for (const campaign of campaigns) {
      // Mark as sending
      campaign.status = "sending";
      await campaign.save();

      console.log(`📨 Processing scheduled campaign: ${campaign.name}`);

      try {
        await sendCampaignMails(campaign, campaign.createdBy);

        // After successful send
        campaign.status = "completed";
        await campaign.save();
        console.log(`✅ Scheduled campaign "${campaign.name}" completed.`);
      } catch (err) {
        console.error(`❌ Failed to process scheduled campaign "${campaign.name}":`, err.message);
        // Fallback or retry logic could go here, for now mark as completed or failed
        campaign.status = "completed"; // Or a 'failed' status if you have one
        await campaign.save();
      }
    }
  } catch (error) {
    console.error("Campaign job error:", error);
  }
};
