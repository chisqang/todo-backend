const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Lấy token từ header: Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
    }

    const token = authHeader.split(' ')[1]; // tách chữ "Bearer" ra khỏi token

    if (!token) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    try {
        // Giải mã token, lấy thông tin user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // gắn thông tin user vào request để dùng ở các bước sau
        next(); // cho phép đi tiếp
    } catch (error) {
        console.log('JWT Error:', error.message); // thêm dòng này
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

};

module.exports = authMiddleware;