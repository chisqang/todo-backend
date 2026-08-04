const express = require('express');
const pool = require('./config/db');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Todo API is running' });
});

// Route test kết nối database
app.get('/test-db', async(req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Kết nối database thành công!',
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi kết nối database',
            error: error.message
        });
    }
});

module.exports = app;