# To-Do List App

### **Introduction**

This document walks you through the structure of the To-Do List web application for managing user registration, login, and tasks. It consists of a backend implemented with Node.js, Express, and PostgreSQL, and a frontend using EJS templates for dynamic rendering of views.



### **Project Features**

1. **User Authentication**:
    - Allows users to create accounts and login with validation and secure password hashing.
    - With session management ensures that only authorized users can access their tasks, providing a personalized and secure experience.
1. **Task Management**:
    - Create, read, update, and delete (CRUD) tasks.
    - Tasks include a title, description, due date, and status.
    - Tasks are user-specific.
2. **Database Integration**:
    - Persistent storage using PostgreSQL for tasks and user data. 
3. **Responsive Design**:
    - A visually appealing UI built using CSS and EJS templates.
4. **Error Handling**:
    - Server-side and client-side error handling for a smoother user experience.

#

### **Tools and Technologies Used**

#### **Backend**

- **Node.js**: The runtime environment for JavaScript on the server side.
- **Express.js**: A minimal framework for building web applications, managing routes, and middleware.
- **Passport.js**: Used for user authentication and session management.
- **bcrypt**: Library for hashing passwords securely.
- **Method-Override**: Enables support for HTTP methods like PUT and DELETE through forms.
- **PG (node-postgres)**: PostgreSQL client for Node.js to interact with the database.
- **express-session**: Middleware to maintain user sessions.
- **express-flash**: Middleware for displaying flash messages.
- **Path Module**: Used for file and directory path handling.

#### **Frontend**

- **EJS (Embedded JavaScript)**: Template engine for dynamically rendering views with server-side data.
- **CSS**: For styling the application and creating a responsive design.

#### **Database**

- **PostgreSQL**: Relational database to store user and task information.


#

### **Project Structure**

#### **1. Setting Up the Backend**

- **Initialize the Project**:
    
    ```bash
    npm init -y
    npm install express pg ejs passport passport-local express-session method-override connect-flash
    ```
    
- **Database Setup**: Create a PostgreSQL database with two tables:
    
    ```sql
    CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    
    CREATE TABLE tasks (
        task_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
    
- **Database Connection**: The `db.js` file sets up the connection to the PostgreSQL database using a connection pool. It uses environment variables `.env` to securely store credentials and differentiate between production and development environments.
    
 ```javascript
require("dotenv").config();
const { Pool } = require("pg");
const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.user}:${process.env.password}@${process.env.host}:${process.env.port}/${process.env.database}`;

const pool = new Pool({
 connectionString: isProduction ? process.env.DATABASE_URL : connectionString, ssl: isProduction });
 
module.exports = { pool };
```
    

#### **2. Authentication with Passport.js**

- Configure Passport to handle user authentication:
    - Serialize and deserialize users.
    - Use a local strategy for verifying credentials.
- Protect routes using middleware to ensure only authenticated users can access certain pages.

#### **3. Middleware Setup**

- Parse incoming requests with `express.urlencoded` and `express.json`.
- Serve static files using `express.static(views)`.
- Override HTTP methods using `method-override`.
- `express-session`: Manages user sessions securely.
- `ejs`: Sets EJS as the view engine for rendering templates.

#### **4. Building the Routes**

- **Tasks Routes**:
``` javascript
app.use('/tasks', tasksRoute);
```

- Delegates routes under `/tasks` to the `tasksRoute` module.
    - `GET /tasks`: Fetch tasks for the logged-in user and render the `tasks.ejs` view.
    - `POST /tasks`: Add a new task to the database associated with the logged-in user using `req.user.user_id`.
    - `PUT /tasks/:id`: Update an existing task (the status to mark as completed).
    - `DELETE /tasks/:id`: Delete a task from the database.

- **Auth Routes**:
- Hashes passwords using `bcrypt`.
- `checkAuthenticated`: Redirects authenticated users to the dashboard.
- `checkNotAuthenticated`: Ensures only authenticated users access certain routes.
    - `POST /users/register`: Register a new user.
    - `POST /users/login`: Log in an existing user.
    - `GET /users/logout`: Log out the user and destroy the session.

#### **5. Protecting Routes**

-  Middleware to control access based on authentication status.

```javascript
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users/dashboard");
    }
    next();
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}
```

#### **6. Frontend with EJS**

- Use EJS templates to dynamically render views.
- Include Bootstrap or custom CSS for styling.
- Create separate views for tasks, login, and registration.

#### **7. Styling the Application**

- Add a `styles.css` file in the `views` folder for global styles.

#

### **Additional Features to Consider in the Future**

- **Search and Filter Tasks**: Allow users to search for tasks or filter them by status (e.g., completed, pending).
- **Priority Levels**: Add a `priority` column to tasks and allow users to sort tasks by priority.
- **Notifications**: Use a library like `node-cron` to send email reminders for upcoming tasks.
- **RESTful API**: Expose an API endpoint to interact with tasks programmatically.
