const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const recognizeMealRoutes = require('./api/routes/mealRecognition');
const fixMealRoutes = require('./api/routes/mealSuggestion');
const audioRoute = require('./api/routes/audioRoute');
const transcriptionRoute = require('./api/routes/transcriptionRoute');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', recognizeMealRoutes);
app.use('/api', fixMealRoutes);
app.use('/api', audioRoute);
app.use('/api', transcriptionRoute);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
