const express = require('express');
const app = express();
const { PORT } = require('./config');
const tasksRoute = require('./routes/tasksRoute.js');
const path = require('path');
const db = require('./db');
const {pool} = require("./db")
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const initializePassport = require("./passportConfig");
const methodOverride = require('method-override');


initializePassport(passport);

// Middleware
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(
    session({
      // Key we want to keep secret which will encrypt all of our information
      secret: process.env.SESSION_SECRET,
      // Should we resave our session variables if nothing has changes which we dont
      resave: false,
      // Save empty value if there is no vaue which we do not want to do
      saveUninitialized: false
    }));
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());
app.use("/tasks", tasksRoute);

app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render("index");
});
app.get("/users/register", checkAuthenticated, (req, res) => {
    res.render("register");
})
app.get("/users/login", checkAuthenticated, (req, res) => {
    res.render("login");
})
app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard", {user: req.user.username})
})

app.get("/users/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success_msg', "You have logged out");
    res.redirect("/users/login");
  });
});

app.post("/users/register", async  (req, res) => {
    let {name, email, password, password2 } = req.body;
    console.log({ name, email, password, password2 });
      
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ message: "Enter all fields to continue" });
      }
    
      if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
      }
    
      if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
      }

      
      if (errors.length > 0) {
        res.render("register", { errors, name, email, password, password2 });
      } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        
        pool.query(
          `SELECT * FROM users
            WHERE email = $1`,
          [email],
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log(results.rows);
    
            if (results.rows.length > 0) {
              return res.render("register", {
                message: "Email already registered"
              });
            } else {
              pool.query( `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)
                          RETURNING user_id, password_hash`,
                [name, email, hashedPassword],
                (err, results) => {
                  
                    if (err) {
                    throw err;
                  }
                  console.log(results.rows);
                  req.flash("success_msg", "You are now registered. Please log in");
                  res.redirect("/users/login");
                }
              );
            }
          }
        );
      }
    
});

/*app.post("/users/login", passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);*/

// Login route
app.post("/users/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Protect routes
/*function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}*/
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


// Redirect to tasks page after login
app.get('/tasks', (req, res) => {
  res.redirect('/tasks');
});

// Routes
app.use('/tasks', tasksRoute);

// Server
app.listen(3000, () => {
    console.log(`Server is running on PORT ${3000}`);
});