import Mailbox from "../models/Mailbox.js";

export const pickMailboxForCampaign = async (userId) => {

  // 🔥 TEMPORARY HARDCODED MAILBOXES
  const tempMailboxes = [
    {
      email: "sales@trad-eats.com",
      name: "Sales Team",
      dailyLimit: 50,
      sentToday: 0,
      reputationScore: 100,
      status: "active"
    },
    {
      email: "support@trad-eats.com",
      name: "Support Team",
      dailyLimit: 50,
      sentToday: 0,
      reputationScore: 100,
      status: "active"
    },
    {
      email: "noreply@trad-eats.com",
      name: "Hello Team",
      dailyLimit: 50,
      sentToday: 0,
      reputationScore: 100,
      status: "active"
    }
  ];

  // Random rotation
  const healthy = tempMailboxes.filter(
    (m) =>
      m.status === "active" &&
      m.sentToday < m.dailyLimit &&
      m.reputationScore > 0
  );

  if (!healthy.length) return null;

  const randomIndex = Math.floor(Math.random() * healthy.length);
  return healthy[randomIndex];
};