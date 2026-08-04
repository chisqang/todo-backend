const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async(req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra xem tất cả các trường đều được điền đầy đủ
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu thông tin người dùng vào cơ sở dữ liệu
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at', [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'Đăng ký thành công', user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // So sánh password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo token JWT
        const token = jwt.sign({ id: user.id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { register, login };