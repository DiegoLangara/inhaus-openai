const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;
const spoonacularApiKey = process.env.SPOONACULAR_API_KEY;
const pixabayApiKey = process.env.PIXABAY_API_KEY;  // Pixabay API key for images

if (!apiKey || !spoonacularApiKey || !pixabayApiKey) {
    console.error("Missing API Keys in environment variables.");
    process.exit(1);  // Exit if any API key is missing
}

// Helper function to fetch an image from Pixabay
const fetchImageFromPixabay = async (query) => {
    try {
        const response = await axios.get(`https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=1`);
        if (response.data.hits && response.data.hits.length > 0) {
            return response.data.hits[0].webformatURL;
        }
    } catch (error) {
        console.error('Error fetching image from Pixabay:', error.message);
    }
    return '';  // Return empty string if no image is found or there's an error
};

// Helper function to build an HTML table or unordered list based on case type
const buildHtmlResponse = (data, caseType) => {
    if (caseType === 'suggestions') {
        let html = `<table border="1" style="border-collapse: collapse; width: 100%;"><thead><tr><th>Recipe Name</th><th>Image</th><th>Details</th></tr></thead><tbody>`;
        data.meals.forEach(meal => {
            html += `<tr>
                        <td>${meal.recipeName}</td>
                        <td><img src="${meal.recipeImage}" alt="${meal.recipeName}" style="width:150px;"></td>
                        <td>Cuisine: ${meal.cuisine || 'Unknown'}, Meal Type: ${meal.mealType || 'Unknown'}</td>
                    </tr>`;
        });
        html += `</tbody></table>`;
        return html;
    } else if (caseType === 'ingredients') {
        let html = `<h1>${data.recipeName}</h1><ul>`;
        data.ingredients.forEach(ingredient => {
            html += `<li>${ingredient}</li>`;
        });
        html += `</ul>`;
        return html;
    }
    return '';
};

// GET route to handle meal suggestions or ingredient lists
app.get('/ask', async (req, res) => {
    const { type, source, recipeName, searchItems, cuisine, excludeCuisine, diet, intolerances, mealType, maxDisplay, numServings, numAdults, numChildren, export: exportFormat } = req.query;

    if (!type || !source || !exportFormat) {
        return res.status(400).json({ success: false, error: 'Required parameters: type, source, and export.' });
    }

    try {
        // Case 1: Meal suggestions - Spoonacular
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
            const mealOptions = await Promise.all(response.data.results.map(async recipe => ({
                recipeName: recipe.title,
                recipeImage: recipe.image,
                cuisine: Array.isArray(recipe.cuisines) && recipe.cuisines.length ? recipe.cuisines.join(', ') : 'Unknown',
                mealType: mealType || 'Unknown',
            })));

            if (exportFormat === 'html') {
                const htmlResponse = buildHtmlResponse({ meals: mealOptions }, 'suggestions');
                res.setHeader('Content-Type', 'text/html');
                return res.send(htmlResponse);
            } else {
                return res.json({ success: true, meals: mealOptions });
            }
        }

        // Case 2: Meal suggestions - OpenAI
        if (type === 'suggestions' && source === 'AI') {
            const prompt = `Act as a nutritionist and food specialist. Suggest meals based on the following: Meal type=${mealType || 'any'}, ${searchItems ? 'specific meal=' + searchItems : ''}, cuisine = ${cuisine || 'any'}, excludeCuisine = ${excludeCuisine || 'none'}, diet = ${diet || 'any'}, intolerances = ${intolerances || 'none'}. Provide ${maxDisplay || 5} meal options, and include a relevant image.`;
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 200,
                    temperature: 0.7,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const mealsFromAI = response.data.choices[0].message.content.split('\n').filter(line => line.trim()).map(async (meal) => ({
                recipeName: meal,
                recipeImage: await fetchImageFromPixabay(meal)  // Fetch image from Pixabay for each meal
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

        // Case 3: List of ingredients & calculations
        if (type === 'ingredients' && source === 'AI' && recipeName) {
            const prompt = `Provide a list of ingredients and quantities for the recipe "${recipeName}". Calculate based on ${numServings || 1} servings, ${numAdults || 1} adults, and ${numChildren || 0} children.`;
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 200,
                    temperature: 0.7,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
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

        // If none of the cases match, return an error
        return res.status(400).json({ success: false, error: 'Invalid query parameters or unsupported case.' });

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

