const fs = require('fs');

// Helper function to encode image
const encodeImage = (imagePath) => {
    try {
        return fs.readFileSync(imagePath, 'base64');
    } catch (error) {
        console.error('Error encoding image:', error.message);
        return null;
    }
};

// Helper function to build HTML for meal recognition
const buildMealRecognitionHtml = (data) => {
    return `<h1>${data.name}</h1><p>${data.description}</p><h2>Recipe</h2><p>${data.recipe}</p><h2>Ingredients</h2><ul>${data.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>`;
};

module.exports = { encodeImage, buildMealRecognitionHtml };
