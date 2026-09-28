import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { useFavorites } from '../context/favoritesValue';
import { interestAPI } from '../services/api';
import { paths } from '../routes/paths';

const PAGE_SIZE = 12;

export default function Favorites() {
  const { ids } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    interestAPI.getFavoriteProperties({ page: page - 1, size: PAGE_SIZE })
      .then(({ data }) => {
        if (!active) return;
        setProperties(data?.content || []);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements || 0);
      })
      .catch(() => {
        if (!active) return;
        setProperties([]); setTotalPages(1); setTotalElements(0);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, ids.length]);

  useEffect(() => { if (page > totalPages) setPage(Math.max(1, totalPages)); }, [page, totalPages]);

  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const items = [1];
    if (page > 3) items.push('left');
    for (let current = Math.max(2, page - 1); current <= Math.min(totalPages - 1, page + 1); current += 1) items.push(current);
    if (page < totalPages - 2) items.push('right');
    items.push(totalPages);
    return items;
  }, [page, totalPages]);

  return <div className="min-h-screen bg-[#f6f7f4] px-4 py-12">
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold text-[#0F4638]">Pronat favorite</h1>
      <p className="mt-2 text-sm text-gray-600">{totalElements} prona të ruajtura. Shfaqen {PAGE_SIZE} për faqe.</p>
      {loading ? <p role="status" className="mt-8 text-gray-600">Duke ngarkuar...</p>
        : properties.length ? <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{properties.map(property => <PropertyCard key={property.id} property={property} />)}</div>
          {totalPages > 1 && <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="rounded-lg border border-[#0F4638]/10 bg-white px-3 py-2 text-sm font-semibold text-[#0F4638] disabled:opacity-40">‹ Mbrapa</button>
            {pages.map((item, index) => item === 'left' || item === 'right'
              ? <span key={`${item}-${index}`} className="px-2 text-gray-400">…</span>
              : <button type="button" key={item} onClick={() => setPage(item)} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold ${page === item ? 'bg-[#0F4638] text-[#EFD391]' : 'border border-[#0F4638]/10 bg-white text-[#0F4638]'}`}>{item}</button>)}
            <button type="button" disabled={page === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="rounded-lg border border-[#0F4638]/10 bg-white px-3 py-2 text-sm font-semibold text-[#0F4638] disabled:opacity-40">Para ›</button>
          </div>}
        </>
        : <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">Nuk keni prona favorite.</p>
          <Link className="mt-4 inline-block rounded-xl bg-[#0F4638] px-5 py-3 font-semibold text-white" to={paths.properties}>Shfleto pronat</Link>
        </div>}
    </div>
  </div>;
}
