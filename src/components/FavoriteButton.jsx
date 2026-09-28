import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContextValue';
import { useFavorites } from '../context/favoritesValue';
import { useToast } from '../context/toastContextValue';
import { paths } from '../routes/paths';

export default function FavoriteButton({ propertyId, compact = false }) {
  const { isAuthenticated } = useAuth();
  const { ids, pending, toggle } = useFavorites();
  const toast = useToast();
  const navigate = useNavigate();
  const saved = ids.includes(propertyId);
  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate(paths.loginWithRedirect(paths.propertyDetail(propertyId)));
      return;
    }
    try { await toggle(propertyId); }
    catch { toast.error('Favoriti nuk u ruajt. Provoni përsëri.'); }
  };
  return <button type="button" onClick={handleClick} disabled={pending.includes(propertyId)}
    aria-label={saved ? 'Hiq nga favoritët' : 'Shto te favoritët'} aria-pressed={saved}
    className={compact
      ? `absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 ${saved ? 'text-red-600' : 'text-[#0F4638]'}`
      : `inline-flex items-center gap-2 rounded-xl border border-[#0F4638]/15 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#fff9ea] ${saved ? 'text-red-600' : 'text-[#0F4638]'}`}>
    <Heart size={18} fill={saved ? 'currentColor' : 'none'} />{!compact && (saved ? 'E ruajtur' : 'Ruaje pronën')}
  </button>;
}
