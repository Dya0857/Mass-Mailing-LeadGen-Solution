import Mailbox from "../models/Mailbox.js";

export const addMailbox = async (req, res) => {
  try {
    const mailbox = await Mailbox.create({
      userId: req.user.id,
      domainId: req.body.domainId,
      email: req.body.email,
    });

    res.status(201).json(mailbox);
  } catch (err) {
    res.status(500).json({ message: "Failed to add mailbox" });
  }
};

export const getMailboxes = async (req, res) => {
  const boxes = await Mailbox.find({ userId: req.user.id }).populate("domainId");
  res.json(boxes);
};
