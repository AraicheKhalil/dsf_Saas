const mongoose = require('mongoose');
// Replace with your actual details from the Azure portal


const connectDB = (url,username,password) => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        auth: {
            user: username,
            password: password
          }
    }).then(() => {
        console.log('connected to db');
    }).catch ((err) => console.log(err))
}

module.exports = connectDB;