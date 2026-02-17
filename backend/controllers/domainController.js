import Domain from "../models/Domain.js";

export const addDomain = async (req, res) => {
  try {
    const domain = await Domain.create({
      userId: req.user.id,
      domainName: req.body.domainName,
    });

    res.status(201).json(domain);
  } catch (err) {
    res.status(500).json({ message: "Failed to add domain" });
  }
};

export const getDomains = async (req, res) => {
  const domains = await Domain.find({ userId: req.user.id });
  res.json(domains);
};
