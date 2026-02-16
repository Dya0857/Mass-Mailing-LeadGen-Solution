import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const promoteUser = async (email) => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI not found in .env file");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = "admin";
        await user.save();

        console.log(`Successfully promoted ${email} to ADMIN!`);

        // Also promote the user in current local storage by recommending a logout
        console.log("\nIMPORTANT: Please logout and login again in your browser to see the changes.");

        process.exit(0);
    } catch (err) {
        console.error("Error promoting user:", err);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log("Usage: node promote-admin.js <email>");
    process.exit(1);
}

promoteUser(email);
