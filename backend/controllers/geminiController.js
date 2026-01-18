import { generateWithGemini } from "../utils/gemini.js";

export const generateCampaignAI = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const content = await generateWithGemini(prompt);
    res.json({ content });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ message: err.message || "AI generation failed" });
  }
};
