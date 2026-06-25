import { useState, useEffect } from 'react';
import { trainingAPI } from '../api/index.js';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  not_started: 'badge-red',
  learning: 'badge-amber',
  progressing: 'badge-blue',
  solid: 'badge-green',
  mastered: 'bg-purple-100 text-purple-800 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
};

const STATUS_LABELS = {
  not_started: 'Not Started',
  learning: 'Learning',
  progressing: 'Progressing',
  solid: 'Solid',
  mastered: 'Mastered',
};

export default function TrainingPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    trainingAPI.get()
      .then(res => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (cmd) => {
    setEditing(cmd._id);
    setEditForm({
      accuracyWithFood: cmd.accuracyWithFood,
      accuracyWithoutFood: cmd.accuracyWithoutFood,
      accuracyHighExcitement: cmd.accuracyHighExcitement,
      status: cmd.status,
      notes: cmd.notes || '',
    });
  };

  const saveEdit = async (cmdId) => {
    try {
      const res = await trainingAPI.updateCommand(cmdId, editForm);
      setProfile(res.data);
      setEditing(null);
      toast.success('Command updated ✅');
    } catch {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="text-charlie-amber font-mono animate-pulse">Loading training data...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charlie-ink">Training</h1>
          <p className="text-gray-500 text-sm mt-1">Phase {profile?.currentPhase} — {profile?.phaseDescription || 'Foundation Training'}</p>
        </div>
      </div>

      {/* Commands */}
      <div className="space-y-4">
        {profile?.commands?.map(cmd => (
          <div key={cmd._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-charlie-ink">{cmd.name}</h3>
                <span className={STATUS_COLORS[cmd.status]}>{STATUS_LABELS[cmd.status]}</span>
              </div>
              <button
                onClick={() => editing === cmd._id ? saveEdit(cmd._id) : startEdit(cmd)}
                className={editing === cmd._id ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
              >
                {editing === cmd._id ? 'Save' : 'Edit'}
              </button>
            </div>

            {cmd.signal && (
              <p className="text-xs font-mono text-gray-400 mb-4">Signal: {cmd.signal}</p>
            )}

            {editing === cmd._id ? (
              <div className="space-y-4">
                <AccuracySlider
                  label="With Food"
                  value={editForm.accuracyWithFood}
                  onChange={v => setEditForm(f => ({ ...f, accuracyWithFood: v }))}
                />
                <AccuracySlider
                  label="Without Food"
                  value={editForm.accuracyWithoutFood}
                  onChange={v => setEditForm(f => ({ ...f, accuracyWithoutFood: v }))}
                />
                <AccuracySlider
                  label="High Excitement"
                  value={editForm.accuracyHighExcitement}
                  onChange={v => setEditForm(f => ({ ...f, accuracyHighExcitement: v }))}
                />
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  >
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    className="input resize-none"
                    rows={2}
                    value={editForm.notes}
                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any observations..."
                  />
                </div>
                <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>
              </div>
            ) : (
              <div className="space-y-3">
                <AccuracyBar label="With Food" value={cmd.accuracyWithFood} color="green" />
                <AccuracyBar label="Without Food" value={cmd.accuracyWithoutFood} color="amber" />
                <AccuracyBar label="High Excitement" value={cmd.accuracyHighExcitement} color="blue" />
                {cmd.notes && <p className="text-xs text-gray-400 mt-2">{cmd.notes}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AccuracyBar({ label, value, color }) {
  const colors = {
    green: 'bg-green-500',
    amber: 'bg-charlie-amber',
    blue: 'bg-blue-500',
  };
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-mono font-bold text-charlie-ink">{value || 0}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full progress-bar ${colors[color]}`}
          style={{ width: `${value || 0}%` }}
        />
      </div>
    </div>
  );
}

function AccuracySlider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono font-bold text-charlie-amber">{value || 0}%</span>
      </div>
      <input
        type="range"
        min="0" max="100" step="5"
        value={value || 0}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-charlie-amber"
      />
    </div>
  );
}
