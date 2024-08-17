require('dotenv').config();
const cors = require('cors');
const express = require('express');
const userRoute = require("./routes/user");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middleware/auth');
const path = require("path");

const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
    origin: 'http://localhost:3000', 
    credentials: true, 
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.resolve('./public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json()); 


app.use(checkForAuthenticationCookie("token"));

app.get("/", async (req, res) => {
    res.json("You are ready to start");
});

app.use("/users", userRoute);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


