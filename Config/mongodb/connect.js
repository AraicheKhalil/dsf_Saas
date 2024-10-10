const mongoose = require('mongoose');

const connectDB = (url) => {
    mongoose.connect(url).then(() => {
        console.log('connected to db');
    }).catch ((err) => console.log(err))
}

module.exports = connectDB;