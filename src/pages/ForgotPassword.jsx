import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post(`/auth/forgot-password`, null, { params: { email } });
      setMessage('Nëse email-i ekziston, linku për reset është dërguar!');
    } catch (err) {
      setMessage('Gabim gjatë kërkesës, provo përsëri.');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Keni harruar fjalëkalimin?</h2>
          <p className="text-sm text-gray-500 mb-6">Shkruani email-in tuaj dhe do të merrni link për reset.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFAE42]/40 focus:border-[#FFAE42] outline-none transition" required />
            </div>
            {message && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{message}</motion.div>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-60 text-black font-semibold rounded-xl transition-colors text-sm">
              {loading ? 'Duke dërguar...' : 'Dërgo link për reset'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
