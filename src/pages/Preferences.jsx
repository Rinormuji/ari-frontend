import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferenceFields from '../components/PreferenceFields';
import { emptyPreferences, hasPreferenceCriteria } from '../utils/emptyPreferences';
import { useAuth } from '../context/authContextValue';
import { interestAPI } from '../services/api';
import { paths } from '../routes/paths';

export default function Preferences() {
  const [preferences, setPreferences] = useState(emptyPreferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    interestAPI.getPreferences().then(response => {
      if (response.data) setPreferences({ ...emptyPreferences, ...response.data });
    }).catch(() => setError('Preferencat nuk u ngarkuan. Provoni përsëri.'));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    if (!hasPreferenceCriteria(preferences)) {
      setError('Zgjidhni të paktën një kriter për pronën.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await interestAPI.savePreferences({
        ...preferences,
        locations: preferences.locations || [],
        types: preferences.types || [],
        status: preferences.status || null,
        targetPrice: preferences.targetPrice || null,
        targetArea: preferences.targetArea || null,
      });
      await refreshUser();
      setMessage('Preferencat u ruajtën.');
      if (!user?.preferencesCompleted) navigate(paths.home, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Preferencat nuk u ruajtën. Provoni përsëri.');
    } finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-[#f6f7f4] px-4 py-12">
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold text-[#0F4638]">Preferencat e mia</h1>
      <p className="mt-2 mb-6 text-sm text-gray-600">Na tregoni çfarë prone kërkoni. Mund t'i ndryshoni preferencat dhe njoftimet në çdo kohë.</p>
      <form onSubmit={save} className="space-y-5">
        <PreferenceFields value={preferences} onChange={setPreferences} />
        {message && <p role="status" className="text-sm text-green-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={saving} className="w-full rounded-xl bg-[#0F4638] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Duke ruajtur...' : 'Ruaj preferencat'}</button>
      </form>
    </div>
  </div>;
}
