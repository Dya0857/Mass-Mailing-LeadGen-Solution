import User from "../models/User.js";
import bcrypt from "bcryptjs";

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
            token: req.token, // Keep existing token
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
};
