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



const fixMealWithIngredients = async (imagePath, numAdults, numChildren) => {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

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
                            "text": `What’s in this image? please recognize if there are any ingredients that could be used to prepare a meal in the picture. If there are ingredients in the picture, please create a response in JSON format (please make sure it's valid JSON before replying), considering servings for ${totalAdults} adults and ${totalChildren} children, following this format:
{
  "isRecognized": "true/false depending on success or failure of processing the picture",
  "hasIngredients": "true/false depending on if any ingredients were found in the picture",
  "fullDescription": "FULL DESCRIPTION OF THE IMAGE BEING RECOGNIZED",
  "ingredientsRecognized": [
    { "name": "INGREDIENT NAME" }
  ],
  "mealSuggestions": [
    {
      "mealName": "NAME OF THE MEAL SUGGESTED",
      "recipe": "RECIPE FOR THE MEAL SUGGESTED",
      "ingredients": [
        { "name": "INGREDIENT NAME", "qty": "QUANTITY BASED ON RECIPE", "note": "NOTE ABOUT THE INGREDIENT" }
      ]
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

        // Clean the mealData before parsing
        let mealData = response.data.choices[0].message.content;
        mealData = mealData.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log(mealData);
        const parsedData = JSON.parse(mealData);

        return {
            response: parsedData,
        };
    } catch (error) {
        console.error('Error recognizing ingredients:', error.message);
        return {
            isRecognized: false,
            hasIngredients: false,
            fullDescription: '',
            ingredientsRecognized: [],
            mealSuggestions: []
        };
    }
};

// Function to suggest meals based on ingredients


module.exports = { recognizeMeal, fixMeal };
