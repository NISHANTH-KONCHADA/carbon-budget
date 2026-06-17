const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DEFAULT_DAILY_BUDGET_KG } = require('../utils/emissionFactors');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    region: {
      type: String,
      enum: ['IN', 'US', 'EU', 'GLOBAL'],
      default: 'IN',
    },
    dailyBudgetKg: {
      type: Number,
      default: DEFAULT_DAILY_BUDGET_KG,
      min: 0.1,
    },
    streak: {
      count: { type: Number, default: 0 },
      lastLogDate: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    region: this.region,
    dailyBudgetKg: this.dailyBudgetKg,
    streak: this.streak,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
