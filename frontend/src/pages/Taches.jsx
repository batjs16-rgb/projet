import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, ClipboardList, Edit2, Trash2 } from 'lucide-react';

const statusMap = {
  a_faire: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'A faire' },
  en_cours: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En cours' },
  terminee: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminee' },
  annulee: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulee' },
};

const prioriteMap = {
  basse: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Basse', dot: 'bg-slate-400' },
  moyenne: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Moyenne', dot: 'bg-blue-500' },
  haute: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Haute', dot: 'bg-orange-500' },
  urgente: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgente', dot: 'bg-red-500' },
};

const emptyForm = { employee_id: '', titre: '', description: '', date_tache: new Date().toISOString().split('T')[0], date_echeance: '', priorite: 'moyenne', statut: 'a_faire' };

export default function Taches() {
  const [taches, setTaches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatut, setFilterStatut] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = filterStatut ? `?statut=${filterStatut}` : '';
    Promise.all([api.get(`/taches${params}`), api.get('/employees')])
      .then(([t, e]) => { setTaches(t); setEmployees(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatut]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...emptyForm, ...t, employee_id: t.employee_id?.toString() || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, employee_id: parseInt(form.employee_id) };
      if (editing) await api.put(`/taches/${editing.id}`, payload);
      else await api.post('/taches', payload);
      setShowModal(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, statut) => {
    try { await api.put(`/taches/${id}`, { statut }); load(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette tache ?')) return;
    try { await api.delete(`/taches/${id}`); load(); }
    catch (err) { alert(err.message); }
  };

  const grouped = {
    a_faire: taches.filter(t => t.statut === 'a_faire'),
    en_cours: taches.filter(t => t.statut === 'en_cours'),
    terminee: taches.filter(t => t.statut === 'terminee'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-rose-500" size={24} /> Gestion des taches
          </h1>
          <p className="text-slate-500 mt-1">{taches.length} tache(s)</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm">
          <Plus size={16} /> Nouvelle tache
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: '', label: 'Toutes' }, ...Object.entries(statusMap).map(([v, o]) => ({ value: v, label: o.label }))].map(f => (
          <button key={f.value} onClick={() => setFilterStatut(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatut === f.value ? 'bg-primary-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Kanban board */}
      {!filterStatut && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'a_faire', title: 'A faire', color: 'border-slate-300', headerBg: 'bg-slate-100' },
            { key: 'en_cours', title: 'En cours', color: 'border-blue-300', headerBg: 'bg-blue-50' },
            { key: 'terminee', title: 'Terminee', color: 'border-green-300', headerBg: 'bg-green-50' },
          ].map(col => (
            <div key={col.key} className={`rounded-2xl border-2 ${col.color} overflow-hidden`}>
              <div className={`px-4 py-3 ${col.headerBg} font-semibold text-sm flex items-center justify-between`}>
                <span>{col.title}</span>
                <span className="bg-white rounded-full px-2 py-0.5 text-xs">{grouped[col.key]?.length || 0}</span>
              </div>
              <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto bg-white/50">
                {loading ? (
                  <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" /></div>
                ) : (grouped[col.key] || []).length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">Aucune tache</p>
                ) : (grouped[col.key] || []).map(t => (
                  <TaskCard key={t.id} task={t} onEdit={openEdit} onDelete={handleDelete} onStatusChange={updateStatus} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view when filtered */}
      {filterStatut && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
          ) : taches.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">Aucune tache</div>
          ) : taches.map(t => (
            <TaskCard key={t.id} task={t} onEdit={openEdit} onDelete={handleDelete} onStatusChange={updateStatus} />
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier tache' : 'Nouvelle tache'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
            <input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assignee a *</label>
            <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">Selectionner</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" value={form.date_tache} onChange={e => setForm({ ...form, date_tache: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Echeance</label>
              <input type="date" value={form.date_echeance} onChange={e => setForm({ ...form, date_echeance: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorite</label>
              <select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {Object.entries(prioriteMap).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                {Object.entries(statusMap).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 shadow-lg shadow-primary-500/25">
              {saving ? 'Enregistrement...' : (editing ? 'Modifier' : 'Creer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const t = task;
  const prio = prioriteMap[t.priorite] || prioriteMap.moyenne;
  const stat = statusMap[t.statut] || statusMap.a_faire;

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-900 text-sm leading-tight flex-1">{t.titre}</h4>
        <div className="flex items-center gap-1 ml-2">
          <div className={`w-2 h-2 rounded-full ${prio.dot}`} />
        </div>
      </div>
      {t.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{t.description}</p>}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${prio.bg} ${prio.text}`}>{prio.label}</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stat.bg} ${stat.text}`}>{stat.label}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
            {t.prenom?.[0]}{t.nom?.[0]}
          </div>
          <span className="text-xs text-slate-500">{t.prenom} {t.nom}</span>
        </div>
        {t.date_echeance && <span className="text-xs text-slate-400">{t.date_echeance}</span>}
      </div>
      <div className="flex items-center gap-1 pt-3 border-t border-slate-100 mt-3">
        {t.statut === 'a_faire' && (
          <button onClick={() => onStatusChange(t.id, 'en_cours')} className="flex-1 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">Demarrer</button>
        )}
        {t.statut === 'en_cours' && (
          <button onClick={() => onStatusChange(t.id, 'terminee')} className="flex-1 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100">Terminer</button>
        )}
        <button onClick={() => onEdit(t)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit2 size={12} /></button>
        <button onClick={() => onDelete(t.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}
