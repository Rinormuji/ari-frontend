import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />
};

const FormAlert = ({ type = "info", message }) => {
  if (!message) return null;

  const styles = {
    success: "bg-green-50 border border-green-200 text-green-700",
    error: "bg-red-50 border border-red-200 text-red-700",
    info: "bg-blue-50 border border-blue-200 text-blue-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${styles[type] || styles.info}`}
    >
      <span className="shrink-0">{icons[type]}</span>
      <span>{message}</span>
    </motion.div>
  );
};

export default FormAlert;
