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
You are an expert high-conversion email marketing strategist. Your goal is to write sophisticated, long-form persuasive copy.

Generate distinct versions of an email for the following campaign:
- Purpose: [Insert Context/Purpose here]
- Audience: [Insert Target Audience here]
- Essential Keywords: [Insert Keywords here]
- Voice/Tone: [Insert Tone here]
- Number of Variations: [Insert Count here]

STRATEGIC REQUIREMENTS:
1. NARRATIVE DEPTH: Avoid being brief. Deep-dive into the specific pain points the audience faces and explain exactly how the solution provides relief. 
2. VALUE PROPOSITION: Do not just list features. Articulate the "transformation"—describe the state of the user before and after using the product/service.
3. PERSUASIVE HOOKS: Start each email with a powerful "hook" (a question, a shocking statistic, or a relatable struggle) to ensure immediate engagement.
4. GREETING: Address the audience directly (e.g., "Hello [Target Audience],"). Do NOT use personal name tags like {{Name}}.
5. STRUCTURE: Use a sophisticated flow: Hook -> Empathy/Problem -> The "Big Idea" -> Benefit Bullets -> Social Proof/Trust -> Clear, singular Call to Action.
6. FORMATTING: Use {{Company}} for the sender's company and {{SenderName}} for the signature.

OUTPUT FORMAT:
Return the response STRICTLY as a valid JSON array of objects. No preamble or conversational text.
[
  {
    "subject": "A catchy, curiosity-driven subject line",
    "body": "The detailed, multi-paragraph persuasive email body..."
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