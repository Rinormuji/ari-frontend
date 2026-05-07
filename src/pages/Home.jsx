import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Search, Building2, MapPin, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { propertyAPI } from '../services/api'
import PropertyCard from '../components/PropertyCard'

const CITIES = ["Prishtinë", "Prizren", "Pejë", "Gjakovë", "Ferizaj", "Gjilan", "Mitrovicë"]
const PAGE_SIZE = 12

const typeLabels = { BANESA: "Banesë", SHTEPI: "Shtëpi", LOKALE: "Lokal", TOKA: "Tokë" }
const statusLabels = { FOR_SALE: "Në shitje", FOR_RENT: "Me qira" }

const Home = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ city: '', type: '', status: '' })
  const gridRef = useRef(null)

  const fetchProperties = async (currentPage, currentFilters) => {
    setLoading(true)
    try {
      const params = {
        page: currentPage - 1,
        size: PAGE_SIZE,
        sort: 'id,desc',
      }
      if (currentFilters.city) params.location = currentFilters.city
      if (currentFilters.type) params.type = currentFilters.type
      if (currentFilters.status) params.status = currentFilters.status

      const res = await propertyAPI.getProperties(params)
      const data = res.data

      if (data && data.content) {
        setProperties(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        setProperties(data)
        setTotalPages(1)
        setTotalElements(data.length)
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties(page, filters)
  }, [page, filters])

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    setPage(1)
  }

  const clearFilter = (key) => handleFilterChange(key, '')

  const handlePageChange = (newPage) => {
    setPage(newPage)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeFilters = Object.entries(filters).filter(([, v]) => v)

  // Smart pagination: show at most 7 page buttons with ellipsis
  const getPaginationPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = []
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-black via-black to-gray-900 opacity-90" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-[#FFAE42] text-xs font-semibold tracking-widest uppercase border border-[#FFAE42]/30 px-4 py-1.5 rounded-full mb-5">
              Agjencia Juaj e Besuar
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
              Gjeni Pronën Tuaj <br className="hidden sm:block" />
              <span className="text-[#FFAE42]">të Ëndrrave</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Shfletoni qindra prona në Gjilan dhe rajonin e Kosovës — apartamente, shtëpi, lokale dhe toka.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/properties" className="inline-flex items-center gap-2 px-7 py-3 bg-[#FFAE42] hover:bg-[#e09a35] text-black font-bold rounded-xl transition-colors text-sm">
                <Search size={16} /> Kërkim i Avancuar
              </Link>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-7 py-3 border border-white/20 text-white hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
              >
                <SlidersHorizontal size={16} /> {showFilters ? "Mbyll Filtrat" : "Filtro Pronat"}
              </button>
            </div>
          </motion.div>
          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 pt-10 border-t border-white/10">
            {[
              { icon: Building2, label: "Prona aktive", value: `${totalElements || ''}+` },
              { icon: MapPin, label: "Qytete", value: "7+" },
              { icon: Search, label: "Shitje të suksesshme", value: "100+" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={18} className="text-[#FFAE42]" />
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick filter bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-3 items-center justify-center">
              {/* City */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <MapPin size={15} className="text-[#FFAE42] shrink-0" />
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="outline-none bg-transparent text-gray-700 text-sm cursor-pointer"
                >
                  <option value="">Të gjitha qytetet</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Type */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <Building2 size={15} className="text-[#FFAE42] shrink-0" />
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="outline-none bg-transparent text-gray-700 text-sm cursor-pointer"
                >
                  <option value="">Të gjitha llojet</option>
                  {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {/* Status */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <Filter size={15} className="text-[#FFAE42] shrink-0" />
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="outline-none bg-transparent text-gray-700 text-sm cursor-pointer"
                >
                  <option value="">Shitje & Qira</option>
                  {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => { setFilters({ city: '', type: '', status: '' }); setPage(1) }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <X size={14} /> Pastro
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex flex-wrap gap-2">
          {activeFilters.map(([key, val]) => (
            <span key={key} className="inline-flex items-center gap-1.5 bg-[#FFAE42]/10 text-[#b87a20] border border-[#FFAE42]/30 text-xs font-medium px-3 py-1 rounded-full">
              {key === 'city' ? val : key === 'type' ? typeLabels[val] : statusLabels[val]}
              <button onClick={() => clearFilter(key)} className="hover:text-[#8a5a10]"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Property grid section */}
      <section className="py-10 pb-20" ref={gridRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Duke ngarkuar...' : (
                  activeFilters.length > 0
                    ? `${totalElements} prona të gjetura`
                    : 'Pronat e Disponueshme'
                )}
              </h2>
              {!loading && totalPages > 1 && (
                <p className="text-sm text-gray-400 mt-0.5">
                  Faqja {page} nga {totalPages} — {totalElements} prona gjithsej
                </p>
              )}
            </div>
            <Link
              to="/properties"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#b87a20] hover:text-[#8a5a10] transition-colors"
            >
              Shiko të gjitha <ChevronRight size={15} />
            </Link>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-2xl shadow-sm animate-pulse" />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id || index}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-12">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} /> Pas
                  </button>

                  {getPaginationPages().map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`min-w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                          page === p
                            ? 'bg-[#FFAE42] text-black shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Para <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg font-medium">Nuk u gjet asnjë pronë.</p>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => { setFilters({ city: '', type: '', status: '' }); setPage(1) }}
                  className="mt-4 text-sm text-[#b87a20] underline"
                >
                  Pastro filtrat
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home

