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

// database
//let users = [];
//let tasks = [];
//let taskId = 1; 

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
router.post('/', (req, res) => {
    const { title, description, dueDate, status } = req.body;

    // Check if all required fields are provided
    if (!title || !description || !dueDate || !status) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const now = new Date(); // Get the current timestamp
    // Add a new task to the simulated database with timestamps
    const newTask = {
        id: taskId++, // Increment the task ID
        title,
        description,
        dueDate,
        status,
        createdAt: now,
        updatedAt: now,
    };

    tasks.push(newTask);
    res.redirect('/tasks');
    //res.status(201).json({ message: 'Task created successfully!', task: newTask });
});



// Get all tasks
router.get('/', (req, res) => {
    const { status, dueDate } = req.query; // Extract query parameters
    let filteredTasks = tasks;

    res.render('tasks', { tasks }); 

    const userTasks = tasks.filter((task) => task.userId === req.user.id);
    //res.json(userTasks);

    // Filter tasks by status if provided
    if (status) {
        filteredTasks = filteredTasks.filter((task) => task.status === status);
    }

    // Filter tasks by due date if provided
    if (dueDate) {
        filteredTasks = filteredTasks.filter((task) => task.dueDate === dueDate);
    }

    res.json(filteredTasks); // Return the filtered tasks
});

// Update a task
router.put('/:id', (req, res) => {
    const { id } = req.params; // Extract the task ID from the route
    const { title, description, dueDate, status } = req.body;

    // Find the task by ID
    const task = tasks.find((t) => t.id === parseInt(id));

    if (!task) {
        return res.status(404).json({ message: 'Task not found!' });
    }
    
    // Update task fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    task.updatedAt = new Date(); // Update the timestamp
    res.redirect('/tasks');
    //res.json({ message: 'Task updated successfully!', task });
});

// Delete a task
router.delete('/:id', (req, res) => {
    const { id } = req.params; // Extract the task ID from the route

    // Find the index of the task to delete
    const taskIndex = tasks.findIndex((t) => t.id === parseInt(id));

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found!' });
    }
    res.redirect('/tasks');
    tasks.splice(taskIndex, 1); // Remove the task from the array
    //res.json({ message: 'Task deleted successfully!' });
});

router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
});


module.exports = router;