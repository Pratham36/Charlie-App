import TrainingProfile from '../models/TrainingProfile.js';

const getOrCreate = async (userId) => {
  let profile = await TrainingProfile.findOne();
  if (!profile) {
    profile = await TrainingProfile.create({
      updatedBy: userId,
      commands: [
        { name: 'Sit', signal: 'Flat hand moving down', status: 'solid' },
        { name: 'Come', signal: 'Crouch + open arms', status: 'solid' },
        { name: 'Wait', signal: 'One finger up', status: 'progressing' },
        { name: 'Stay', signal: 'Open palm (stop sign)', status: 'progressing' },
        { name: 'Look', signal: '2 fingers → eyes', status: 'learning' },
        { name: 'No Bite', signal: 'OW + dead hand', status: 'learning' },
        { name: 'Heel', signal: 'Tap left thigh', status: 'not_started' },
        { name: 'Bed/Place', signal: 'Point to bed', status: 'learning' },
        { name: 'Chal', signal: 'Walk command', status: 'progressing' },
      ],
    });
  }
  return profile;
};

// @GET /api/training
export const getTrainingProfile = async (req, res) => {
  try {
    const profile = await getOrCreate(req.user._id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/training/command/:id
export const updateCommand = async (req, res) => {
  try {
    const profile = await getOrCreate(req.user._id);
    const command = profile.commands.id(req.params.id);
    if (!command) return res.status(404).json({ message: 'Command not found' });
    Object.assign(command, req.body);
    profile.updatedBy = req.user._id;
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/training/command
export const addCommand = async (req, res) => {
  try {
    const profile = await getOrCreate(req.user._id);
    profile.commands.push(req.body);
    profile.updatedBy = req.user._id;
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/training
export const updateProfile = async (req, res) => {
  try {
    const profile = await getOrCreate(req.user._id);
    const { currentPhase, phaseDescription, weeklyGoals, notes } = req.body;
    if (currentPhase !== undefined) profile.currentPhase = currentPhase;
    if (phaseDescription) profile.phaseDescription = phaseDescription;
    if (weeklyGoals) profile.weeklyGoals = weeklyGoals;
    if (notes) profile.notes = notes;
    profile.updatedBy = req.user._id;
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
