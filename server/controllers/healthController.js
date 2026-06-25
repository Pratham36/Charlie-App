import HealthRecord from '../models/HealthRecord.js';

const getOrCreate = async (userId) => {
  let record = await HealthRecord.findOne();
  if (!record) record = await HealthRecord.create({ updatedBy: userId });
  return record;
};

// @GET /api/health
export const getHealthRecord = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/health/vaccine
export const addVaccine = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    record.vaccines.push(req.body);
    record.updatedBy = req.user._id;
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/health/vaccine/:id
export const updateVaccine = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    const vaccine = record.vaccines.id(req.params.id);
    if (!vaccine) return res.status(404).json({ message: 'Vaccine not found' });
    Object.assign(vaccine, req.body);
    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/health/vaccine/:id
export const deleteVaccine = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    record.vaccines.pull(req.params.id);
    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/health/deworming
export const addDeworming = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    record.deworming.push(req.body);
    record.updatedBy = req.user._id;
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/health/medicine
export const addMedicine = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    record.medicines.push(req.body);
    record.updatedBy = req.user._id;
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/health/medicine/:id
export const updateMedicine = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    const medicine = record.medicines.id(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    Object.assign(medicine, req.body);
    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/health/milestone
export const addMilestone = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    record.milestones.push(req.body);
    record.milestones.sort((a, b) => new Date(b.date) - new Date(a.date));
    record.updatedBy = req.user._id;
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/health/milestone/:id
export const deleteMilestone = async (req, res) => {
  try {
    const record = await getOrCreate(req.user._id);
    record.milestones.pull(req.params.id);
    await record.save();
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
