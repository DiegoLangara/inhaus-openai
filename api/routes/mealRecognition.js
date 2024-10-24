const express = require('express');
const multer = require('multer');
const { recognizeMeal } = require('../helpers/aiHelpers');
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/recognize-meal', upload.single('mealImage'), async (req, res) => {
    const exportFormat = req.body.export || 'json';
    const imagePath = req.file.path;
    const numAdults = req.body.numAdults || 4;
    const numChildren = req.body.numChildren || 0;

    try {
        // Call the helper function to recognize the meal
        const result = await recognizeMeal(imagePath, numAdults, numChildren);

        // Send the response based on requested format (HTML or JSON)
        if (exportFormat === 'html') {
            const htmlResponse = `<h1>Meal Name: ${result.mealName}</h1><p>${result.recipe}</p>`;
            res.setHeader('Content-Type', 'text/html');
            return res.send(htmlResponse);
        } else {
            return res.json(result);
        }
    } catch (error) {
        console.error('Error recognizing meal:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    } finally {
     //   fs.unlinkSync(imagePath); // Clean up the uploaded file
    }
});

module.exports = router;
