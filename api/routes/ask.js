const express = require('express');
const axios = require('axios');
const { buildHtmlResponse, fetchImageFromPixabay } = require('../helpers/buildHtml');
const router = express.Router();

const apiKey = process.env.OPENAI_API_KEY;
const spoonacularApiKey = process.env.SPOONACULAR_API_KEY;

router.get('/ask', async (req, res) => {
    const { type, source, recipeName, searchItems, cuisine, excludeCuisine, diet, intolerances, mealType, maxDisplay, numServings, numAdults, numChildren, export: exportFormat } = req.query;

    if (!type || !source || !exportFormat) {
        return res.status(400).json({ success: false, error: 'Required parameters: type, source, and export.' });
    }

    try {
        // Handle different cases (suggestions and ingredients)
        // Case 1: Spoonacular suggestions
        if (type === 'suggestions' && source === 'spoonacular') {
            const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch`;
            const params = {
                apiKey: spoonacularApiKey,
                query: searchItems || '',
                cuisine: cuisine || '',
                excludeCuisine: excludeCuisine || '',
                diet: diet || '',
                intolerances: intolerances || '',
                type: mealType || '',
                number: maxDisplay || 10,
            };
            const response = await axios.get(spoonacularUrl, { params });
            const mealOptions = response.data.results.map(recipe => ({
                recipeName: recipe.title,
                recipeImage: recipe.image,
                cuisine: recipe.cuisines.length ? recipe.cuisines.join(', ') : 'Unknown',
                mealType: mealType || 'Unknown',
            }));

            if (exportFormat === 'html') {
                const htmlResponse = buildHtmlResponse({ meals: mealOptions }, 'suggestions');
                res.setHeader('Content-Type', 'text/html');
                return res.send(htmlResponse);
            } else {
                return res.json({ success: true, meals: mealOptions });
            }
        }

        // Case 2: AI meal suggestions
        if (type === 'suggestions' && source === 'AI') {
            const prompt = `Act as a nutritionist and food specialist. Suggest meals based on: Meal type=${mealType || 'any'}, ${searchItems ? 'specific meal=' + searchItems : ''}, cuisine=${cuisine || 'any'}.`;
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                { model: 'gpt-4', messages: [{ role: 'user', content: prompt }], max_tokens: 200 },
                { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
            );

            const mealsFromAI = response.data.choices[0].message.content.split('\n').map(async (meal) => ({
                recipeName: meal,
                recipeImage: await fetchImageFromPixabay(meal)
            }));

            const mealsWithImages = await Promise.all(mealsFromAI);

            if (exportFormat === 'html') {
                const htmlResponse = buildHtmlResponse({ meals: mealsWithImages }, 'suggestions');
                res.setHeader('Content-Type', 'text/html');
                return res.send(htmlResponse);
            } else {
                return res.json({ success: true, meals: mealsWithImages });
            }
        }

        // Case 3: Ingredients & calculations
        if (type === 'ingredients' && source === 'AI' && recipeName) {
            const prompt = `Provide a list of ingredients for the recipe "${recipeName}".`;
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                { model: 'gpt-4', messages: [{ role: 'user', content: prompt }], max_tokens: 200 },
                { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
            );
            const ingredients = response.data.choices[0].message.content.split('\n').filter(line => line.trim());

            if (exportFormat === 'html') {
                const htmlResponse = buildHtmlResponse({ recipeName, ingredients }, 'ingredients');
                res.setHeader('Content-Type', 'text/html');
                return res.send(htmlResponse);
            } else {
                return res.json({ success: true, recipeName, ingredients });
            }
        }

        // Invalid case
        return res.status(400).json({ success: false, error: 'Invalid query parameters or unsupported case.' });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
