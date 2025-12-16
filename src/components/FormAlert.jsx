import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />
};

const FormAlert = ({ type = "info", message }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`form-alert-uni form-alert-${type}`}
    >
      <span className="form-alert-icon">{icons[type]}</span>
      <span className="form-alert-text">{message}</span>
    </motion.div>
  );
};

export default FormAlert;
