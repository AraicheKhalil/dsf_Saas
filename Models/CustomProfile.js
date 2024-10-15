const mongoose = require('mongoose');


const CustomProfileSchema = new mongoose.Schema({
    
  }, {
    timestamps: true 
  });
  
  module.exports = mongoose.model('CustomProfile', CustomProfileSchema);
  

