const pool = require('../config/db');

//Tạo task mới 
const createTask = async(req, res) => {
    try {
        const { title, description, deadline, priority, category_id } = req.body;
        const user_id = req.user.id; // Lấy user_id từ thông tin người dùng đã xác thực
        if (!title) {
            return res.status(400).json({ error: 'Tiêu đề không được để trống' });
        }

        const newTask = await pool.query(
            'INSERT INTO tasks (title, description, deadline, priority, category_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [title, description, deadline, priority || 'MEDIUM', category_id, user_id]
        );
        res.status(201).json({ message: 'Tạo task thành công', task: newTask.rows[0] });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const getTasks = async(req, res) => {
    try {
        const user_id = req.user.id;
        const { status, priority, category_id, page = 1, limit = 10 } = req.query;

        let query = 'SELECT * FROM tasks WHERE user_id = $1';
        let params = [user_id];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            params.push(status);
        }

        if (priority) {
            paramCount++;
            query += ` AND priority = $${paramCount}`;
            params.push(priority);
        }

        if (category_id) {
            paramCount++;
            query += ` AND category_id = $${paramCount}`;
            params.push(category_id);
        }

        query += ` ORDER BY created_at DESC `;

        //Phân trang
        const offset = (page - 1) * limit;
        paramCount++;
        query += ` LIMIT $${paramCount} `;
        params.push(limit);
        paramCount++;
        query += ` OFFSET $${paramCount} `;
        params.push(offset);

        const result = await pool.query(query, params);

        res.json({
            message: 'Lấy danh sách task thành công',
            tasks: result.rows,
            page: parseInt(page),
            total: result.rowCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy chi tiết 1 task
const getTaskById = async(req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy task' });
        }

        res.json({ task: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật task
const updateTask = async(req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { title, description, deadline, priority, category_id } = req.body;

        // Kiểm tra task có tồn tại và thuộc về user không
        const existing = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, user_id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy task' });
        }

        const updatedTask = await pool.query(
            `UPDATE tasks 
       SET title = $1, description = $2, deadline = $3, 
           priority = $4, category_id = $5, updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`, [
                title || existing.rows[0].title,
                description || existing.rows[0].description,
                deadline || existing.rows[0].deadline,
                priority || existing.rows[0].priority,
                category_id || existing.rows[0].category_id,
                id,
                user_id,
            ]
        );

        res.json({
            message: 'Cập nhật task thành công',
            task: updatedTask.rows[0],
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật trạng thái task
const updateTaskStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { status } = req.body;

        const validStatus = ['TODO', 'IN_PROGRESS', 'DONE'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                message: `Status không hợp lệ. Chỉ chấp nhận: ${validStatus.join(', ')}`
            });
        }

        const result = await pool.query(
            `UPDATE tasks SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`, [status, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy task' });
        }

        res.json({
            message: 'Cập nhật trạng thái thành công',
            task: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Xóa task
const deleteTask = async(req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy task' });
        }

        res.json({ message: 'Xóa task thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, updateTaskStatus, deleteTask };