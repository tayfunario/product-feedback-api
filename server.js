const express = require('express');
const cors = require('cors');
const pgp = require('pg-promise')();
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
const db = pgp(process.env.DATABASE_STR);

app.listen(process.env.PORT, () => { console.log(`Server is running on port ${process.env.PORT}`) })

app.get('/suggestions', async (req, res) => {
    try {
        const data = await db.many("SELECT * FROM requests WHERE status = 'suggestion'");

        const newArr = []

        for (suggestion of data) {
            let numOfComments = 0
            let numOfReplies = 0

            const commentCount = await db.one('SELECT COUNT(*) FROM comments WHERE request_id = $1', suggestion.id)
            numOfComments = Number(commentCount.count);

            const comments = await db.manyOrNone('SELECT * FROM comments WHERE request_id = $1', suggestion.id);
            if (comments.length) {
                const replies = await db.oneOrNone('SELECT COUNT(*) FROM replies WHERE comment_id IN ($1:csv)', [comments.map(comment => comment.id)]);
                numOfReplies = Number(replies.count);
            }

            newArr.push({ ...suggestion, totalCommentReplyNum: numOfComments + numOfReplies })
        }

        res.status(200).json(newArr);
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
})

app.get('/suggestions/:id', async (req, res) => {
    try {
        const suggestion = await db.one("SELECT * FROM requests WHERE id = $1 AND status = $2", [req.params.id, 'suggestion']);

        const comments = await db.manyOrNone('SELECT * FROM comments WHERE request_id = $1', req.params.id);
        const comment_ids = comments.map(comment => comment.id);
        if (!comment_ids.length) return res.status(200).json({ suggestion, comments: [], replies: [] });

        const replies = await db.manyOrNone('SELECT * FROM replies WHERE comment_id IN ($1:csv)', [comment_ids]);
        res.status(200).json({ suggestion, comments, replies });
    } catch (error) {
        res.status(404).json({ message: "An error occured" })
    }
})

app.get('/suggestions/:id/edit', async (req, res) => {
    try {
        const suggestion = await db.one('SELECT * FROM requests WHERE id = $1 AND status = $2', [req.params.id, 'suggestion']);
        res.status(200).json(suggestion);
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
})

app.get('/roadmap', async (req, res) => {
    try {
        const data = await db.many("SELECT * FROM requests WHERE status != 'suggestion'");

        const newArr = []

        for (suggestion of data) {
            let numOfComments = 0
            let numOfReplies = 0

            const commentCount = await db.one('SELECT COUNT(*) FROM comments WHERE request_id = $1', suggestion.id)
            numOfComments = Number(commentCount.count);

            const comments = await db.manyOrNone('SELECT * FROM comments WHERE request_id = $1', suggestion.id);
            if (comments.length) {
                const replies = await db.oneOrNone('SELECT COUNT(*) FROM replies WHERE comment_id IN ($1:csv)', [comments.map(comment => comment.id)]);
                numOfReplies = Number(replies.count);
            }

            newArr.push({ ...suggestion, totalCommentReplyNum: numOfComments + numOfReplies })
        }

        res.status(200).json(newArr);
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
})

app.get('/roadmap/:id', async (req, res) => {
    try {
        const suggestion = await db.one("SELECT * FROM requests WHERE id = $1 AND status != $2", [req.params.id, 'suggestion']);

        const comments = await db.manyOrNone('SELECT * FROM comments WHERE request_id = $1', req.params.id);
        const comment_ids = comments.map(comment => comment.id);
        if (!comment_ids.length) return res.status(200).json({ suggestion, comments: [], replies: [] });

        const replies = await db.manyOrNone('SELECT * FROM replies WHERE comment_id IN ($1:csv)', [comment_ids]);
        res.status(200).json({ suggestion, comments, replies });
    } catch (error) {
        res.status(404).json({ message: "An error occured" })
    }
})

app.post("/suggestions", async (req, res) => {
    const { title, category, upvotes, status, description } = req.body;
    try {
        const newSuggestion = await db.one('INSERT INTO requests (title, description, category, upvotes, status) VALUES ($1, $2, $3, $4, $5)', [title, description, category, upvotes, status]);
        res.status(201).json({ message: "Suggestion created successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
})

app.patch("/suggestions/edit", async (req, res) => {
    const { id, title, category, status, description } = req.body;
    try {
        const suggestion = await db.one('UPDATE requests SET title = $1, description = $2, category = $3, status = $4 WHERE id = $5', [title, description, category, status, id]);
        res.status(200).json({ message: "Suggestion updated successfully", suggestion });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
})

app.delete("/suggestions/delete", async (req, res) => {
    const { id } = req.body;
    try {
        const suggestion = await db.one('DELETE FROM requests WHERE id = $1', id);
        res.status(200).json({ message: "Suggestion deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
})