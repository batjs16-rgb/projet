import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, Users, Filter } from 'lucide-react';

const emptyForm = {
  matricule: '', nom: '', prenom: '', email: '', telephone: '',
  poste: '', departement: '', date_embauche: '', salaire: '',
  statut: 'actif', adresse: '', date_naissance: '', genre: '',
};

const statutColors = {
  actif: 'bg-green-100 text-green-700',
  inactif: 'bg-slate-100 text-slate-600',
  en_conge: 'bg-amber-100 text-amber-700',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadEmployees = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterDept) params.set('departement', filterDept);
    api.get(`/employees?${params}`).then(setEmployees).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadEmployees(); }, [search, filterDept]);

  const departments = [...new Set(employees.map(e => e.departement).filter(Boolean))];

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (emp) => { setEditing(emp); setForm({ ...emptyForm, ...emp, salaire: emp.salaire?.toString() || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, salaire: form.salaire ? parseFloat(form.salaire) : null };
      if (editing) {
        await api.put(`/employees/${editing.id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet employe ?')) return;
    try {
      await api.delete(`/employees/${id}`);
      loadEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-primary-600" size={24} />
            Employes
          </h1>
          <p className="text-slate-500 mt-1">{employees.length} employe(s) au total</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm">
          <Plus size={16} /> Nouvel employe
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Rechercher un employe..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <select
          value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Tous les departements</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Matricule', 'Nom complet', 'Email', 'Poste', 'Departement', 'Salaire', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">Aucun employe trouve</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-mono text-slate-600">{emp.matricule}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {emp.prenom?.[0]}{emp.nom?.[0]}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{emp.prenom} {emp.nom}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{emp.email}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{emp.poste}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{emp.departement}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 font-medium">
                    {emp.salaire ? `${Number(emp.salaire).toLocaleString('fr-FR')} DH` : '-'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColors[emp.statut] || 'bg-slate-100 text-slate-600'}`}>
                      {emp.statut === 'en_conge' ? 'En conge' : emp.statut?.charAt(0).toUpperCase() + emp.statut?.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier employe' : 'Nouvel employe'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matricule *</label>
              <input value={form.matricule} onChange={e => setField('matricule', e.target.value)} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder="EMP001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prenom *</label>
              <input value={form.prenom} onChange={e => setField('prenom', e.target.value)} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
              <input value={form.nom} onChange={e => setField('nom', e.target.value)} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
              <input value={form.telephone} onChange={e => setField('telephone', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Poste</label>
              <input value={form.poste} onChange={e => setField('poste', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departement</label>
              <input value={form.departement} onChange={e => setField('departement', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date embauche</label>
              <input type="date" value={form.date_embauche} onChange={e => setField('date_embauche', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salaire</label>
              <input type="number" value={form.salaire} onChange={e => setField('salaire', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={form.statut} onChange={e => setField('statut', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="en_conge">En conge</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Genre</label>
              <select value={form.genre} onChange={e => setField('genre', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">--</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date naissance</label>
              <input type="date" value={form.date_naissance} onChange={e => setField('date_naissance', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input value={form.adresse} onChange={e => setField('adresse', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 shadow-lg shadow-primary-500/25">
              {saving ? 'Enregistrement...' : (editing ? 'Modifier' : 'Creer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
