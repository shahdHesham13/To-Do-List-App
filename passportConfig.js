const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./db");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (email, password, done) => {
    console.log(email, password);
    pool.query(
      `SELECT * FROM users WHERE email = $1`, // Query to check if the user exists
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0]; // Retrieve the user object from the database

          // Compare the plain text password with the hashed password from the database
          bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
              console.log(err);
            }

            if (isMatch) {
              return done(null, user); // User authenticated successfully
            } else {
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          // No user found with the given email
          return done(null, false, {
            message: "No user with that email address",
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" }, // Match form fields
      authenticateUser // Handler
    )
  );

  // Serialize the user (store user_id in the session)
  passport.serializeUser((user, done) => {
    done(null, user.user_id); // Use user_id from the database
  });

  // Deserialize the user (fetch user details using user_id)
  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM users WHERE user_id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      if (results.rows.length > 0) {
        console.log(`Deserialized user_id: ${results.rows[0].user_id}`);
        return done(null, results.rows[0]); // Pass the user object to req.user
      } else {
        return done(new Error("User not found"));
      }
    });
  });
}
module.exports = initialize;