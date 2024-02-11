const itemsPool = require('../dbconfig');

const getAllItemsWithNumOfCommentsReplies = async (negative) => {
    const data = (await itemsPool.query(`SELECT * FROM requests WHERE status ${negative ? "!=" : "="} 'suggestion'`)).rows

    const newArr = []

    for (suggestion of data) {
        let numOfComments = 0
        let numOfReplies = 0

        const commentCount = (await itemsPool.query('SELECT COUNT(*) FROM comments WHERE request_id = $1', [suggestion.id])).rows[0]

        numOfComments = Number(commentCount.count);

        const comments = await itemsPool.query('SELECT * FROM comments WHERE request_id = $1', [suggestion.id]);

        // If there are comments, get the number of replies for each comment
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

    return newArr;
}

const getCertainItem = async (negative, id) => {
    const suggestion = (await itemsPool.query(`SELECT * FROM requests WHERE id = ${id} AND status ${negative ? "!=" : "="} 'suggestion'`)).rows[0];

    const comments = (await itemsPool.query(`SELECT * FROM comments WHERE request_id = ${id}`)).rows

    const comment_ids = comments.map(comment => comment.id);
    if (!comment_ids.length) return { suggestion, comments: [], replies: [] }

    const replies = (await itemsPool.query(`SELECT * FROM replies WHERE comment_id IN (${comment_ids.join(',')})`)).rows

    return { suggestion, comments, replies };
}

const getCertainItemWithoutComments = async (id) => {
    const suggestion = (await itemsPool.query(`SELECT * FROM requests WHERE id = ${id} AND status = 'suggestion'`)).rows[0];

    return suggestion;
}

const postEntity = async (tableName, reqBody) => {
    let keys

    if (tableName === 'requests') {
        keys = "(title, category, upvotes, status, description)"
    } else if (tableName === 'comments') {
        keys = "(content, user_image, user_name, nick_name, request_id)"
    } else if (tableName === 'replies') {
        keys = ""
    }

    let queryValues = Object.keys(reqBody).map(key => reqBody[key]);
    queryValues = queryValues.map(value => typeof value === 'string' ? `'${value}'` : value).join(', ')

    const newEntity = await itemsPool.query(`INSERT INTO ${tableName} ${keys} VALUES (${queryValues})`);
}

const updateEntity = async (reqBody) => {
    const { id, title, category, status, description } = reqBody;

    const newEntity = await itemsPool.query("UPDATE requests SET title = $1, description = $2, category = $3, status = $4 WHERE id = $5", [title, description, category, status, id]);
}

const deleteEntity = async (id) => {
    await itemsPool.query(`DELETE FROM requests WHERE id = ${id}`);
}

module.exports = {
    getAllItemsWithNumOfCommentsReplies,
    getCertainItem,
    getCertainItemWithoutComments,
    postEntity,
    updateEntity,
    deleteEntity
}