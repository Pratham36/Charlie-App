import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },

  // Meals
  meals: [{
    time: String,
    food: String,
    amount: Number, // in grams
    ate: { type: Boolean, default: true },
    notes: String,
  }],

  // Potty
  pottyLogs: [{
    time: String,
    type: { type: String, enum: ['pee', 'poop', 'both'] },
    location: { type: String, enum: ['balcony', 'outdoor', 'wrong_spot'] },
    notes: String,
  }],

  // Training sessions
  trainingSessions: [{
    time: String,
    duration: Number, // minutes
    commands: [{
      name: String,
      accuracy: Number, // percentage 0-100
      notes: String,
    }],
    notes: String,
  }],

  // Health
  health: {
    energy: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
    stoolConsistency: { type: String, enum: ['firm', 'medium', 'soft', 'liquid'], default: 'firm' },
    vomiting: { type: Boolean, default: false },
    appetite: { type: String, enum: ['good', 'reduced', 'refused'], default: 'good' },
    notes: String,
  },

  // Weight (optional, not daily)
  weight: Number,

  // General notes
  notes: String,

  // Photos (Google Drive IDs)
  photos: [{
    driveId: String,
    driveUrl: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now },
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Index for date queries
dailyLogSchema.index({ date: -1 });

export default mongoose.model('DailyLog', dailyLogSchema);
