import { useState, useEffect } from 'react';
import { healthAPI } from '../api/index.js';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Plus, Trash2, Star } from 'lucide-react';

const ADOPTION_DATE = new Date('2026-03-31');

const CATEGORY_COLORS = {
  health: 'bg-red-100 text-red-700',
  training: 'bg-blue-100 text-blue-700',
  behavior: 'bg-purple-100 text-purple-700',
  growth: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

const HARDCODED_MILESTONES = [
  { date: '2026-03-31', title: 'Adoption Day', description: '1.7kg, scared but home 🏠', category: 'other' },
  { date: '2026-04-05', title: 'First Night Potty Signal', description: 'Woke up at 2:22 AM and signaled — ahead of schedule', category: 'behavior' },
  { date: '2026-04-07', title: 'Drinking Water Independently', description: 'No longer needs water mixed in food', category: 'health' },
  { date: '2026-04-08', title: 'First Vaccine', description: 'Vanguard DAPP·L4 — 1.7kg', category: 'health' },
  { date: '2026-04-23', title: 'First Bath + Rash Cleared', description: 'Curabless complete, rash healed, nails cut', category: 'health' },
  { date: '2026-04-29', title: 'Booster Vaccine', description: 'Weight 3.5kg — excellent growth', category: 'health' },
  { date: '2026-05-02', title: 'Roundworm Treated', description: 'First visible worm — deworming course reset', category: 'health' },
  { date: '2026-05-08', title: 'First River Swim', description: 'Saphale trip — Lab DNA activated 🏊', category: 'behavior' },
  { date: '2026-05-22', title: 'First Baby Tooth Found', description: 'Teething milestone — adult teeth coming in', category: 'growth' },
  { date: '2026-05-22', title: 'Leash + Chal Command', description: 'Walking well with minimal pulling', category: 'training' },
  { date: '2026-06-04', title: 'Rabies Vaccine Complete', description: 'Full vaccine schedule done ✅', category: 'health' },
  { date: '2026-06-05', title: '6.4kg — Day 66', description: 'From 1.7kg to 6.4kg. Training restart.', category: 'growth' },
];

export default function MilestonesPage() {
  const [dbMilestones, setDbMilestones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', title: '', description: '', category: 'other' });

  useEffect(() => {
    healthAPI.get()
      .then(res => setDbMilestones(res.data?.milestones || []))
      .catch(console.error);
  }, []);

  const allMilestones = [
    ...HARDCODED_MILESTONES.map(m => ({ ...m, isStatic: true })),
    ...dbMilestones.map(m => ({ ...m, isStatic: false })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const addMilestone = async () => {
    try {
      await healthAPI.addMilestone(form);
      const res = await healthAPI.get();
      setDbMilestones(res.data?.milestones || []);
      setShowForm(false);
      setForm({ date: '', title: '', description: '', category: 'other' });
      toast.success('Milestone added ✅');
    } catch {
      toast.error('Failed to add milestone');
    }
  };

  const deleteMilestone = async (id) => {
    await healthAPI.deleteMilestone(id);
    const res = await healthAPI.get();
    setDbMilestones(res.data?.milestones || []);
    toast.success('Deleted');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charlie-ink">Charlie's Journey</h1>
          <p className="text-gray-500 text-sm">
            {differenceInDays(new Date(), ADOPTION_DATE)} days with Pratham 🐾
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Milestone
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-4">
          {allMilestones.map((m, i) => (
            <div key={i} className="relative flex gap-4 pl-12">
              <div className={`absolute left-2 top-3 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                m.isStatic ? 'bg-charlie-amber' : 'bg-charlie-forest2'
              }`} />
              <div className="card flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-gray-400">
                        {format(new Date(m.date), 'MMM d, yyyy')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${CATEGORY_COLORS[m.category]}`}>
                        {m.category}
                      </span>
                      {m.isStatic && <Star size={12} className="text-charlie-amber" />}
                    </div>
                    <h3 className="font-semibold text-charlie-ink">{m.title}</h3>
                    {m.description && <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>}
                  </div>
                  {!m.isStatic && m._id && (
                    <button
                      onClick={() => deleteMilestone(m._id)}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Milestone</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Title</label>
                <input type="text" className="input" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. First outdoor walk" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Details..." />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="health">Health</option>
                  <option value="training">Training</option>
                  <option value="behavior">Behavior</option>
                  <option value="growth">Growth</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addMilestone} className="btn-primary flex-1">Add</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
