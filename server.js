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
        const data = await db.many('SELECT * FROM requests');
        const suggestions = data.filter(suggestion => suggestion.status === 'suggestion');
        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: "An error occured." })
    }
})