import api from "../service/api"; // your axios instance

const handleAIGenerate = async () => {
  if (!aiPrompt.trim()) return;

  setAiLoading(true);

  try {
    const res = await api.post("/ai/generate-campaign", { prompt: aiPrompt });
    setForm((prev) => ({ ...prev, content: res.data.content }));
  } catch (err) {
    setMsg("❌ Failed to generate AI content");
  } finally {
    setAiLoading(false);
  }
};
