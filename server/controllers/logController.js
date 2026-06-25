import DailyLog from '../models/DailyLog.js';

// @GET /api/logs
export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DailyLog.find(query)
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DailyLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/logs/today
export const getTodayLog = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let log = await DailyLog.findOne({
      date: { $gte: today, $lt: tomorrow }
    }).populate('createdBy', 'name');

    if (!log) {
      log = await DailyLog.create({
        date: new Date(),
        createdBy: req.user._id,
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/logs/:id
export const getLog = async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id).populate('createdBy', 'name');
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/logs
export const createLog = async (req, res) => {
  try {
    const log = await DailyLog.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/logs/:id
export const updateLog = async (req, res) => {
  try {
    const log = await DailyLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/logs/:id
export const deleteLog = async (req, res) => {
  try {
    const log = await DailyLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/logs/stats/summary
export const getStatsSummary = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const logs = await DailyLog.find({ date: { $gte: last7Days } });

    const summary = {
      totalLogs: logs.length,
      avgWeight: 0,
      pottyAccuracy: { balcony: 0, outdoor: 0, wrong: 0, total: 0 },
      meals: { total: 0, refused: 0 },
    };

    let weightCount = 0;
    logs.forEach(log => {
      if (log.weight) { summary.avgWeight += log.weight; weightCount++; }
      log.pottyLogs?.forEach(p => {
        summary.pottyAccuracy.total++;
        if (p.location === 'balcony') summary.pottyAccuracy.balcony++;
        else if (p.location === 'outdoor') summary.pottyAccuracy.outdoor++;
        else summary.pottyAccuracy.wrong++;
      });
      log.meals?.forEach(m => {
        summary.meals.total++;
        if (!m.ate) summary.meals.refused++;
      });
    });

    if (weightCount > 0) summary.avgWeight = (summary.avgWeight / weightCount).toFixed(1);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
