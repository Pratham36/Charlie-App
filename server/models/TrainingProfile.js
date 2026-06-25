import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  signal: String,
  accuracyWithFood: { type: Number, default: 0, min: 0, max: 100 },
  accuracyWithoutFood: { type: Number, default: 0, min: 0, max: 100 },
  accuracyHighExcitement: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['not_started', 'learning', 'progressing', 'solid', 'mastered'],
    default: 'not_started'
  },
  notes: String,
  startedDate: Date,
  masteredDate: Date,
});

const trainingProfileSchema = new mongoose.Schema({
  commands: [commandSchema],
  currentPhase: { type: Number, default: 1 },
  phaseDescription: String,
  weeklyGoals: [String],
  notes: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('TrainingProfile', trainingProfileSchema);
