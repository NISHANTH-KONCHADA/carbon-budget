const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['transport', 'electricity', 'food', 'waste', 'shopping'],
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    co2eKg: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      maxlength: 280,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
