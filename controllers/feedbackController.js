const model = require("../models/model")

////////
const getAllFeedbacks = async (req, res) => {
    try {
        res.status(200).json(model.GetData.getAllItemsWithNumOfCommentsReplies(false));
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

///////
const getCertainFeedback = async (req, res) => {
    try {
        res.status(200).json(model.GetData.getCertainItem(false, req.params.id));
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error.message })
    }
}

///////
const getCertainFeedbackForEdit = async (req, res) => {
    try {
        res.status(200).json(model.GetData.getCertainItem(false, req.params.id));
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

///////
const getAllRoadmapFeedbacks = async (req, res) => {
    try {
        res.status(200).json(model.GetData.getAllItemsWithNumOfCommentsReplies(true))
    } catch (error) {
        res.status(500).json({ message: "An error occured" })
    }
}

////////
const getCertainRoadmapFeedback = async (req, res) => {
    try {
        res.status(200).json(model.GetData.getCertainItem(true, req.params.id));
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

///////
const postSuggestion = async (req, res) => {
    try {
        model.SetData.postEntity('requests', req.body);
        res.status(201).json({ message: "Suggestion created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

///////
const postComment = async (req, res) => {
    try {
        model.SetData.postEntity('comments', req.body);
        res.status(201).json({ message: "Comment created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

///////
const postReply = async (req, res) => {
    try {
        model.SetData.postEntity('replies', req.body);
        res.status(201).json({ message: "Reply created successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

///////
const updateSuggestion = async (req, res) => {
    try {
        model.SetData.updateEntity(req.body)
        res.status(200).json({ message: "Suggestion updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log(error)
    }
}

const deleteSuggestion = async (req, res) => {
    try {
        model.SetData.deleteEntity(req.body.id);
        res.status(200).json({ message: "Suggestion deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

module.exports = {
    getAllFeedbacks,
    getCertainFeedback,
    getCertainFeedbackForEdit,
    getAllRoadmapFeedbacks,
    getCertainRoadmapFeedback,
    postSuggestion,
    postComment,
    postReply,
    updateSuggestion,
    deleteSuggestion
}