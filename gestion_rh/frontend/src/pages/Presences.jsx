import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, Clock, Trash2 } from 'lucide-react';

const statusMap = {
  present: { bg: 'bg-green-100', text: 'text-green-700', label: 'Present' },
  absent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Absent' },
  retard: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Retard' },
  conge: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Conge' },
};

export default function Presences() {
  const [presences, setPresences] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [form, setForm] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], heure_arrivee: '08:30', heure_depart: '17:30', statut: 'present', heures_sup: '0' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filterDate ? `?date=${filterDate}` : '';
    Promise.all([api.get(`/presences${params}`), api.get('/employees')])
      .then(([p, e]) => { setPresences(p); setEmployees(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/presences', { ...form, employee_id: parseInt(form.employee_id), heures_sup: parseFloat(form.heures_sup) || 0 });
      setShowModal(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette presence ?')) return;
    try { await api.delete(`/presences/${id}`); load(); }
    catch (err) { alert(err.message); }
  };

  const stats = {
    presents: presences.filter(p => p.statut === 'present').length,
    absents: presences.filter(p => p.statut === 'absent').length,
    retards: presences.filter(p => p.statut === 'retard').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-cyan-500" size={24} /> Suivi des presences
          </h1>
          <p className="text-slate-500 mt-1">{presences.length} enregistrement(s)</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm">
          <Plus size={16} /> Pointer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.presents}</p>
          <p className="text-sm text-green-600">Presents</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.absents}</p>
          <p className="text-sm text-red-600">Absents</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{stats.retards}</p>
          <p className="text-sm text-amber-600">Retards</p>
        </div>
      </div>

      {/* Date filter */}
      <div>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        {filterDate && <button onClick={() => setFilterDate('')} className="ml-2 text-sm text-primary-600 hover:underline">Tout afficher</button>}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Employe', 'Matricule', 'Date', 'Arrivee', 'Depart', 'H. Sup', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></td></tr>
              ) : presences.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">Aucune presence enregistree</td></tr>
              ) : presences.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{p.prenom} {p.nom}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 font-mono">{p.matricule}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.date}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.heure_arrivee || '-'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.heure_depart || '-'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{p.heures_sup > 0 ? `+${p.heures_sup}h` : '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[p.statut]?.bg} ${statusMap[p.statut]?.text}`}>
                      {statusMap[p.statut]?.label || p.statut}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Enregistrer une presence">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employe *</label>
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Selectionner</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {Object.entries(statusMap).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heure arrivee</label>
              <input type="time" value={form.heure_arrivee} onChange={e => setForm({ ...form, heure_arrivee: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heure depart</label>
              <input type="time" value={form.heure_depart} onChange={e => setForm({ ...form, heure_depart: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Heures supplementaires</label>
            <input type="number" step="0.5" value={form.heures_sup} onChange={e => setForm({ ...form, heures_sup: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 shadow-lg shadow-primary-500/25">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
