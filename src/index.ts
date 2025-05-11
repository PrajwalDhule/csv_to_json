const express = require("express");
import { Request, Response } from "express";
import { initDb } from "./db";
import { UserDistribution } from "./types/user";
import dotenv from 'dotenv';
import { getDistributionFromCsvFile } from "./lib/helper";
dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());

app.post("/csv-to-json", async (req: Request, res: Response) => {
    try{
        const filePath = process.env.CSV_FILE_PATH || "";

        const result = await getDistributionFromCsvFile(filePath);

        console.log("\nAge-Group | % Distribution");
        result.forEach((row: UserDistribution) => {
            console.log(`${row.age_group}     |  ${row.distribution}`);
        });

        res.json(result);

    }
    catch (err) {
        console.error("Failed to process and convert CSV:", err);
        res.status(500).json({ error: "Failed to process and convert CSV." });
      }
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`server is running at port no ${PORT}`);
    });
})