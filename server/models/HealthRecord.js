import mongoose from 'mongoose';

const vaccineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  nextDueDate: Date,
  batchNo: String,
  vet: String,
  notes: String,
  weightAtTime: Number,
});

const dewormingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  medicine: String,
  dose: String,
  nextDueDate: Date,
  notes: String,
});

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  dose: String,
  frequency: String,
  reason: String,
  completed: { type: Boolean, default: false },
  notes: String,
});

const milestoneSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['health', 'training', 'behavior', 'growth', 'other'],
    default: 'other'
  },
});

const healthRecordSchema = new mongoose.Schema({
  vaccines: [vaccineSchema],
  deworming: [dewormingSchema],
  medicines: [medicineSchema],
  milestones: [milestoneSchema],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('HealthRecord', healthRecordSchema);
