import { generateWithGemini } from "../utils/gemini.js";

export const generateCampaignAI = async (req, res) => {
  const {
    context,
    audience,
    keywords,
    tone = "Professional",
    campaignType = "promotion",
    variationCount = 7
  } = req.body;

  if (!context || !audience) {
    return res.status(400).json({
      message: "Context and audience are required"
    });
  }

  const prompt = `
You are an expert email marketing copywriter and HTML coder.

Generate ${variationCount} distinct versions of a ${campaignType} email for the following campaign:
Context/Purpose: ${context}
Target Audience: ${audience}
Keywords to include: ${keywords}
Tone: ${tone}

Requirements:
1. Each version must have a unique, catchy subject line.
2. The email body MUST BE VERY LONG AND DETAILED. Do not write a short 2-3 sentence summary. Write a complete, comprehensive email spanning multiple paragraphs. Base the content entirely on the Context/Purpose.
3. You MUST output the body using HTML tags. Use tags like <p>, <br>, <strong>, <em>, <ul>, <li>, <h1>, <h2> to format the text beautifully. 
4. DO NOT OUTPUT PLAIN TEXT. The 'body' field in the JSON must contain fully formatted HTML. Example: "<p>Hello ${audience},</p><p>We are excited to share...</p><ul><li>Benefit 1</li></ul>"
5. Format the output as a reusable template:
   - Start with a greeting using the Target Audience (e.g., "<p>Hello ${audience},</p>").
   - DO NOT use {{Name}} in the greeting.
   - Use {{Company}} for the sender's company name where appropriate.
   - Use [Your Name] or {{SenderName}} for the signature.

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