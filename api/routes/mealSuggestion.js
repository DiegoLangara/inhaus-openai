const express = require('express');
const multer = require('multer');
const { fixMealWithIngredients } = require('../helpers/aiHelpers');
const { buildMealSuggestionHtml } = require('../helpers/buildHtml');  // Import the HTML builder function
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/fix-me-a-meal', upload.single('mealImage'), async (req, res) => {
    const exportFormat = req.body.export || 'json';
    const imagePath = req.file.path;
    const numAdults = req.body.numAdults || 4;
    const numChildren = req.body.numChildren || 0;

    try {
        // Call the helper function to recognize ingredients and suggest meals
        const result = await fixMealWithIngredients(imagePath, numAdults, numChildren);

        // Send the response based on requested format (HTML or JSON)
        if (exportFormat === 'html') {
            const htmlResponse = buildMealSuggestionHtml(result.response);
            res.setHeader('Content-Type', 'text/html');
            return res.send(htmlResponse);
        } else {
            return res.json(result.response);
        }
    } catch (error) {
        console.error('Error suggesting meals:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    } finally {
      //  fs.unlinkSync(imagePath); // Clean up the uploaded file
    }
});

module.exports = router;
