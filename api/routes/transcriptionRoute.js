const express = require('express');
const { processTranscription } = require('../helpers/aiHelpers');

const router = express.Router();

router.post('/process-transcription', async (req, res) => {
    const { transcription } = req.body;

    if (!transcription) {
        return res.status(400).json({ error: 'Transcription text is required.' });
    }

    try {
        const taskData = await processTranscription(transcription);
        res.json(taskData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;