const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const { createObjectCsvWriter } = require("csv-writer");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const FILE = "feedback.csv";

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

app.post("/submit-feedback", (req, res) => {
    const { name, email, rating, comments } = req.body;

    if (!name || !email || !rating) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating value" });
    }

    const csvWriter = createObjectCsvWriter({
        path: FILE,
        header: [
            { id: "name", title: "Name" },
            { id: "email", title: "Email" },
            { id: "rating", title: "Rating" },
            { id: "comments", title: "Comments" },
            { id: "date", title: "Date" }
        ],
        append: fs.existsSync(FILE)
    });

    const record = [{
        name,
        email,
        rating,
        comments: comments || "",
        date: new Date().toLocaleString()
    }];

    csvWriter.writeRecords(record)
        .then(() => {
            res.json({ message: "Feedback saved successfully" });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});