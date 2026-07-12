import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Building2, MapPin, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { propertyAPI } from '../services/api'
import PropertyCard from '../components/PropertyCard'
import { paths } from '../routes/paths'

const PAGE_SIZE = 4

const Home = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalElements, setTotalElements] = useState(0)

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = {
        page: 0,
        size: PAGE_SIZE,
        sort: 'id,desc',
      }

      const res = await propertyAPI.getProperties(params)
      const data = res.data

      if (data && data.content) {
        setProperties(data.content)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        setProperties(data.slice(0, PAGE_SIZE))
        setTotalElements(data.length)
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-[#0F4638] text-white overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#0A3028] via-[#0F4638] to-[#184F41] opacity-95" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-[#EFD391] text-xs font-semibold tracking-widest uppercase border border-[#EFD391]/30 px-4 py-1.5 rounded-full mb-5">
              Agjencia Juaj e Besuar
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
              Gjeni Pronën Tuaj <br className="hidden sm:block" />
              <span className="text-[#EFD391]">të Ëndrrave</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Shfletoni qindra prona në Gjilan dhe rajonin e Kosovës — apartamente, shtëpi, lokale dhe toka.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={paths.properties} className="inline-flex items-center gap-2 px-7 py-3 bg-[#EFD391] hover:bg-[#D9BF7B] text-black font-bold rounded-xl transition-colors text-sm">
                <Search size={16} /> Kërkim i Avancuar
              </Link>
              <Link
                to={paths.properties}
                className="inline-flex items-center gap-2 px-7 py-3 border border-[#EFD391]/35 bg-white/5 text-[#EFD391] hover:bg-[#EFD391]/10 rounded-xl transition-colors text-sm font-semibold"
              >
                <SlidersHorizontal size={16} /> Filtro Pronat
              </Link>
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
                <Icon size={18} className="text-[#EFD391]" />
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property grid section */}
      <section className="py-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Duke ngarkuar...' : 'Pronat e Disponueshme'}
              </h2>
            </div>
            <Link
              to={paths.properties}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#0F4638] hover:text-[#0A3028] transition-colors"
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
            </>
          ) : (
            <div className="text-center py-20">
              <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg font-medium">Nuk u gjet asnjë pronë.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home

