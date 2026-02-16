import Mailbox from "../models/Mailbox.js";

/**
 * Pick best mailbox for sending
 * Rules:
 * 1. Must be active
 * 2. Not paused
 * 3. Under daily limit
 * 4. Higher reputation preferred
 * 5. Least recently used
 */
export const pickMailboxForCampaign = async (userId) => {
  const mailboxes = await Mailbox.find({
    user: userId,
    isActive: true,
    isPaused: false,
  }).sort({
    reputation: -1,       // good senders first
    lastUsedAt: 1,        // rotate
  });

  if (!mailboxes.length) {
    throw new Error("No active mailboxes available");
  }

  const now = new Date();

  for (const box of mailboxes) {
    const limit = getDailyLimit(box);

    // reset count if new day
    if (!box.lastSendDate || !isSameDay(box.lastSendDate, now)) {
      box.dailySent = 0;
    }

    if (box.dailySent < limit) {
      return box;
    }
  }

  throw new Error("All mailboxes hit daily limits");
};

/**
 * Calculate allowed sending based on warmup stage
 */
const getDailyLimit = (mailbox) => {
  if (!mailbox.warmupEnabled) return mailbox.maxDaily || 40;

  const stage = mailbox.warmupStage || 1;

  // Example ramp:
  // day 1 -> 20
  // day 2 -> 30
  // day 3 -> 40
  // day 4 -> 50 ...
  return Math.min(20 + stage * 10, mailbox.maxDaily || 100);
};

/**
 * Update mailbox after successful send
 */
export const markSendSuccess = async (mailboxId) => {
  await Mailbox.findByIdAndUpdate(mailboxId, {
    $inc: { dailySent: 1 },
    $set: {
      lastUsedAt: new Date(),
      lastSendDate: new Date(),
    },
  });
};

/**
 * Update mailbox reputation after bounce / error
 */
export const markSendFailure = async (mailboxId) => {
  const mailbox = await Mailbox.findById(mailboxId);

  if (!mailbox) return;

  mailbox.reputation = Math.max(0, mailbox.reputation - 5);

  // auto pause if too bad
  if (mailbox.reputation < 20) {
    mailbox.isPaused = true;
  }

  await mailbox.save();
};

/**
 * Daily warmup progression (run via cron)
 */
export const progressWarmup = async () => {
  const boxes = await Mailbox.find({ warmupEnabled: true });

  for (const box of boxes) {
    if (box.warmupStage < 30) {
      box.warmupStage += 1;
      await box.save();
    }
  }

  console.log("Warmup stages updated");
};

/**
 * Utils
 */
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();
