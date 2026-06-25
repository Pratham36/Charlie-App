import { useState, useEffect } from 'react';
import { logsAPI, healthAPI } from '../api/index.js';
import { format, differenceInDays } from 'date-fns';
import { Scale, Calendar, Target, Zap, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const ADOPTION_DATE = new Date('2026-03-31');

export default function Dashboard() {
  const [todayLog, setTodayLog] = useState(null);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      logsAPI.getToday(),
      logsAPI.getStats(),
      healthAPI.get(),
    ]).then(([logRes, statsRes, healthRes]) => {
      setTodayLog(logRes.data);
      setStats(statsRes.data);
      setHealth(healthRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const daysWithPratham = differenceInDays(new Date(), ADOPTION_DATE);

  // Find next upcoming health event
  const upcomingEvents = [];
  if (health) {
    health.vaccines?.forEach(v => {
      if (v.nextDueDate && new Date(v.nextDueDate) > new Date()) {
        upcomingEvents.push({ type: 'Vaccine', name: v.name, date: v.nextDueDate });
      }
    });
    health.deworming?.forEach(d => {
      if (d.nextDueDate && new Date(d.nextDueDate) > new Date()) {
        upcomingEvents.push({ type: 'Deworm', name: d.medicine || 'Deworming', date: d.nextDueDate });
      }
    });
    health.medicines?.filter(m => !m.completed).forEach(m => {
      if (m.endDate) upcomingEvents.push({ type: 'Medicine', name: m.name, date: m.endDate });
    });
  }
  upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-charlie-amber font-mono text-sm animate-pulse">Loading Charlie's data...</div>
      </div>
    );
  }

  const pottyTotal = stats?.pottyAccuracy?.total || 0;
  const pottyCorrect = (stats?.pottyAccuracy?.balcony || 0) + (stats?.pottyAccuracy?.outdoor || 0);
  const pottyAccuracy = pottyTotal > 0 ? Math.round((pottyCorrect / pottyTotal) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charlie-ink">Good {getGreeting()} 🐾</h1>
          <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/log" className="btn-primary flex items-center gap-2">
          + Add Today's Update
        </Link>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Days with Pratham" value={daysWithPratham} color="amber" />
        <StatCard icon={Scale} label="Last Weight" value={`${getLastWeight(todayLog)}kg`} color="forest" />
        <StatCard icon={Target} label="Potty Accuracy" value={`${pottyAccuracy}%`} color="blue" sub="last 7 days" />
        <StatCard icon={Zap} label="Meals Today" value={`${todayLog?.meals?.length || 0}/3`} color="amber" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Summary */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-charlie-ink">Today's Summary</h2>
            <Link to="/log" className="text-charlie-amber text-xs font-mono hover:underline">Edit →</Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Meals */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Meals</p>
              <div className="space-y-1.5">
                {['9 AM', '2 PM', '9:30 PM'].map((time, i) => {
                  const meal = todayLog?.meals?.[i];
                  return (
                    <div key={time} className="flex items-center gap-2">
                      {meal?.ate !== false
                        ? <CheckCircle2 size={14} className="text-green-500" />
                        : <AlertCircle size={14} className="text-red-400" />
                      }
                      <span className="text-xs text-gray-600">{time}</span>
                      {meal && <span className="text-xs text-gray-400">{meal.amount}g</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Potty */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Potty</p>
              <div className="space-y-1.5">
                {todayLog?.pottyLogs?.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.location === 'wrong_spot' ? 'bg-red-400' :
                      p.location === 'outdoor' ? 'bg-blue-400' : 'bg-green-400'
                      }`} />
                    <span className="text-xs text-gray-600 capitalize">{p.type}</span>
                    <span className="text-xs text-gray-400">{p.time}</span>
                  </div>
                )) || <p className="text-xs text-gray-400">No logs yet</p>}
              </div>
            </div>

            {/* Health */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Health</p>
              {todayLog?.health && (todayLog.health.energy || todayLog.health.stoolConsistency || todayLog.health.appetite) ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-charlie-amber" />
                    <span className="text-xs text-gray-600 capitalize">Energy: {todayLog.health.energy || 'high'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (todayLog.health.stoolConsistency || 'firm') === 'firm' ? 'bg-green-400' :
                      todayLog.health.stoolConsistency === 'liquid' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-xs text-gray-600 capitalize">Stool: {todayLog.health.stoolConsistency || 'firm'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span className="text-xs text-gray-600 capitalize">Appetite: {todayLog.health.appetite || 'good'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Not logged yet</p>
              )}
            </div>
          </div>

          {todayLog?.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">{todayLog.notes}</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="font-bold text-charlie-ink mb-4">Upcoming</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${event.type === 'Vaccine' ? 'bg-blue-100' :
                    event.type === 'Deworm' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                    <Clock size={14} className={
                      event.type === 'Vaccine' ? 'text-blue-600' :
                        event.type === 'Deworm' ? 'text-green-600' : 'text-amber-600'
                    } />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charlie-ink">{event.name}</p>
                    <p className="text-xs text-gray-400">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                    <span className={`text-xs font-mono ${event.type === 'Vaccine' ? 'text-blue-600' :
                      event.type === 'Deworm' ? 'text-green-600' : 'text-amber-600'
                      }`}>{event.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Recent Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-charlie-ink">Recent Days</h2>
          <Link to="/log" className="text-charlie-amber text-xs font-mono hover:underline">View all →</Link>
        </div>
        <RecentLogs />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    amber: 'bg-amber-50 text-charlie-amber',
    forest: 'bg-green-50 text-charlie-forest2',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-charlie-ink">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-300">{sub}</p>}
      </div>
    </div>
  );
}

function RecentLogs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    logsAPI.getAll({ limit: 7 }).then(res => setLogs(res.data.logs)).catch(console.error);
  }, []);

  return (
    <div className="space-y-2">
      {logs.map(log => (
        <Link
          key={log._id}
          to={`/log/${log._id}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-charlie-amber/10 rounded-lg flex items-center justify-center">
              <span className="text-charlie-amber text-xs font-bold">
                {format(new Date(log.date), 'd')}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-charlie-ink">
                {format(new Date(log.date), 'EEEE, MMM d')}
              </p>
              <p className="text-xs text-gray-400">
                {log.meals?.length || 0} meals · {log.pottyLogs?.length || 0} potty · {log.trainingSessions?.length || 0} training
              </p>
            </div>
          </div>
          <span className="text-gray-300 group-hover:text-charlie-amber transition-colors">→</span>
        </Link>
      ))}
      {logs.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No logs yet. Start tracking today!</p>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getLastWeight(log) {
  return log?.weight || '6.9';
}
