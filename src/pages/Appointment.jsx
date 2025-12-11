import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { propertyAPI } from '../services/api'

const Appointment = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedProperty, setSelectedProperty] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      // This would be implemented when we have the appointment API
      setAppointments([])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // This would call the appointment API
      setMessage('Kërkesa për takim u dërgua me sukses!')
      setShowForm(false)
      setSelectedDate('')
      setSelectedTime('')
      setSelectedProperty('')
    } catch (error) {
      setMessage('Gabim në dërgimin e kërkesës. Provo përsëri.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100'
      case 'REJECTED':
        return 'text-red-600 bg-red-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5" />
      case 'PENDING':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Takimet e Mia
            </h1>
            <p className="text-xl text-gray-600">
              Menaxhoni takimet tuaja për vizita të pronave
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Kërko Takim të Ri
              </h3>

              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Kërko Takim të Ri
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ora
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Zgjidhni orën</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prona
                    </label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Zgjidhni pronën</option>
                      <option value="1">Banesë moderne në qendër</option>
                      <option value="2">Shtëpi familjare me oborr</option>
                      <option value="3">Lokal tregtar në qendër</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold disabled:opacity-50"
                    >
                      {submitting ? 'Duke dërguar...' : 'Dërgo Kërkesën'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                    >
                      Anulo
                    </button>
                  </div>
                </form>
              )}

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-xl text-sm ${
                    message.includes('sukses') 
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Takimet e Mia
              </h3>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {appointment.propertyTitle}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {appointment.date} në {appointment.time}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span>{appointment.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nuk keni takime
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Klikoni "Kërko Takim të Ri" për të krijuar një takim të ri.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Appointment



