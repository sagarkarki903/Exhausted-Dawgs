const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db"); // your database connection

// Serialize and Deserialize user (for session management)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
        if (users.length > 0) {
            done(null, users[0]);
        } else {
            done(null, null);
        }
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // console.log(profile);

            const email = profile.emails[0].value;
            const username = profile.displayName.replace(/\s/g, "").toLowerCase(); // example username
            const firstname = profile.name.givenName;
            const lastname = profile.name.familyName;

            // Check if user already exists
            const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

            if (existingUser.length > 0) {
                return done(null, existingUser[0]);
            } else {
                // Create new user
                const [result] = await pool.query(
                    "INSERT INTO users (firstname, lastname, username, email, role) VALUES (?, ?, ?, ?, ?)",
                    [firstname, lastname, username, email, "Walker"] // Default role is Walker
                );
                const newUserId = result.insertId;
                const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [newUserId]);
                return done(null, newUser[0]);
            }
        } catch (error) {
            return done(error, null);
        }
    }
));