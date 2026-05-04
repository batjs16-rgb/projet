import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Modal from '../components/Modal';
import { Plus, Star, Trash2, Edit2 } from 'lucide-react';

function NoteBar({ label, value, max = 10 }) {
  const pct = (value / max) * 100;
  const color = value >= 8 ? 'bg-green-500' : value >= 6 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700 w-8 text-right">{value}</span>
    </div>
  );
}

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    employee_id: '', date_evaluation: new Date().toISOString().split('T')[0], evaluateur: '',
    competence_technique: '7', communication: '7', travail_equipe: '7', ponctualite: '7', initiative: '7', commentaires: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([api.get('/evaluations'), api.get('/employees')])
      .then(([ev, emp]) => { setEvaluations(ev); setEmployees(emp); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ employee_id: '', date_evaluation: new Date().toISOString().split('T')[0], evaluateur: '', competence_technique: '7', communication: '7', travail_equipe: '7', ponctualite: '7', initiative: '7', commentaires: '' });
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setEditing(ev);
    setForm({
      employee_id: ev.employee_id?.toString() || '', date_evaluation: ev.date_evaluation || '', evaluateur: ev.evaluateur || '',
      competence_technique: ev.competence_technique?.toString() || '7', communication: ev.communication?.toString() || '7',
      travail_equipe: ev.travail_equipe?.toString() || '7', ponctualite: ev.ponctualite?.toString() || '7',
      initiative: ev.initiative?.toString() || '7', commentaires: ev.commentaires || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        employee_id: parseInt(form.employee_id),
        competence_technique: parseFloat(form.competence_technique),
        communication: parseFloat(form.communication),
        travail_equipe: parseFloat(form.travail_equipe),
        ponctualite: parseFloat(form.ponctualite),
        initiative: parseFloat(form.initiative),
      };
      if (editing) await api.put(`/evaluations/${editing.id}`, payload);
      else await api.post('/evaluations', payload);
      setShowModal(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette evaluation ?')) return;
    try { await api.delete(`/evaluations/${id}`); load(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="text-violet-500" size={24} /> Evaluations
          </h1>
          <p className="text-slate-500 mt-1">{evaluations.length} evaluation(s)</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/25 text-sm">
          <Plus size={16} /> Nouvelle evaluation
        </button>
      </div>

      {/* Evaluation cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : evaluations.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">Aucune evaluation</div>
        ) : evaluations.map(ev => (
          <div key={ev.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                  {ev.prenom?.[0]}{ev.nom?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{ev.prenom} {ev.nom}</p>
                  <p className="text-xs text-slate-500">{ev.departement} &bull; {ev.date_evaluation}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${ev.note_globale >= 8 ? 'text-green-600' : ev.note_globale >= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                  {ev.note_globale}
                </div>
                <p className="text-xs text-slate-400">/10</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <NoteBar label="Technique" value={ev.competence_technique} />
              <NoteBar label="Communication" value={ev.communication} />
              <NoteBar label="Equipe" value={ev.travail_equipe} />
              {ev.ponctualite != null && <NoteBar label="Ponctualite" value={ev.ponctualite} />}
              {ev.initiative != null && <NoteBar label="Initiative" value={ev.initiative} />}
            </div>

            {ev.commentaires && (
              <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3 mt-3">
                &ldquo;{ev.commentaires}&rdquo;
              </p>
            )}
            {ev.evaluateur && (
              <p className="text-xs text-slate-400 mt-1">Evaluateur: {ev.evaluateur}</p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-3">
              <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Modifier evaluation' : 'Nouvelle evaluation'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employe *</label>
              <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required disabled={!!editing}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-100">
                <option value="">Selectionner</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.prenom} {emp.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date evaluation *</label>
              <input type="date" value={form.date_evaluation} onChange={e => setForm({ ...form, date_evaluation: e.target.value })} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Evaluateur</label>
            <input value={form.evaluateur} onChange={e => setForm({ ...form, evaluateur: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Notes (0-10)</p>
            {[
              { key: 'competence_technique', label: 'Competence technique' },
              { key: 'communication', label: 'Communication' },
              { key: 'travail_equipe', label: 'Travail equipe' },
              { key: 'ponctualite', label: 'Ponctualite' },
              { key: 'initiative', label: 'Initiative' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <label className="text-sm text-slate-600 w-40">{label}</label>
                <input type="range" min="0" max="10" step="0.5" value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="flex-1 accent-primary-600" />
                <span className="text-sm font-medium text-slate-700 w-8 text-right">{form[key]}</span>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Commentaires</label>
            <textarea value={form.commentaires} onChange={e => setForm({ ...form, commentaires: e.target.value })} rows={3}
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
