const axios = require('axios');
const pixabayApiKey = process.env.PIXABAY_API_KEY;

// Fetch image from Pixabay
const fetchImageFromPixabay = async (query) => {
    try {
        const response = await axios.get(`https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=1`);
        if (response.data.hits && response.data.hits.length > 0) {
            return response.data.hits[0].webformatURL;
        }
    } catch (error) {
        console.error('Error fetching image from Pixabay:', error.message);
    }
    return '';
};

// Build HTML response for suggestions or ingredients
const buildHtmlResponse = (data, caseType) => {
    if (caseType === 'suggestions') {
        let html = `<table><thead><tr><th>Recipe</th><th>Image</th><th>Details</th></tr></thead><tbody>`;
        data.meals.forEach(meal => {
            html += `<tr><td>${meal.recipeName}</td><td><img src="${meal.recipeImage}" alt="${meal.recipeName}"></td><td>Cuisine: ${meal.cuisine || 'Unknown'}</td></tr>`;
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

// Function to build an HTML response for meal recognition
const buildMealRecognitionHtml = (data) => {
    if (!data.isRecognized) {
        return `<h1>Meal Not Recognized</h1><p>Sorry, no meal was recognized from the provided image.</p>`;
    }

    let html = `<h1>Meal: ${data.mealName}</h1>`;
    html += `<p><strong>Description:</strong> ${data.fullDescription}</p>`;
    html += `<p><strong>Recipe:</strong> ${data.recipe}</p>`;
    html += `<p><strong>Serving:</strong> ${data.serving.adults} adults, ${data.serving.children} children</p>`;
    html += `<h2>Ingredients:</h2><ul>`;

    data.ingredients.forEach(ingredient => {
        html += `<li><strong>${ingredient.name}</strong>: ${ingredient.qty} (${ingredient.note})</li>`;
    });

    html += `</ul>`;
    return html;
};

const buildMealSuggestionHtml = (data) => {
    if (!data.isRecognized || !data.hasIngredients) {
        return `<h1>No Ingredients Recognized</h1><p>Sorry, no ingredients were recognized from the provided image.</p>`;
    }

    let html = `<h1>Ingredients Recognized:</h1><ul>`;
    data.ingredientsRecognized.forEach(ingredient => {
        html += `<li>${ingredient.name}</li>`;
    });
    html += `</ul><h2>Meal Suggestions:</h2><ul>`;

    data.mealSuggestions.forEach(meal => {
        html += `<li><strong>${meal.mealName}</strong><br>`;
        html += `<p><strong>Recipe:</strong> ${meal.recipe}</p><h3>Ingredients:</h3><ul>`;
        meal.ingredients.forEach(ingredient => {
            html += `<li><strong>${ingredient.name}</strong>: ${ingredient.qty} (${ingredient.note})</li>`;
        });
        html += `</ul></li>`;
    });

    html += `</ul>`;
    return html;
};




module.exports = { buildHtmlResponse, fetchImageFromPixabay, buildMealRecognitionHtml, buildMealSuggestionHtml };
