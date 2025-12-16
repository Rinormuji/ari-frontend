import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_URL}/forgot-password`, null, { params: { email } });
      setMessage('Nëse email-i ekziston, linku për reset është dërguar!');
    } catch (err) {
      setMessage('Gabim gjatë kërkesës, provo përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper-uni">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="forgot-card-uni">
        <div className="forgot-back-home">
          <Link to="/login" className="forgot-back-home-link">
            <ArrowLeft className="forgot-back-home-icon" /> Kthehu te Kyçu
          </Link>
        </div>
        <h2 className="forgot-title-uni">Keni harruar fjalëkalimin?</h2>
        <p className="forgot-desc-uni">Shkruani email-in tuaj dhe do të merrni link për të vendosur fjalëkalim të ri</p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="forgot-input-wrapper-uni">
              <Mail className="forgot-input-icon-left" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="forgot-input-uni" required />
            </div>

            {message && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm">{message}</motion.div>}

            <button type="submit" disabled={loading} className="forgot-btn-uni">{loading ? 'Duke dërguar...' : 'Dërgo link për reset'}</button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
