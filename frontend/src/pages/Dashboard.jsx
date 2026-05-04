import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Users, CalendarOff, UserPlus, ClipboardList, Star, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color, gradient }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function RecentTable({ title, headers, rows, emptyMsg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {headers.map((h) => (
                <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? rows : (
              <tr><td colSpan={headers.length} className="px-5 py-8 text-center text-sm text-slate-400">{emptyMsg}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status, map }) {
  const config = map[status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

const congeStatusMap = {
  en_attente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En attente' },
  approuve: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approuve' },
  refuse: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refuse' },
};

const candidatStatusMap = {
  en_attente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En attente' },
  entretien: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Entretien' },
  accepte: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepte' },
  refuse: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refuse' },
};

const prioriteMap = {
  basse: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Basse' },
  moyenne: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Moyenne' },
  haute: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Haute' },
  urgente: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgente' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">Erreur de chargement</p>;

  const { stats, departements, recentEmployees, recentConges, recentCandidats, tachesRecentes } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de votre gestion RH</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employes" value={stats.totalEmployees} sub={`${stats.employeesActifs} actifs`} gradient="bg-gradient-to-br from-primary-500 to-primary-700" />
        <StatCard icon={CalendarOff} label="Conges en attente" value={stats.congesEnAttente} sub={`${stats.totalConges} total`} gradient="bg-gradient-to-br from-amber-400 to-amber-600" />
        <StatCard icon={UserPlus} label="Candidatures" value={stats.totalCandidats} sub={`${stats.candidatsEnAttente} en attente`} gradient="bg-gradient-to-br from-emerald-400 to-emerald-600" />
        <StatCard icon={ClipboardList} label="Taches en cours" value={stats.tachesEnCours} sub={`${stats.tachesUrgentes} urgentes`} gradient="bg-gradient-to-br from-rose-400 to-rose-600" />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Star} label="Note moyenne" value={stats.avgEvaluation + '/10'} gradient="bg-gradient-to-br from-violet-400 to-violet-600" />
        <StatCard icon={Clock} label="Employes en conge" value={stats.employeesEnConge} gradient="bg-gradient-to-br from-cyan-400 to-cyan-600" />
        <StatCard icon={TrendingUp} label="Departements" value={departements.length} gradient="bg-gradient-to-br from-pink-400 to-pink-600" />
      </div>

      {/* Departement breakdown */}
      {departements.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Repartition par departement</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {departements.map((d) => (
              <div key={d.departement} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-primary-600">{d.count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{d.departement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentTable
          title="Derniers employes"
          headers={['Nom', 'Poste', 'Departement']}
          emptyMsg="Aucun employe"
          rows={recentEmployees.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-sm font-medium text-slate-900">{e.prenom} {e.nom}</td>
              <td className="px-5 py-3 text-sm text-slate-600">{e.poste}</td>
              <td className="px-5 py-3 text-sm text-slate-600">{e.departement}</td>
            </tr>
          ))}
        />

        <RecentTable
          title="Derniers conges"
          headers={['Employe', 'Type', 'Statut']}
          emptyMsg="Aucun conge"
          rows={recentConges.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-sm font-medium text-slate-900">{c.prenom} {c.nom}</td>
              <td className="px-5 py-3 text-sm text-slate-600 capitalize">{c.type_conge.replace('_', ' ')}</td>
              <td className="px-5 py-3"><StatusBadge status={c.statut} map={congeStatusMap} /></td>
            </tr>
          ))}
        />

        <RecentTable
          title="Derniers candidats"
          headers={['Nom', 'Poste', 'Statut']}
          emptyMsg="Aucun candidat"
          rows={recentCandidats.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-sm font-medium text-slate-900">{c.prenom} {c.nom}</td>
              <td className="px-5 py-3 text-sm text-slate-600">{c.poste_demande}</td>
              <td className="px-5 py-3"><StatusBadge status={c.statut} map={candidatStatusMap} /></td>
            </tr>
          ))}
        />

        <RecentTable
          title="Taches recentes"
          headers={['Tache', 'Assignee a', 'Priorite']}
          emptyMsg="Aucune tache"
          rows={tachesRecentes.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-sm font-medium text-slate-900">{t.titre}</td>
              <td className="px-5 py-3 text-sm text-slate-600">{t.prenom} {t.nom}</td>
              <td className="px-5 py-3"><StatusBadge status={t.priorite} map={prioriteMap} /></td>
            </tr>
          ))}
        />
      </div>
    </div>
  );
}
