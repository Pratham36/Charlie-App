// DailyLogPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logsAPI } from '../api/index.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function DailyLogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState('meals');

  useEffect(() => {
    const fetch = id ? logsAPI.getById(id) : logsAPI.getToday();
    fetch.then(res => setLog(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      await logsAPI.update(log._id, log);
      toast.success('Saved ✅');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addMeal = () => setLog(l => ({
    ...l, meals: [...(l.meals || []), { time: '', food: 'Drools Puppy', amount: 32, ate: true, notes: '' }]
  }));

  const addPotty = () => setLog(l => ({
    ...l, pottyLogs: [...(l.pottyLogs || []), { time: '', type: 'pee', location: 'balcony', notes: '' }]
  }));

  const addTraining = () => setLog(l => ({
    ...l, trainingSessions: [...(l.trainingSessions || []), {
      time: '', duration: 5, notes: '',
      commands: [{ name: 'Sit', accuracy: 0, notes: '' }]
    }]
  }));

  if (loading) return <div className="text-charlie-amber font-mono animate-pulse">Loading...</div>;



  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charlie-ink">Daily Log</h1>
          <p className="text-gray-500 text-sm">{log?.date && format(new Date(log.date), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
      </div>

      {/* Weight */}
      <div className="card">
        <label className="label">Weight (kg)</label>
        <input
          type="number" step="0.1" className="input w-32"
          value={log?.weight || ''}
          onChange={e => setLog(l => ({ ...l, weight: e.target.value }))}
          placeholder="6.4"
        />
      </div>

      {/* Meals */}
      <Section
        title={`Meals (${log?.meals?.length || 0})`}
        isOpen={openSection === 'meals'}
        onToggle={() => setOpenSection(openSection === 'meals' ? null : 'meals')}
      >
        <div className="space-y-4">
          {log?.meals?.map((meal, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">Time</label>
                  <input type="text" className="input" value={meal.time || ''}
                    placeholder="7 AM"
                    onChange={e => {
                      const meals = [...log.meals];
                      meals[i] = { ...meals[i], time: e.target.value };
                      setLog(l => ({ ...l, meals }));
                    }} />
                </div>
                <div>
                  <label className="label">Amount (g)</label>
                  <input type="number" className="input" value={meal.amount || 32}
                    onChange={e => {
                      const meals = [...log.meals];
                      meals[i] = { ...meals[i], amount: Number(e.target.value) };
                      setLog(l => ({ ...l, meals }));
                    }} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={meal.ate !== false}
                      onChange={e => {
                        const meals = [...log.meals];
                        meals[i] = { ...meals[i], ate: e.target.checked };
                        setLog(l => ({ ...l, meals }));
                      }} />
                    <span className="text-sm">Ate</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" className="input flex-1" value={meal.notes || ''}
                  placeholder="Notes..."
                  onChange={e => {
                    const meals = [...log.meals];
                    meals[i] = { ...meals[i], notes: e.target.value };
                    setLog(l => ({ ...l, meals }));
                  }} />
                <button onClick={() => {
                  const meals = log.meals.filter((_, idx) => idx !== i);
                  setLog(l => ({ ...l, meals }));
                }} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button onClick={addMeal} className="btn-secondary text-sm flex items-center gap-2">
            <Plus size={14} /> Add Meal
          </button>
        </div>
      </Section>

      {/* Potty */}
      <Section
        title={`Potty (${log?.pottyLogs?.length || 0})`}
        isOpen={openSection === 'potty'}
        onToggle={() => setOpenSection(openSection === 'potty' ? null : 'potty')}
      >
        <div className="space-y-3">
          {log?.pottyLogs?.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" className="input w-20" value={p.time || ''} placeholder="2 PM"
                onChange={e => {
                  const pottyLogs = [...log.pottyLogs];
                  pottyLogs[i] = { ...pottyLogs[i], time: e.target.value };
                  setLog(l => ({ ...l, pottyLogs }));
                }} />
              <select className="input w-24"
                value={p.type}
                onChange={e => {
                  const pottyLogs = [...log.pottyLogs];
                  pottyLogs[i] = { ...pottyLogs[i], type: e.target.value };
                  setLog(l => ({ ...l, pottyLogs }));
                }}>
                <option value="pee">Pee</option>
                <option value="poop">Poop</option>
                <option value="both">Both</option>
              </select>
              <select className="input flex-1"
                value={p.location}
                onChange={e => {
                  const pottyLogs = [...log.pottyLogs];
                  pottyLogs[i] = { ...pottyLogs[i], location: e.target.value };
                  setLog(l => ({ ...l, pottyLogs }));
                }}>
                <option value="balcony">Balcony ✅</option>
                <option value="outdoor">Outdoor ✅</option>
                <option value="wrong_spot">Wrong Spot ❌</option>
              </select>
              <button onClick={() => {
                const pottyLogs = log.pottyLogs.filter((_, idx) => idx !== i);
                setLog(l => ({ ...l, pottyLogs }));
              }} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
          <button onClick={addPotty} className="btn-secondary text-sm flex items-center gap-2">
            <Plus size={14} /> Add Potty Log
          </button>
        </div>
      </Section>

      {/* Health */}
      <Section
        title="Health"
        isOpen={openSection === 'health'}
        onToggle={() => setOpenSection(openSection === 'health' ? null : 'health')}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Energy Level</label>
            <select className="input"
              value={log?.health?.energy || 'high'}
              onChange={e => setLog(l => ({ ...l, health: { ...l.health, energy: e.target.value } }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="label">Stool</label>
            <select className="input"
              value={log?.health?.stoolConsistency || 'firm'}
              onChange={e => setLog(l => ({ ...l, health: { ...l.health, stoolConsistency: e.target.value } }))}>
              <option value="firm">Firm ✅</option>
              <option value="medium">Medium 🟡</option>
              <option value="soft">Soft ⚠️</option>
              <option value="liquid">Liquid 🔴</option>
            </select>
          </div>
          <div>
            <label className="label">Appetite</label>
            <select className="input"
              value={log?.health?.appetite || 'good'}
              onChange={e => setLog(l => ({ ...l, health: { ...l.health, appetite: e.target.value } }))}>
              <option value="good">Good</option>
              <option value="reduced">Reduced</option>
              <option value="refused">Refused</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox"
                checked={log?.health?.vomiting || false}
                onChange={e => setLog(l => ({ ...l, health: { ...l.health, vomiting: e.target.checked } }))} />
              <span className="text-sm font-medium">Vomiting</span>
            </label>
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Health Notes</label>
          <textarea className="input resize-none" rows={2}
            value={log?.health?.notes || ''}
            onChange={e => setLog(l => ({ ...l, health: { ...l.health, notes: e.target.value } }))}
            placeholder="Any observations..." />
        </div>
      </Section>

      {/* Notes */}
      <div className="card">
        <label className="label">General Notes</label>
        <textarea className="input resize-none" rows={3}
          value={log?.notes || ''}
          onChange={e => setLog(l => ({ ...l, notes: e.target.value }))}
          placeholder="Anything else about today..." />
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
    </div>
  );
}

function Section({ title, isOpen, onToggle, children }) {
  return (
    <div className="card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <h2 className="font-bold text-charlie-ink">{title}</h2>
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}
