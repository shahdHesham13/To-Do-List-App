const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Middleware to check if the user is authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login"); // Redirect to login if not authenticated
}

// Protect all task routes
router.use(checkAuthenticated);

// User Registration
/*router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Check if all required fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const now = new Date(); // Get the current timestamp
    // Add a new user to the simulated database with timestamps
    users.push({
        username,
        email,
        password,
        createdAt: now,
        updatedAt: now,
    });

    res.status(201).json({ message: 'User registered successfully!' });
});*/

// User Login
/*router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user by username and password
    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials!' });
    }

    res.json({ message: 'Login successful!' });
});*/

// Create a new task
router.post('/', async (req, res) => {
    const { title, description, dueDate, status } = req.body;

    // Check if all required fields are provided
    if (!title || !description || !dueDate || !status) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    //const now = new Date(); // Get the current timestamp
    try {
        const now = new Date();
        const userId = req.user.user_id; // Assuming user ID is stored in the session
        await pool.query(
            `INSERT INTO tasks (title, description, due_date, status, user_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [title, description, dueDate, status, userId, now, now]
        );
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while creating task!' });
    }

});

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await pool.query(
            `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        res.render('tasks', { user: req.user.username, tasks: result.rows });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching tasks!' });
    }
});

// Update a task
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Extract the task ID from the route
    const { title, description, dueDate, status } = req.body;

    try {
        const now = new Date();
        await pool.query(
            `UPDATE tasks
            SET status = $1, updated_at = $2
            WHERE task_id = $3 AND user_id = $4`,
            [status, now, id, req.user.user_id]
        );
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while updating task!' });
    }
});

// Delete a task
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Extract the task ID from the route

    try {
        await pool.query(
            `DELETE FROM tasks WHERE task_id = $1 AND user_id = $2`,
            [id, req.user.user_id]
        );
        res.redirect('/tasks');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while deleting task!' });
    }

});

router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
});


module.exports = router;