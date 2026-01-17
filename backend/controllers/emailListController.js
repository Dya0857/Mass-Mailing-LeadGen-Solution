import fs from "fs";
import csv from "csv-parser";
import EmailList from "../models/EmailList.js";

export const uploadEmailListFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file required" });
    }

    const emails = [];

    fs.createReadStream(req.file.path)
      .pipe(
        csv({
          mapHeaders: ({ header }) =>
            header.replace("\uFEFF", "").trim(), // ✅ BOM-safe
        })
      )
      .on("data", (row) => {
        if (row.email) {
          emails.push(row.email.trim());
        }
      })
      .on("end", async () => {
        fs.unlinkSync(req.file.path); // cleanup

        if (emails.length === 0) {
          return res
            .status(400)
            .json({ message: "No emails found in CSV" });
        }

        const emailList = await EmailList.create({
          name: req.body.name || "CSV Email List",
          emails,
          createdBy: req.user.id,
        });

        res.status(201).json({
          message: "Email list created successfully",
          emailList,
        });
      });
  } catch (error) {
    res.status(500).json({ message: "CSV upload failed" });
  }
};
