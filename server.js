const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const feedbackController = require('./controllers/feedbackController');

app.use(cors());
app.use(express.json());

app.listen(process.env.PORT, () => { console.log(`Server is running on port ${process.env.PORT}`) })

app.get('/suggestions', feedbackController.getAllFeedbacks)

app.get('/suggestions/:id', feedbackController.getCertainFeedback)

app.get('/suggestions/:id/edit', feedbackController.getCertainFeedbackForEdit)

app.get('/roadmap', feedbackController.getAllRoadmapFeedbacks)

app.get('/roadmap/:id', feedbackController.getCertainRoadmapFeedback)

app.post("/suggestions", feedbackController.postSuggestion)

app.post("/comment", feedbackController.postComment)

app.post("/reply", feedbackController.postReply)

app.patch("/suggestions/edit", feedbackController.updateSuggestion)

app.delete("/suggestions/delete", dfeedbackController.eleteSuggestion)