import Template from "../models/Template.js";

// ➕ Create new template
export const createTemplate = async (req, res) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: "Failed to create template", error });
  }
};

// 📜 Get all templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch templates", error });
  }
};

// ✏️ Update template
export const updateTemplate = async (req, res) => {
  try {
    const updated = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update template", error });
  }
};

// ❌ Delete template
export const deleteTemplate = async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete template", error });
  }
};
