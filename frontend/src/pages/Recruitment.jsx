import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, UserPlus, Search, Edit2, Trash2 } from 'lucide-react';

const statusMap = {
  en_attente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En attente' },
  entretien: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Entretien' },
  accepte: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepte' },
  refuse: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refuse' },
};

const emptyForm = { nom: '', prenom: '', email: '', telephone: '', poste_demande: '', experience: '', notes: '' };

export default function Recruitment() {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (filter) params.set('statut', filter);
    if (search) params.set('search', search);
    api.get(`/recruitment?${params}`).then(setCandidats).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...emptyForm, ...c, experience: c.experience?.toString() || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, experience: form.experience ? parseInt(form.experience) : 0 };
      if (editing) await api.put(`/recruitment/${editing.id}`, payload);
      else await api.post('/recruitment', payload);
      setShowModal(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, statut) => {
    try { await api.put(`/recruitment/${id}`, { statut }); load(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce candidat ?')) return;
    try { await api.delete(`/recruitment/${id}`); load(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="text-emerald-500" size={24} /> Recrutement
          </h1>
          <p className="text-slate-500 mt-1">{candidats.length} candidat(s)</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm">
          <Plus size={16} /> Nouveau candidat
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Rechercher un candidat..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ value: '', label: 'Tous' }, ...Object.entries(statusMap).map(([v, o]) => ({ value: v, label: o.label }))].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.value ? 'bg-primary-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban-like cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : candidats.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">Aucun candidat</div>
        ) : candidats.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  {c.prenom?.[0]}{c.nom?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{c.prenom} {c.nom}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[c.statut]?.bg} ${statusMap[c.statut]?.text}`}>
                {statusMap[c.statut]?.label}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm"><span className="text-slate-500">Poste:</span> <span className="font-medium text-slate-700">{c.poste_demande}</span></p>
              <p className="text-sm"><span className="text-slate-500">Experience:</span> <span className="font-medium text-slate-700">{c.experience} ans</span></p>
              {c.telephone && <p className="text-sm"><span className="text-slate-500">Tel:</span> <span className="text-slate-700">{c.telephone}</span></p>}
              {c.date_candidature && <p className="text-sm"><span className="text-slate-500">Date:</span> <span className="text-slate-700">{c.date_candidature}</span></p>}
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              {c.statut === 'en_attente' && (
                <button onClick={() => updateStatus(c.id, 'entretien')} className="flex-1 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">Entretien</button>
              )}
              {c.statut === 'entretien' && (
                <>
                  <button onClick={() => updateStatus(c.id, 'accepte')} className="flex-1 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100">Accepter</button>
                  <button onClick={() => updateStatus(c.id, 'refuse')} className="flex-1 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100">Refuser</button>
                </>
              )}
              <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier candidat' : 'Nouveau candidat'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prenom *</label>
              <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
              <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
              <input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience (annees)</label>
              <input type="number" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Poste demande *</label>
            <input value={form.poste_demande} onChange={e => setForm({ ...form, poste_demande: e.target.value })} required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
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
