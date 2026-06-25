import { useState, useEffect } from 'react';
import { healthAPI } from '../api/index.js';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

export default function HealthPage() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vaccines');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    healthAPI.get()
      .then(res => setRecord(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => healthAPI.get().then(res => setRecord(res.data));

  if (loading) return <div className="text-charlie-amber font-mono animate-pulse">Loading health records...</div>;

  const tabs = ['vaccines', 'deworming', 'medicines'];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold text-charlie-ink">Health Records</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-white text-charlie-ink shadow-sm' : 'text-gray-500 hover:text-charlie-ink'
            }`}
          >
            {tab} ({record?.[tab]?.length || 0})
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'vaccines' && (
        <VaccineSection vaccines={record?.vaccines || []} onRefresh={refresh} />
      )}
      {activeTab === 'deworming' && (
        <DewormingSection deworming={record?.deworming || []} onRefresh={refresh} />
      )}
      {activeTab === 'medicines' && (
        <MedicineSection medicines={record?.medicines || []} onRefresh={refresh} />
      )}

      {/* Add form modal */}
      {showForm && (
        <AddRecordModal
          type={activeTab}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            try {
              if (activeTab === 'vaccines') await healthAPI.addVaccine(data);
              else if (activeTab === 'deworming') await healthAPI.addDeworming(data);
              else await healthAPI.addMedicine(data);
              await refresh();
              setShowForm(false);
              toast.success('Record added ✅');
            } catch {
              toast.error('Failed to add record');
            }
          }}
        />
      )}
    </div>
  );
}

function VaccineSection({ vaccines, onRefresh }) {
  const sorted = [...vaccines].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="space-y-3">
      {sorted.map(v => (
        <div key={v._id} className="card flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-green-500" />
              <h3 className="font-semibold text-charlie-ink">{v.name}</h3>
            </div>
            <p className="text-sm text-gray-500">Given: {format(new Date(v.date), 'MMM d, yyyy')}</p>
            {v.nextDueDate && (
              <p className="text-sm text-charlie-amber">Next: {format(new Date(v.nextDueDate), 'MMM d, yyyy')}</p>
            )}
            {v.batchNo && <p className="text-xs text-gray-400 font-mono">Batch: {v.batchNo}</p>}
            {v.vet && <p className="text-xs text-gray-400">Vet: {v.vet}</p>}
            {v.weightAtTime && <p className="text-xs text-gray-400">Weight: {v.weightAtTime}kg</p>}
          </div>
          <button
            onClick={async () => {
              await healthAPI.deleteVaccine(v._id);
              await onRefresh();
              toast.success('Deleted');
            }}
            className="text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {sorted.length === 0 && <p className="text-gray-400 text-sm">No vaccine records yet.</p>}
    </div>
  );
}

function DewormingSection({ deworming, onRefresh }) {
  const sorted = [...deworming].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="space-y-3">
      {sorted.map((d, i) => (
        <div key={d._id || i} className="card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <h3 className="font-semibold">{d.medicine || 'Deworming'}</h3>
          </div>
          <p className="text-sm text-gray-500">Given: {format(new Date(d.date), 'MMM d, yyyy')}</p>
          <p className="text-sm text-gray-500">Dose: {d.dose}</p>
          {d.nextDueDate && (
            <p className="text-sm text-charlie-amber">Next: {format(new Date(d.nextDueDate), 'MMM d, yyyy')}</p>
          )}
        </div>
      ))}
      {sorted.length === 0 && <p className="text-gray-400 text-sm">No deworming records yet.</p>}
    </div>
  );
}

function MedicineSection({ medicines, onRefresh }) {
  return (
    <div className="space-y-3">
      {medicines.map(m => (
        <div key={m._id} className="card flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {m.completed
                ? <CheckCircle2 size={16} className="text-green-500" />
                : <Clock size={16} className="text-charlie-amber" />
              }
              <h3 className="font-semibold">{m.name}</h3>
              <span className={m.completed ? 'badge-green' : 'badge-amber'}>
                {m.completed ? 'Complete' : 'Active'}
              </span>
            </div>
            <p className="text-sm text-gray-500">Dose: {m.dose} · {m.frequency}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(m.startDate), 'MMM d')} → {m.endDate ? format(new Date(m.endDate), 'MMM d, yyyy') : 'Ongoing'}
            </p>
            {m.reason && <p className="text-xs text-gray-400">Reason: {m.reason}</p>}
          </div>
          <button
            onClick={async () => {
              await healthAPI.updateMedicine(m._id, { completed: !m.completed });
              await onRefresh();
            }}
            className="text-xs text-charlie-amber hover:underline"
          >
            {m.completed ? 'Mark active' : 'Mark done'}
          </button>
        </div>
      ))}
      {medicines.length === 0 && <p className="text-gray-400 text-sm">No medicine records yet.</p>}
    </div>
  );
}

function AddRecordModal({ type, onClose, onSave }) {
  const [form, setForm] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fields = {
    vaccines: [
      { key: 'name', label: 'Vaccine Name', type: 'text', required: true },
      { key: 'date', label: 'Date Given', type: 'date', required: true },
      { key: 'nextDueDate', label: 'Next Due Date', type: 'date' },
      { key: 'batchNo', label: 'Batch Number', type: 'text' },
      { key: 'vet', label: 'Vet Name', type: 'text' },
      { key: 'weightAtTime', label: 'Weight at Time (kg)', type: 'number' },
    ],
    deworming: [
      { key: 'medicine', label: 'Medicine Name', type: 'text' },
      { key: 'date', label: 'Date Given', type: 'date', required: true },
      { key: 'dose', label: 'Dose (ml)', type: 'text' },
      { key: 'nextDueDate', label: 'Next Due Date', type: 'date' },
    ],
    medicines: [
      { key: 'name', label: 'Medicine Name', type: 'text', required: true },
      { key: 'startDate', label: 'Start Date', type: 'date', required: true },
      { key: 'endDate', label: 'End Date', type: 'date' },
      { key: 'dose', label: 'Dose', type: 'text' },
      { key: 'frequency', label: 'Frequency (e.g. 2x/day)', type: 'text' },
      { key: 'reason', label: 'Reason', type: 'text' },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4 capitalize">Add {type.slice(0, -1)}</h2>
        <div className="space-y-3">
          {fields[type].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input
                type={f.type}
                className="input"
                required={f.required}
                onChange={e => set(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(form)} className="btn-primary flex-1">Save</button>
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
}
