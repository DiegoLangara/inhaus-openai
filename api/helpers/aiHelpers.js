const axios = require('axios');
const fs = require('fs');

const apiKey = process.env.OPENAI_API_KEY; // Get the API key from environment variables

const recognizeMeal = async (imagePath, numAdults, numChildren) => {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
//console.log('img:'+base64Image);
//console.log('adults:'+numAdults);
//console.log('children:'+numChildren);
    let totalAdults = numAdults;
    let totalChildren = numChildren;

    if ((numAdults === undefined && numChildren === undefined) || (numAdults == "" && numChildren == "") || (numAdults == 0 && numChildren == 0)) {
        totalAdults = 4;
        totalChildren = 0;
    }
console.log('starting to recognize Meal');
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": `What’s in this image? please recognize if there is any meal in the picture. If there is a meal in the picture, please create a response in JSON format (please make sure is a valid json format before replying), considering servings for ${totalAdults} adults, following the instructions/format: {
                           
                                "isRecognized": "true/false depending on success or nor for the picture to be processed or recognized",
                                "isMeal": "true/false depending on if any related food elements were found in the picture",
                                "fullDescription": "FULL DESCRIPTION OF THE IMAGE BEING RECOGNIZED",
                                "title": "PICK A NAME FOR THE MEAL RECOGNIZED",
                                "recipe": "DETAIL THE RECIPE FOR THE MEAL RECOGNIZED STEP-BY-STEP",
                                "readyInMinutes": "AVERAGE TIME IN MINUTES TO PREPARE THE MEAL RECOGNIZED",
                                "healthScore": "A HEALTH SCORE FOR THE MEAL RECOGNIZED (0-10) / 10",
                                "servings": "INTEGER NUMBER OR ADULTS CONSIDERED FOR THE RECIPE",
                                "ingredients": [
                                    {
                                        "name": "INGREDIENT NAME",
                                        "amount": "QUANTITY FOR THE INGREDIENT BASED ON RECIPE IN FLOAT NUMBER (0 FOR TO TASTE OR NONE)",
                                        "unit": "UNIT USED FOR THE QUANTITY OF THE INGREDIENT BASED ON RECIPE (to taste if CANNOT BE MEASURED)",
                                    }
                                ]
                            }`
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": `data:image/jpeg;base64,${base64Image}`,
                                "detail": "low"
                            }
                        }
                    ]
                }
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });



         // Clean up the response: remove backticks and the "```json" and "\n```" formatting
         let mealData = response.data.choices[0].message.content;
         mealData = mealData.replace(/```json/g, '').replace(/```/g, '').trim();

         // Parse the cleaned response into JSON
         const parsedData = JSON.parse(mealData);
 console.log(parsedData);
         return {
             response: parsedData,
         };


    } catch (error) {
        console.error('Error recognizing meal:', error.message);
        return {
            isRecognized: false,
            isMeal: false,
            fullDescription: '',
            mealName: '',
            recipe: '',
            serving: '',
            ingredients: '',
        };
    }
};

const fixMeal = async (imagePath, numAdults, numChildren) => {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
//console.log('img:'+base64Image);
//console.log('adults:'+numAdults);
//console.log('children:'+numChildren);
    let totalAdults = numAdults;
    let totalChildren = numChildren;

    if ((numAdults === undefined && numChildren === undefined) || (numAdults == "" && numChildren == "") || (numAdults == 0 && numChildren == 0)) {
        totalAdults = 4;
        totalChildren = 0;
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": `What’s in this image? please recognize if there are any ingredients in the picture that could be used to make a meal. Please create a response in JSON format (please make sure is a valid json format before replying), suggesting a recipe for a meal that could be made with the ingredients recognized considering servings for ${totalAdults} adults, following the instructions/format: {
                         
                                "isRecognized": "true/false depending on success or nor for the picture to be processed or recognized",
                                "isMeal": "true/false depending on if a meal could be made with the ingredients recognized",
                                "fullDescription": "FULL DESCRIPTION OF THE IMAGE BEING RECOGNIZED",
                                "title": "A NAME FOR THE MEAL SUGGESTED",
                                "recipe": "DETAIL THE RECIPE FOR THE MEAL SUGGESTED STEP-BY-STEP",
                                "readyInMinutes": "AVERAGE TIME IN MINUTES TO PREPARE THE MEAL SUGGESTED",
                                "healthScore": "A HEALTH SCORE FOR THE MEAL SUGGESTED (0-10) / 10",
                                "servings": "INTEGER NUMBER OR ADULTS CONSIDERED FOR THE RECIPE",
                                "ingredients": [
                                    {
                                        "name": "INGREDIENT NAME",
                                        "amount": "QUANTITY FOR THE INGREDIENT BASED ON RECIPE IN FLOAT NUMBER (0 FOR TO TASTE OR NONE)",
                                        "unit": "UNIT USED FOR THE QUANTITY OF THE INGREDIENT BASED ON RECIPE (to taste if CANNOT BE MEASURED)",
                                    }
                                ]
                            }`
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": `data:image/jpeg;base64,${base64Image}`,
                                "detail": "low"
                            }
                        }
                    ]
                }
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });



         // Clean up the response: remove backticks and the "```json" and "\n```" formatting
         let mealData = response.data.choices[0].message.content;
         mealData = mealData.replace(/```json/g, '').replace(/```/g, '').trim();

         // Parse the cleaned response into JSON
         const parsedData = JSON.parse(mealData);
 console.log(parsedData);
         return {
             response: parsedData,
         };


    } catch (error) {
        console.error('Error recognizing meal:', error.message);
        return {
            isRecognized: false,
            isMeal: false,
            fullDescription: '',
            mealName: '',
            recipe: '',
            serving: '',
            ingredients: '',
        };
    }
};



const processAudio = async (audioPath) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioPath));
        formData.append('model', 'whisper-1');

        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        const transcription = response.data.text;

        // Define default values
        const defaultTask = {
            Taskname: "Enter task name",
            "StartDate and startTime": new Date().toISOString(),
            "endDate and endTime": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            repeat: "Never",
            category: "",
            "assign to": "",
            points: 100,
        };

        // Use OpenAI's GPT model to extract structured data
        const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that extracts task information from transcriptions.',
                },
                {
                    role: 'user',
                    content: `Extract the following information from this transcription: "${transcription}". If any information is missing, use the default values provided: ${JSON.stringify(defaultTask)}. Return the information in the following JSON format:
                    {
                        "Taskname": "String",
                        "StartDate and startTime": "ISO 8601 Timestamp",
                        "endDate and endTime": "ISO 8601 Timestamp",
                        "repeat": "String (options: 'Never', 'Everyday', 'Every Week', 'Every 2 Weeks', 'Every Month', 'Every Year')",
                        "category": "String",
                        "assign to": "String",
                        "points": Integer
                    }`,
                },
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        const taskData = JSON.parse(gptResponse.data.choices[0].message.content);

        return taskData;
    } catch (error) {
        console.error('Error processing audio:', error.message);
        throw new Error('Failed to process audio.');
    }
};

const processTranscription = async (transcription) => {
    try {
        // Define default values
        const defaultTask = {
            Taskname: "Enter task name",
            "StartDate and startTime": new Date().toISOString(),
            "endDate and endTime": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            repeat: "Never",
            category: "",
            "assign to": "",
            points: 100,
        };

        // Use OpenAI's GPT model to extract structured data
        const gptResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that extracts task information from transcriptions.',
                },
                {
                    role: 'user',
                    content: `Extract the following information from this transcription: "${transcription}". If any information is missing, use the default values provided: ${JSON.stringify(defaultTask)}. Return the information in the following JSON format:
                    {
                        "Taskname": "String",
                        "StartDate and startTime": "ISO 8601 Timestamp",
                        "endDate and endTime": "ISO 8601 Timestamp",
                        "repeat": "String (options: 'Never', 'Everyday', 'Every Week', 'Every 2 Weeks', 'Every Month', 'Every Year')",
                        "category": "String",
                        "assign to": "String",
                        "points": Integer
                    }`,
                },
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        const taskData = JSON.parse(gptResponse.data.choices[0].message.content);

        return taskData;
    } catch (error) {
        console.error('Error processing transcription:', error.response ? error.response.data : error.message);
        throw new Error('Failed to process transcription.');
    }
};


// Function to suggest meals based on ingredients


module.exports = { recognizeMeal, fixMeal, processAudio, processTranscription };
