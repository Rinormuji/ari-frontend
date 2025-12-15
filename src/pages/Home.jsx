import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, X } from 'lucide-react'
import { propertyAPI } from '../services/api'
import PropertyFilters from '../components/PropertyFilters'
import PropertyCard from '../components/PropertyCard'

const Home = () => {
  const [properties, setProperties] = useState([]) // të gjitha pronat
  const [filtered, setFiltered] = useState([]) // pronat e filtruar
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const itemsPerPage = 12

  // 🔹 Ndihmëse për ndarjen e location në city + neighborhood
  const mapLocation = (location) => {
    if (!location) return { city: '', neighborhood: '' }
    const parts = location.split(',', 2)
    return { city: parts[0].trim(), neighborhood: parts[1]?.trim() || '' }
  }

  // 🔹 Merr të gjitha pronat nga backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await propertyAPI.getProperties({ page: 0, size: 1000 }) // merr të gjitha pronat
        const content = res.data.content || []

        const mappedProperties = content.map((p) => {
          const { city, neighborhood } = mapLocation(p.location)
          return {
            id: p.id,
            title: p.title ?? "-",
            city,
            neighborhood,
            type: p.type ?? "-",
            status: p.status ?? "FOR_SALE",
            area: p.area != null ? Number(p.area) : null,
            price: p.price != null ? Number(p.price) : null,
            rooms: p.rooms != null ? Number(p.rooms) : null,
            floor: p.floor != null ? Number(p.floor) : null,
            hasElevator: p.hasElevator ?? false,
            hasBalcony: p.hasBalcony ?? false,
            hasGarage: p.hasGarage ?? false,
            hasGarden: p.hasGarden ?? false,
            hasParking: p.hasParking ?? false,
            images: Array.isArray(p.images) ? p.images : [],
          }
        })

        setProperties(mappedProperties)
        setFiltered(mappedProperties)
      } catch (err) {
        console.error('Error fetching properties:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 🔹 Filtër lokal
  const handleFilterChange = (filters) => {
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
    setPage(1)
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProperties = filtered.slice(startIndex, endIndex)

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
          ) : currentProperties.length > 0 ? (
            <>
              <div className="property-grid">
                {currentProperties.map((property, index) => (
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
                <div className="home-pagination flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage((s) => Math.max(1, s - 1))}
                    disabled={page <= 1}
                    className={`home-pagination-btn home-pagination-prev ${page <= 1 ? 'disabled' : ''}`}
                  >
                    ⬅ Prev
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1
                    const isActive = page === pageNumber
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNumber)}
                        className={`home-pagination-btn ${isActive ? 'active' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
                    disabled={page >= totalPages}
                    className={`home-pagination-btn home-pagination-next ${page >= totalPages ? 'disabled' : ''}`}
                  >
                    Next ➡
                  </button>
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
