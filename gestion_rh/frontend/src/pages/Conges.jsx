import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, CalendarOff, Check, X as XIcon } from 'lucide-react';

const statusMap = {
  en_attente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En attente' },
  approuve: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approuve' },
  refuse: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refuse' },
};

const typeLabels = {
  annuel: 'Annuel', maladie: 'Maladie', sans_solde: 'Sans solde',
  maternite: 'Maternite', paternite: 'Paternite', formation: 'Formation',
};

export default function Conges() {
  const [conges, setConges] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ employee_id: '', type_conge: 'annuel', date_debut: '', date_fin: '', raison: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filter ? `?statut=${filter}` : '';
    Promise.all([api.get(`/conges${params}`), api.get('/employees')])
      .then(([c, e]) => { setConges(c); setEmployees(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/conges', { ...form, employee_id: parseInt(form.employee_id) });
      setShowModal(false);
      setForm({ employee_id: '', type_conge: 'annuel', date_debut: '', date_fin: '', raison: '' });
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, statut) => {
    try { await api.put(`/conges/${id}`, { statut }); load(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce conge ?')) return;
    try { await api.delete(`/conges/${id}`); load(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarOff className="text-amber-500" size={24} /> Gestion des conges
          </h1>
          <p className="text-slate-500 mt-1">{conges.length} conge(s)</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm">
          <Plus size={16} /> Nouvelle demande
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ value: '', label: 'Tous' }, { value: 'en_attente', label: 'En attente' }, { value: 'approuve', label: 'Approuves' }, { value: 'refuse', label: 'Refuses' }].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.value ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Employe', 'Departement', 'Type', 'Debut', 'Fin', 'Raison', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" /></td></tr>
              ) : conges.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">Aucun conge</td></tr>
              ) : conges.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{c.prenom} {c.nom}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{c.departement}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{typeLabels[c.type_conge] || c.type_conge}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{c.date_debut}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{c.date_fin}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 max-w-[150px] truncate">{c.raison}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[c.statut]?.bg} ${statusMap[c.statut]?.text}`}>
                      {statusMap[c.statut]?.label || c.statut}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      {c.statut === 'en_attente' && (
                        <>
                          <button onClick={() => updateStatus(c.id, 'approuve')} className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600" title="Approuver">
                            <Check size={14} />
                          </button>
                          <button onClick={() => updateStatus(c.id, 'refuse')} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" title="Refuser">
                            <XIcon size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" title="Supprimer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvelle demande de conge">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employe *</label>
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Selectionner</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom} ({emp.matricule})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type de conge *</label>
            <select value={form.type_conge} onChange={e => setForm({ ...form, type_conge: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date debut *</label>
              <input type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date fin *</label>
              <input type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raison</label>
            <textarea value={form.raison} onChange={e => setForm({ ...form, raison: e.target.value })} rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 shadow-lg shadow-primary-500/25">
              {saving ? 'Enregistrement...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
