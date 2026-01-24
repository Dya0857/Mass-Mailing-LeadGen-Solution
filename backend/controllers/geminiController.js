import { generateWithGemini } from "../utils/gemini.js";

export const generateCampaignAI = async (req, res) => {
  const {
    context,
    audience,
    keywords,
    tone = "Professional",
    campaignType = "promotion",
    variationCount = 3
  } = req.body;

  if (!context || !audience) {
    return res.status(400).json({
      message: "Context and audience are required"
    });
  }

  const prompt = `
You are an expert email marketing copywriter.

Generate ${variationCount} distinct versions of a ${campaignType} email for the following campaign:
Context/Purpose: ${context}
Target Audience: ${audience}
Keywords to include: ${keywords}
Tone: ${tone}

Requirements:
1. Each version must have a unique, catchy subject line.
2. Each version must have a completely different structure and opening to avoid spam filters.
3. Keep the content concise and high-converting.

Return the response strictly as a valid JSON array of objects with the following format:
[
  {
    "subject": "Variation subject",
    "body": "Variation body text"
  }
]
`;

  try {
    const rawContent = await generateWithGemini(prompt);
    const jsonStr = rawContent.replace(/```json|```/g, "").trim();
    const variations = JSON.parse(jsonStr);
    res.json({ variations });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ message: "AI generation failed" });
  }
};