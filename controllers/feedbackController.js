const itemsPool = require('../dbconfig');

const getAllFeedbacks = async (req, res) => {
    try {
        const data = (await itemsPool.query("SELECT * FROM requests WHERE status = 'suggestion'")).rows
        const newArr = []

        for (suggestion of data) {
            let numOfComments = 0
            let numOfReplies = 0

            const commentCount = (await itemsPool.query('SELECT COUNT(*) FROM comments WHERE request_id = $1', [suggestion.id])).rows[0]

            numOfComments = Number(commentCount.count);

            const comments = await itemsPool.query('SELECT * FROM comments WHERE request_id = $1', [suggestion.id]);

            if (comments.rows.length) {
                const placeholders = comments.rows.map((elem, index) => `$${index + 1}`).join(', ');

                const replies = await itemsPool.query(
                    `SELECT COUNT(*) FROM replies WHERE comment_id IN (${placeholders})`,
                    comments.rows.map(comment => comment.id)
                );
                numOfReplies = Number(replies.rows[0].count);
            }

            newArr.push({ ...suggestion, totalCommentReplyNum: numOfComments + numOfReplies })
        }

        res.status(200).json(newArr);
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

const getCertainFeedback = async (req, res) => {
    try {
        const suggestion = (await itemsPool.query("SELECT * FROM requests WHERE id = $1 AND status = $2", [req.params.id, 'suggestion'])).rows[0];

        const comments = (await itemsPool.query('SELECT * FROM comments WHERE request_id = $1', [req.params.id])).rows

        const comment_ids = comments.map(comment => comment.id);
        if (!comment_ids.length) return res.status(200).json({ suggestion, comments: [], replies: [] });

        const replies = (await itemsPool.query(`SELECT * FROM replies WHERE comment_id IN (${comment_ids.join(',')})`)).rows

        res.status(200).json({ suggestion, comments, replies });
    } catch (error) {
        res.status(404).json({ message: "An error occured" })
    }
}

const getCertainFeedbackForEdit = async (req, res) => {
    try {
        const suggestion = await (await itemsPool.query('SELECT * FROM requests WHERE id = $1 AND status = $2', [req.params.id, 'suggestion'])).rows[0];
        res.status(200).json(suggestion);
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

const getAllRoadmapFeedbacks = async (req, res) => {
    try {
        const data = (await itemsPool.query("SELECT * FROM requests WHERE status != 'suggestion'")).rows

        const newArr = []

        for (suggestion of data) {
            let numOfComments = 0
            let numOfReplies = 0

            const commentCount = (await itemsPool.query('SELECT COUNT(*) FROM comments WHERE request_id = $1', [suggestion.id])).rows[0]
            numOfComments = Number(commentCount.count);

            const comments = await itemsPool.query('SELECT * FROM comments WHERE request_id = $1', [suggestion.id]);
            if (comments.rows.length) {
                const placeholders = comments.rows.map((elem, index) => `$${index + 1}`).join(', ');

                const replies = await itemsPool.query(`SELECT COUNT(*) FROM replies WHERE comment_id IN (${placeholders})`, comments.rows.map(comment => comment.id));

                numOfReplies = Number(replies.rows[0].count);
            }

            newArr.push({ ...suggestion, totalCommentReplyNum: numOfComments + numOfReplies })
        }

        res.status(200).json(newArr);
    } catch (error) {
        res.status(500).json({ message: "An error occured" })
    }
}

const getCertainRoadmapFeedback = async (req, res) => {
    try {
        const suggestion = (await itemsPool.query("SELECT * FROM requests WHERE id = $1 AND status != $2", [req.params.id, 'suggestion'])).rows[0]

        const comments = (await itemsPool.query('SELECT * FROM comments WHERE request_id = $1', [req.params.id])).rows

        const comment_ids = comments.map(comment => comment.id);
        if (!comment_ids.length) return res.status(200).json({ suggestion, comments: [], replies: [] });

        const replies = (await itemsPool.query(`SELECT * FROM replies WHERE comment_id IN (${comment_ids.join(',')})`)).rows

        res.status(200).json({ suggestion, comments, replies });
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

const postSuggestion = async (req, res) => {
    const { title, category, upvotes, status, description } = req.body;
    try {
        const newSuggestion = await itemsPool.query('INSERT INTO requests (title, description, category, upvotes, status) VALUES ($1, $2, $3, $4, $5)', [title, description, category, upvotes, status]);
        res.status(201).json({ message: "Suggestion created successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

const postComment = async (req, res) => {
    const { content, user_image, user_name, nick_name, request_id } = req.body;
    try {
        const newComment = await itemsPool.query('INSERT INTO comments (content, user_image, user_name, nick_name, request_id) VALUES ($1, $2, $3, $4, $5)', [content, user_image, user_name, nick_name, request_id]);
        res.status(201).json({ message: "Comment created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const postReply = async (req, res) => {
    const { content, replyingTo, user_image, user_name, nick_name, comment_id } = req.body;
    try {
        const newReply = await itemsPool.query('INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6)', [content, replyingTo, user_image, user_name, nick_name, comment_id]);
        res.status(201).json({ message: "Reply created successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

const updateSuggestion = async (req, res) => {
    const { id, title, category, status, description } = req.body;
    try {
        const suggestion = await itemsPool.query('UPDATE requests SET title = $1, description = $2, category = $3, status = $4 WHERE id = $5', [title, description, category, status, id]);
        res.status(200).json({ message: "Suggestion updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
}

const deleteSuggestion = async (req, res) => {
    const { id } = req.body;
    try {
        const suggestion = await itemsPool.query('DELETE FROM requests WHERE id = $1', [id]);
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