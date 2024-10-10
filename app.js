
require('dotenv').config();
require("express-async-errors");
const cors = require('cors')

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/mongodb/connect');
const errorHandler = require('./Middlewares/errorHandler');
const notFound = require('./Middlewares/notFound');
const UserAuth = require('./Routes/User');
const app = express();

app.use(cors())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// routes
app.use('/api/v1/auth',UserAuth)

app.use(errorHandler);
app.use(notFound);

const start = async () => {
    try {
        await connectDB(process.env.CONNECTION_STRING);
        app.listen(process.env.PORT || 4500 ,() => {
            console.log(`the app running successufully on Port ${process.env.PORT}`);
        });
    } catch (error) {
        HandleError()
        console.log(error.error)
    }
}


start();