const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",               // Change if needed
    password: "janmejay1234",    // Change if needed
    database: "image_db"
});
db.connect((err) => {
    if (err) console.error("MySQL Connection Failed:", err);
    else console.log("Connected to MySQL");
});

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true })); // For URL-encoded bodies
app.use(express.json()); // For JSON bodies


// Configure Multer to store images in "public/uploads/"
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            res.send('Error registering');
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            res.send('Error logging in');
        } else if (result.length > 0) {
            loggedInUser = result[0]; // Store user information in loggedInUser
            res.redirect('/home');
        } else {
            res.send('Invalid credentials');
        }
    });
});

const isAuthenticated = (req, res, next) => {
    if (!loggedInUser) {
        res.redirect('/login');
    } else {
        next();
    }
};

app.get('/home', isAuthenticated, (req, res) => {
    res.render("home");
});
app.get('/logout', (req, res) => {
    loggedInUser = null; // Clear user information
    res.redirect('/');
});
app.get('/product', isAuthenticated, (req, res) => {
    res.render('product');
});

app.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin');
});
// Upload Image Route
app.post('/upload', isAuthenticated, upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.send("Please upload a file.");
    }
    const { title, price, description } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

    db.query("INSERT INTO images (image_path) VALUES (?, ?, ?, ?)", [title, price, description, imagePath], (err, result) => {
        if (err) throw err;
        res.redirect("/home");  // Redirect to gallery page after upload
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});