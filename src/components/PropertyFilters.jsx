import { useState } from 'react'
import {
  MapPin,
  Home,
  Building2,
  ListFilter,
  Bed,
  Square,
} from 'lucide-react'

const PropertyFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    city: '',
    neighborhood: '',
    type: '',
    status: '',
    rooms: '',
    floor: '',
    minArea: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...filters, [name]: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleReset = () => {
    const reset = {
      city: '',
      neighborhood: '',
      type: '',
      status: '',
      rooms: '',
      floor: '',
      minArea: '',
    }
    setFilters(reset)
    onFilterChange(reset)
  }

  return (
    <div className="w-full bg-[#f8fafc] border-b border-gray-200 shadow-sm mt-28 filters-container max-w-7xl mx-auto px-6 py-5">
      
      {/* Vendi */}
      <div className="flex items-center gap-2 filter-item">
        <MapPin className="w-4 h-4 text-blue-500" />
        <select
          name="city"
          value={filters.city}
          onChange={handleChange}
          className="outline-none bg-transparent"
        >
          <option value="">Vendi</option>
          <option value="Prishtinë">Prishtinë</option>
          <option value="Pejë">Pejë</option>
          <option value="Prizren">Prizren</option>
          <option value="Ferizaj">Ferizaj</option>
          <option value="Mitrovicë">Mitrovicë</option>
          <option value="Gjilan">Gjilan</option>
          <option value="Gjakovë">Gjakovë</option>
        </select>
      </div>

      {/* Lagjia */}
      <div className="flex items-center gap-2 filter-item">
        <MapPin className="w-4 h-4 text-blue-500" />
        <input
          type="text"
          name="neighborhood"
          placeholder="Lagjia"
          value={filters.neighborhood}
          onChange={handleChange}
          className="outline-none bg-transparent text-sm text-gray-700 w-28"
        />
      </div>

      {/* Lloji */}
      <div className="flex items-center gap-2 filter-item">
        <Home className="w-4 h-4 text-blue-500" />
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="outline-none bg-transparent text-sm text-gray-700"
        >
          <option value="">Lloji</option>
          <option value="BANESA">Banesa</option>
          <option value="SHTEPI">Shtëpi</option>
          <option value="TOKA">Tokë</option>
          <option value="LOKALE">Lokale</option>
        </select>
      </div>

      {/* Statusi */}
      <div className="flex items-center gap-2 filter-item">
        <ListFilter className="w-4 h-4 text-blue-500" />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="outline-none bg-transparent text-sm text-gray-700"
        >
          <option value="">Të gjitha postimet</option>
          <option value="FOR_SALE">Në shitje</option>
          <option value="FOR_RENT">Me qira</option>
        </select>
      </div>

      {/* Dhoma */}
      <div className="flex items-center gap-2 filter-item">
        <Bed className="w-4 h-4 text-blue-500" />
        <select
          name="rooms"
          value={filters.rooms}
          onChange={handleChange}
          className="outline-none bg-transparent text-sm text-gray-700"
        >
          <option value="">Dhoma</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{`${r}+`}</option>
          ))}
        </select>
      </div>

      {/* Kati */}
      <div className="flex items-center gap-2 filter-item">
        <Building2 className="w-4 h-4 text-blue-500" />
        <select
          name="floor"
          value={filters.floor}
          onChange={handleChange}
          className="outline-none bg-transparent text-sm text-gray-700"
        >
          <option value="">Kati</option>
          <option value="0">Përdhese</option>
          {[1, 2, 3, 4, 5].map((f) => (
            <option key={f} value={f}>{`Kati ${f}`}</option>
          ))}
        </select>
      </div>

      {/* Sipërfaqja */}
      <div className="flex items-center gap-2 filter-item">
        <Square className="w-4 h-4 text-blue-500" />
        <input
          type="number"
          name="minArea"
          placeholder="min m²"
          value={filters.minArea}
          onChange={handleChange}
          className="outline-none bg-transparent text-sm text-gray-700 w-20"
        />
      </div>

    </div>
  )
}

export default PropertyFilters
