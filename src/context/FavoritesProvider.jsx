import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './authContextValue';
import { FavoritesContext } from './favoritesValue';
import { interestAPI } from '../services/api';

export default function FavoritesProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [ids, setIds] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user?.preferencesCompleted) {
      setIds([]);
      return;
    }
    let active = true;
    interestAPI.getFavorites().then(response => {
      if (active) setIds(response.data);
    }).catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated, user?.id, user?.preferencesCompleted]);

  const toggle = useCallback(async (id) => {
    if (pending.includes(id)) return;
    const saved = ids.includes(id);
    setPending(previous => [...previous, id]);
    try {
      if (saved) await interestAPI.removeFavorite(id);
      else await interestAPI.addFavorite(id);
      setIds(previous => saved ? previous.filter(item => item !== id) : [...previous, id]);
    } finally {
      setPending(previous => previous.filter(item => item !== id));
    }
  }, [ids, pending]);

  const value = useMemo(() => ({ ids, pending, toggle }), [ids, pending, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
