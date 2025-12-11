import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, X } from 'lucide-react'
import { propertyAPI } from '../services/api'
import PropertyFilters from '../components/PropertyFilters'
import PropertyCard from '../components/PropertyCard'

const Home = () => {
  const [properties, setProperties] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 🔹 Ndihmëse për ndarjen e location në city + neighborhood
  const mapLocation = (location) => {
    if (!location) return { city: '', neighborhood: '' }
    const parts = location.split(',', 2)
    return { city: parts[0].trim(), neighborhood: parts[1]?.trim() || '' }
  }

  // 🔹 Merr pronat nga API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await propertyAPI.getProperties({ page: page - 1, size: 12 })
        const content = res.data.content || []

        // 🔹 Map pronat për t’i pasur të gjitha fushat që duam
        const mappedProperties = content.map((p) => {
          const { city, neighborhood } = mapLocation(p.location)
          return {
            id: p.id,
            title: p.title,
            city,
            neighborhood,
            type: p.type,
            status: p.status,
            area: p.area,
            price: p.price,
            rooms: p.rooms ?? 0,
            floor: p.floor ?? 0,
            images: p.images ?? [],
          }
        })

        setProperties(mappedProperties)
        setFiltered(mappedProperties)
        setTotalPages(res.data.totalPages || 1)
      } catch (err) {
        console.error('Error fetching properties:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  // 🔹 Filtër lokal (deri sa backend të ofrojë filtrimin)
  const handleFilterChange = (filters) => {
    if (
      !filters.city &&
      !filters.neighborhood &&
      !filters.type &&
      !filters.status &&
      !filters.minArea &&
      !filters.floor &&
      !filters.rooms
    ) {
      setFiltered(properties)
      return
    }

    const filteredData = properties.filter((p) => {
      if (filters.city && p.city !== filters.city) return false
      if (filters.neighborhood && !p.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())) return false
      if (filters.type && p.type !== filters.type) return false
      if (filters.status && p.status !== filters.status) return false
      if (filters.minArea && p.area < Number(filters.minArea)) return false
      if (filters.floor && p.floor !== Number(filters.floor)) return false
      if (filters.rooms && p.rooms < Number(filters.rooms)) return false
      return true
    })
    
    setFiltered(filteredData)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🔹 Butoni për të shfaqur/mbyllur filtrat */}
      <div className="filters-section flex justify-center mt-28 mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200"
        >
          {showFilters ? (
            <>
              <X className="w-5 h-5" /> Mbyll Filtrat
            </>
          ) : (
            <>
              <Filter className="w-5 h-5" /> Shfaq Filtrat
            </>
          )}
        </button>
      </div>

      {/* 🔹 Seksioni i filtrave */}
      <div className="filters-wrapper">
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-12 px-4"
          >
            <div className="w-full max-w-7xl">
              <PropertyFilters onFilterChange={handleFilterChange} />
            </div>
          </motion.div>
        )}
      </div>

      {/* 🔹 Kartat e pronave */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 bg-gray-200 rounded-2xl shadow-md animate-pulse"
                ></div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="property-grid">
                {filtered.map((property, index) => (
                  <motion.div
                    key={property.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))}
              </div>

              {/* 🔹 Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-600 text-lg mt-10">
              Nuk u gjet asnjë pronë.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
