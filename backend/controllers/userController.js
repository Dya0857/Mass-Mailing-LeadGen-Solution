import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            templates: user.templates,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        // user.email = req.body.email || user.email; 

        if (req.file) {
            user.avatar = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        } else if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            templates: updatedUser.templates,
            token: req.token, // Keep existing token
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
};

// @desc    Add a new template
// @route   POST /api/users/templates
// @access  Private
export const addTemplate = async (req, res) => {
    const { name, subject, body } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("Template name is required");
    }

    const user = await User.findById(req.user.id);

    if (user) {
        const newTemplate = {
            name,
            subject: subject || "",
            body: body || "",
        };

        user.templates.push(newTemplate);
        const updatedUser = await user.save();

        res.status(201).json(updatedUser.templates);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
};

// @desc    Delete a template
// @route   DELETE /api/users/templates/:id
// @access  Private
export const deleteTemplate = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.templates = user.templates.filter(
            (template) => template._id.toString() !== req.params.id
        );

        const updatedUser = await user.save();

        res.json(updatedUser.templates);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
};

// @desc    Update a template
// @route   PUT /api/users/templates/:id
// @access  Private
export const updateTemplate = async (req, res) => {
    const { name, subject, body } = req.body;
    const user = await User.findById(req.user.id);

    if (user) {
        const template = user.templates.id(req.params.id);

        if (template) {
            template.name = name || template.name;
            template.subject = subject !== undefined ? subject : template.subject;
            template.body = body !== undefined ? body : template.body;

            const updatedUser = await user.save();

            res.json(updatedUser.templates);
        } else {
            res.status(404);
            throw new Error("Template not found");
        }
    } else {
        res.status(404);
        throw new Error("User not found");
    }
};
