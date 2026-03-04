import { generateWithGemini } from "../utils/gemini.js";

export const generateCampaignAI = async (req, res) => {
  try {
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
You are a helpful assistant writing a personal, one-on-one email.

TASK:
Generate EXACTLY ${variationCount} high-quality ${campaignType} email variations.

CAMPAIGN DETAILS:
- Context / Purpose: ${context}
- Target Audience: ${audience}
- Keywords to include (naturally): ${keywords || "None"}
- Tone: Conversational and Personal

INBOX OPTIMIZATION RULES (TO LAND IN PRIMARY TAB):
1. TONE: Write like a real person sending a helpful note to another person. Avoid "marketing-speak" or sounding like a sales pitch.
2. TRIGGER WORDS: DO NOT use promotional trigger words such as: "Promotion," "Sale," "Offer," "Deal," "Discount," "Limited Time," "Act Now," or "Free."
3. MINIMAL HTML: Use only basic HTML to maintain a personal feel:
   - Use <p> tags for paragraphs.
   - Use <br> for line breaks.
   - AVOID <strong> tags, <ul>/<li> lists, or complex formatting unless strictly necessary for clarity.
4. VARIATION: Each variation MUST have a different personal angle or hook.
5. START: Begin with a warm, natural greeting:
   <p>Hello ${audience},</p>
6. END: Finish with a personal sign-off:
   <p>Best regards,<br>{{SenderName}}</p>

CONTENT REQUIREMENTS:
- Provide meaningful detail and value based on the Context.
- Focus on being helpful and informative.
- Use a mix of short and longer paragraphs to mimic natural writing.
- Strong but natural call-to-action (CTA).

OUTPUT FORMAT:
Return ONLY a valid JSON array.
No explanation.
No markdown.
No code blocks.

Format:
[
  {
    "subject": "Subject line here",
    "body": "Personal, conversational email body (mainly using <p> and <br>)"
  }
]
`;

    const rawContent = await generateWithGemini(prompt);

    // Clean markdown formatting if model adds code blocks
    let jsonStr = rawContent.trim();

    if (jsonStr.includes("```")) {
      jsonStr = jsonStr
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    }

    const startIndex = jsonStr.indexOf("[");
    const endIndex = jsonStr.lastIndexOf("]");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Invalid JSON format returned from AI");
    }

    jsonStr = jsonStr.substring(startIndex, endIndex + 1);

    const variations = JSON.parse(jsonStr);

    return res.status(200).json({ variations });

  } catch (err) {
    console.error("Gemini error:", err);
    return res.status(500).json({
      message: "AI generation failed",
      error: err.message
    });
  }
};