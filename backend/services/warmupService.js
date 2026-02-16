import Mailbox from "../models/Mailbox.js";

export const progressWarmup = async () => {
  const mailboxes = await Mailbox.find({ status: "active" });

  for (const box of mailboxes) {
    if (box.dailyLimit < 100) {
      box.dailyLimit += 5;
      box.warmupStage += 1;
      await box.save();
    }
  }
};
