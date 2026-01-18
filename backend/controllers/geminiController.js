import { generateWithGemini } from "../utils/gemini.js";

export const generateCampaignAI = async (req, res) => {
  const { product, audience, goal, tone = "professional", length = "medium" } = req.body;

  if (!product || !audience || !goal) {
    return res.status(400).json({
      message: "product, audience and goal are required"
    });
  }

  const prompt = `
You are an expert email marketing copywriter.

Create a marketing email campaign with:
Product: ${product}
Target Audience: ${audience}
Campaign Goal: ${goal}
Tone: ${tone}
Length: ${length}

Return the response strictly in this format:
Subject:
<subject line>

Body:
<email body>
`;

  try {
    const content = await generateWithGemini(prompt);
    res.json({ content });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ message: "AI generation failed" });
  }
};