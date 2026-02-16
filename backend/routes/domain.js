import express from "express";
import {
  VerifyDomainIdentityCommand,
  VerifyDomainDkimCommand,
} from "@aws-sdk/client-ses";
import ses from "../config/ses.js";
import Domain from "../models/Domain.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// ADD DOMAIN
router.post("/add", auth, async (req, res) => {
  try {
    const { domain } = req.body;

    // 1️⃣ ask SES for verification token
    const verifyCmd = new VerifyDomainIdentityCommand({
      Domain: domain,
    });

    const verifyRes = await ses.send(verifyCmd);

    // 2️⃣ ask SES for DKIM
    const dkimCmd = new VerifyDomainDkimCommand({
      Domain: domain,
    });

    const dkimRes = await ses.send(dkimCmd);

    // 3️⃣ store in DB
    const newDomain = await Domain.create({
      user: req.user.id,
      domain,
      verificationToken: verifyRes.VerificationToken,
      dkimTokens: dkimRes.DkimTokens,
      status: "pending",
    });

    res.json({
      message: "Add these DNS records",
      verificationToken: verifyRes.VerificationToken,
      dkimTokens: dkimRes.DkimTokens,
      domainId: newDomain._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Domain add failed" });
  }
});

export default router;
