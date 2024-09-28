const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error("Missing OpenAI API Key in environment variables.");
    process.exit(1);  // Exit the application if the API key is missing
}

// GET route to handle queries with a question parameter
app.get('/ask', async (req, res) => {
    const question = req.query.question;  // Capture the question from the query string

    if (!question) {
        return res.status(400).json({ success: false, error: 'Question is required as a query parameter.' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',  // Use the chat-based completions endpoint
            {
                model: 'gpt-4',  // Updated to use the gpt-4 model
                messages: [{ role: 'user', content: question }],  // Correctly send the user question in the required format
                max_tokens: 100,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Return the response from OpenAI
        res.json({
            success: true,
            answer: response.data.choices[0].message.content.trim(),  // Access the correct part of the response
        });
    } catch (error) {
        // Log the error for debugging and send a failure response
        console.error('Error in OpenAI API request:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

