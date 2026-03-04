import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const CampaignSchema = new mongoose.Schema({
    name: String,
    status: String,
    scheduleAt: Date
});

const Campaign = mongoose.model('Campaign', CampaignSchema);

async function run() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        const campaigns = await Campaign.find({ status: 'scheduled' }).sort({ scheduleAt: 1 });

        console.log("\n--- SCHEDULED CAMPAIGNS ---");
        if (campaigns.length === 0) {
            console.log("No scheduled campaigns found.");
        } else {
            campaigns.forEach(c => {
                console.log(`Campaign: ${c.name}`);
                console.log(`Scheduled At (UTC): ${c.scheduleAt.toISOString()}`);
                console.log(`Scheduled At (Local Estimate): ${new Date(c.scheduleAt.getTime() + 5.5 * 60 * 60 * 1000).toLocaleString()}`);
                console.log('---------------------------');
            });
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
