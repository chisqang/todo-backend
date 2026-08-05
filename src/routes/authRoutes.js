const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// Route test middleware
router.get('/me', authMiddleware, (req, res) => {
    res.json({ message: 'Bạn đã xác thực thành công!', user: req.user });
});

module.exports = router;