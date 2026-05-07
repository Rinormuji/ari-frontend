import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import FormAlert from "../components/FormAlert";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) navigate('/forgot-password');
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen!');
      setLoading(false);
      return;
    }

    try {
      await api.post(`/auth/reset-password`, null, { params: { token, newPassword } });
      setMessage('Fjalëkalimi u ndryshua me sukses!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Token i pavlefshëm ose skaduar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft size={16} /> Kthehu te Kyçu
        </Link>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Vendos fjalëkalim të ri</h2>
          <p className="text-sm text-gray-500 mb-6">Shkruani fjalëkalimin e ri dhe konfirmojeni.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="password" placeholder="Fjalëkalimi i ri" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFAE42]/40 focus:border-[#FFAE42] outline-none transition" required />
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="password" placeholder="Konfirmo fjalëkalimin" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFAE42]/40 focus:border-[#FFAE42] outline-none transition" required />
            </div>
            <FormAlert type="success" message={message} />
            <FormAlert type="error" message={error} />
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-60 text-black font-semibold rounded-xl transition-colors text-sm">
              {loading ? 'Duke përditësuar...' : 'Vendos fjalëkalimin'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
