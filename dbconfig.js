const { Pool } = require('pg');
const itemsPool = new Pool({
    connectionString: process.env.DATABASE_STR,
    ssl: {
        rejectUnauthorized: false
    }
});
module.exports = itemsPool;
