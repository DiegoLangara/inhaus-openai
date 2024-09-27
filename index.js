// index.js
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

const getOpenAIChatResponse = async (messages) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',  // Correct chat completion endpoint
            {
                model: 'gpt-3.5-turbo',  // Ensure you are using a valid chat model (e.g., gpt-3.5-turbo or gpt-4)
                messages: messages,
                max_tokens: 100,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error fetching data from OpenAI:', error.message);
    }
};

// Test function
const runTest = async () => {
    const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' }
    ];
    const response = await getOpenAIChatResponse(messages);
    console.log('OpenAI Response:', response);
};

runTest();
