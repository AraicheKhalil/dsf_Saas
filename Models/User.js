const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator')
const secret = process.env.JWT_SECRET
const lifetime = process.env.JWT_LIFETIME 
const UnauthenticatedError = require('../Errors/unauthenticated')

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "The First Name must be Provided"],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, "The Last Name must be Provided"],
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate : [isEmail , "Please, Entre The Correct email"],
  },
  password: {
    type: String,
    minlength : 8,
  },
  role: {
    type: String,
    enum: ['admin', 'contributor'],
    default: 'admin',
  },
  type: {
    type: String,
    enum: ['pro', 'enterprise'],
    required: [true, "The Application Type is So Important"],
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null, // Only for Enterprise users
  },
  stripe_customer_id: {
    type: String,
    default: null, // Set by Stripe for both Pro and Enterprise users
  },
  created_at: {
    type: Date,
    default: Date.now,
    immutable: true, 
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
});

// Best Practice: Index for email for fast lookups
userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role, type: this.type },
    secret,
    { expiresIn: lifetime }
  );
};

userSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: Date.now() });
  next();
});


userSchema.statics.login = async function(email,password){
  const user = await this.findOne({email})
  if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth){
          return user;
      }
      throw new UnauthenticatedError("This Password is Uncorecct ");
  }
  throw new UnauthenticatedError("invalid Credential, Please try again");
}



module.exports = mongoose.model('User', userSchema);







