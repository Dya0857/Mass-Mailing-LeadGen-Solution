import Mailbox from "../models/Mailbox.js";

export const updateReputation = async (mailboxId, type) => {
  const mailbox = await Mailbox.findById(mailboxId);
  if (!mailbox) return;

  if (type === "success") mailbox.reputationScore += 0.2;
  if (type === "bounce") mailbox.reputationScore -= 5;
  if (type === "complaint") mailbox.reputationScore -= 10;

  if (mailbox.reputationScore < 50) mailbox.status = "paused";
  if (mailbox.reputationScore < 20) mailbox.status = "blocked";

  await mailbox.save();
};
