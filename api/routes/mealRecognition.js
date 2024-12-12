const express = require('express');
const multer = require('multer');
const { recognizeMeal } = require('../helpers/aiHelpers');
const fs = require('fs');
const router = express.Router();
const verifyJWT = require('../middleware/jwtMiddleware');

const upload = multer({ dest: 'uploads/' });

router.post('/recognize-meal', verifyJWT, upload.single('mealImage'), async (req, res) => {
    const exportFormat = req.body.export || 'json';
    const imagePath = req.file.path;
    const numServings = req.body.numServings || 4;
   

    try {
        // Call the helper function to recognize the meal
        const result = await recognizeMeal(imagePath, numServings);

 
            return res.json(result);
 
    } catch (error) {
        console.error('Error recognizing meal:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    } finally {
        fs.unlinkSync(imagePath); // Clean up the uploaded file
    }
});

module.exports = router;
