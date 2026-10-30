import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

const generatedResumeDir = path.resolve(
    process.cwd(),
    "storage/generated-resumes"
);

router.get("/download/:filename", (req, res) => {
    const { filename } = req.params;

    // Only allow safe PDF filenames
    if (!/^[a-zA-Z0-9_-]+\.pdf$/.test(filename)) {
        return res.status(400).json({
            message: "Invalid filename",
        });
    }

    const filePath = path.join(generatedResumeDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "Resume not found",
        });
    }

    return res.download(filePath, filename);
});

export default router;