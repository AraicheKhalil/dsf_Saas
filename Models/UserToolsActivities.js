// const mongoose = require('mongoose');

// const activitySchema = new mongoose.Schema({
//   toolCategory: {
//     type: String,
//     enum: ['SmartDoc', 'GenAI'],
//     required: true,
//   },
//   toolType: {
//     type: String,
//     required: true,
//   },
//   submissions: {
//     type: Number,
//     default: 0,
//   },
// });

// const userActivitiesSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   activities: [activitySchema],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('UserActivities', userActivitiesSchema);



const mongoose = require('mongoose');

// Schema for individual tool activities
const activitySchema = new mongoose.Schema({
  toolType: {
    type: String,
    required: true,
  },
  submissions: {
    type: Number,
    default: 0,
  },
});

// Schema for tracking user activities for SmartDoc and GenAI
const userActivitiesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  SmartDoc: {
    type: [activitySchema], // Nested document for SmartDoc activities
    default: [],
  },
  GenAI: {
    type: [activitySchema], // Nested document for GenAI activities
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserActivities', userActivitiesSchema);
