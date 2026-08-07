const express = require('express');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes'); // thêm dòng này

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Todo API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); // thêm dòng này

module.exports = app;