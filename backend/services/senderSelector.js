import Mailbox from "../models/Mailbox.js";

export const pickMailboxForCampaign = async (userId) => {
  console.log("Looking mailboxes for:", userId);

  const mailboxes = await Mailbox.find({ userId });

  console.log("Found:", mailboxes.length);

  const healthy = mailboxes.filter(
    (m) =>
      m.status === "active" &&
      m.sentToday < m.dailyLimit &&
      m.reputationScore > 0
  );

  console.log("Healthy count:", healthy.length);

  if (!healthy.length) return null;

  healthy.sort((a, b) => b.reputationScore - a.reputationScore);

  return healthy[0];
};
