// audioRoute.js
const express = require('express');
const multer = require('multer');
const { processAudio } = require('../helpers/aiHelpers');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/process-audio', upload.single('audio'), async (req, res) => {
    const audioPath = req.file.path;

    try {
        const taskData = await processAudio(audioPath);
        res.json(taskData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        // Clean up the uploaded file
        fs.unlink(audioPath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
});

module.exports = router;
