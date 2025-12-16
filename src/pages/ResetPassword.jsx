import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import FormAlert from "../components/FormAlert";

const API_URL = 'http://localhost:8080/api/auth';

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
      await axios.post(`${API_URL}/reset-password`, null, { params: { token, newPassword } });
      setMessage('Fjalëkalimi u ndryshua me sukses!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Token i pavlefshëm ose skaduar.');
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

        <h2 className="forgot-title-uni">Vendos fjalëkalim të ri</h2>
        <p className="forgot-desc-uni">Shkruani fjalëkalimin e ri dhe konfirmojeni për të përditësuar.</p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="forgot-input-wrapper-uni">
              <Lock className="forgot-input-icon-left" />
              <input type="password" placeholder="Fjalëkalimi i ri" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="forgot-input-uni" required />
            </div>
            <div className="forgot-input-wrapper-uni">
              <Lock className="forgot-input-icon-left" />
              <input type="password" placeholder="Konfirmo fjalëkalimin" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="forgot-input-uni" required />
            </div>

            <FormAlert type="success" message={message} />
<FormAlert type="error" message={error} />

            <button type="submit" disabled={loading} className="forgot-btn-uni">{loading ? 'Duke përditësuar...' : 'Vendos fjalëkalimin'}</button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
