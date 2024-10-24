const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const { encodeImage, buildMealRecognitionHtml } = require('../helpers/imageHelpers');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const apiKey = process.env.OPENAI_API_KEY;

// POST route to handle meal recognition from image upload
router.post('/recognize-meal', upload.single('mealImage'), async (req, res) => {
    const exportFormat = req.body.export || 'json';
    const imagePath = req.file.path;

    try {
        const base64Image = encodeImage(imagePath);
        console.log('base64Image:', base64Image);
        if (!base64Image) {
            return res.status(500).json({ success: false, error: 'Error encoding the image.' });
        }

        const openAiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'What’s in this image?' },
                            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                        ]
                    }
                ],
                max_tokens: 300,
            },
            { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
        );

        const openAiData = openAiResponse.data.choices[0].message.content.split('\n').filter(line => line.trim());
        const description = openAiData[0];
        const recipe = openAiData.slice(1, openAiData.indexOf('Ingredients:')).join(' ');
        const ingredients = openAiData.slice(openAiData.indexOf('Ingredients:') + 1);

        const mealData = { name: req.file.originalname, description, recipe, ingredients };

        if (exportFormat === 'html') {
            const htmlResponse = buildMealRecognitionHtml(mealData);
            res.setHeader('Content-Type', 'text/html');
            return res.send(htmlResponse);
        } else {
            return res.json({ success: true, ...mealData });
        }
    } catch (error) {
        console.error('Error processing meal recognition:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    } finally {
    //    fs.unlinkSync(imagePath); // Clean up the uploaded file
    }
});

module.exports = router;
