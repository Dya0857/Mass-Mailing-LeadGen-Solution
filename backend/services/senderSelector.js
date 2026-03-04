import Mailbox from "../models/Mailbox.js";

export const pickMailboxForCampaign = async (userId) => {

  // 🔥 TEMPORARY HARDCODED MAILBOXES
  const tempMailboxes = [
    {
      email: process.env.FROM_EMAIL || "petkardhyeyaja@gmail.com",
      name: "Master Mailer",
      dailyLimit: 200,
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