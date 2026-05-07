import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronLeft, ChevronRight, X, CalendarCheck, MapPin, Euro, Ruler } from "lucide-react";
import { propertyAPI } from "../services/api";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const PropertyDetailSoftApple = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const [appointmentModal, setAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [sendingAppointment, setSendingAppointment] = useState(false);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await propertyAPI.getRecommendations(id, 10);
          // fetch(`/api/properties/${id}/nearby?radiusKm=10`);
        // if (res.ok) {
        //   const data = await res.json();
  
          // përjashto pronën që jemi duke parë
          const filtered = res.data.filter(p => String(p.id) !== String(id));
  
          setRecommended(filtered);
        // }
      } catch (e) {
        console.error("Error fetching recommended properties", e);
      }
    };
  
    fetchRecommended();
  }, [id]);
  


  delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
  // FETCH PROPERTY
  useEffect(() => {
    const fetchProperty = async () => {
       
      try {
        const res = await propertyAPI.getProperty(id);
          // fetch(`/api/properties/${id}`);
        // if (!res.ok) throw new Error("Failed to fetch property");

        // const data = await res.json();
        setProperty(res.data);
      } catch (err) {
        toast.error("Gabim gjatë marrësjes së pronës!");
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loadingProperty) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFAE42] border-t-transparent animate-spin" />
        <span className="text-sm">Duke ngarkuar pronën...</span>
      </div>
    </div>
  );
  if (!property) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Pronë nuk u gjet.</p>
    </div>
  );

  // FIX FOR SAFE IMAGE NAVIGATION
  const nextImage = () => {
    if (!property?.images?.length) return;
    setCurrentIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    if (!property?.images?.length) return;
    setCurrentIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  // Check Login Before Appointment
  const handleAppointmentClick = () => {
    if (!isAuthenticated) {
      toast.error("Duhet të jeni i kyqur për të kërkuar një takim.");
      return;
    }
    setAppointmentModal(true);
  };

  const buildFeatures = () => {
    const f = [];
  
    // Fusha të përbashkëta
    if (property.area) f.push({ label: "Sipërfaqja", value: `${property.area} m²` });
    if (property.status)
      f.push({
        label: "Statusi",
        value: property.status === "FOR_SALE" ? "Në shitje" : "Me qira",
      });
  
    // ➤ BANESA
    if (property.type === "BANESA") {
      if (property.rooms) f.push({ label: "Dhomat", value: property.rooms });
      if (property.bathrooms) f.push({ label: "Banjot", value: property.bathrooms });
      if (property.floor) f.push({ label: "Kati", value: property.floor });
      if (property.hasElevator !== null)
        f.push({ label: "Ashensor", value: property.hasElevator ? "Po" : "Jo" });
      if (property.hasBalcony !== null)
        f.push({ label: "Ballkon", value: property.hasBalcony ? "Po" : "Jo" });
    }
  
    // ➤ SHTEPI
    if (property.type === "SHTEPI") {
      if (property.floors) f.push({ label: "Kate", value: property.floors });
      if (property.hasGarden !== null)
        f.push({ label: "Kopsht", value: property.hasGarden ? "Po" : "Jo" });
      if (property.hasGarage !== null)
        f.push({ label: "Garazh", value: property.hasGarage ? "Po" : "Jo" });
      if (property.bathrooms) f.push({ label: "Banjot", value: property.bathrooms });
    }
  
    // ➤ LOKALE
    if (property.type === "LOKALE") {
      if (property.floor) f.push({ label: "Kati", value: property.floor });
      if (property.hasParking !== null)
        f.push({ label: "Parking", value: property.hasParking ? "Po" : "Jo" });
    }
  
    // ➤ TOKA
    if (property.type === "TOKA") {
      if (property.hasInfrastructure !== null)
        f.push({
          label: "Infrastrukturë",
          value: property.hasInfrastructure ? "Po" : "Jo",
        });
    }
  
    return f;
  };
  
  const features = buildFeatures();
  

  // SEND APPOINTMENT
  const sendAppointmentRequest = async () => {
    if (!appointmentDate) {
      toast.error("Zgjidhni një datë.");
      return;
    }
    const selectedDate = new Date(appointmentDate);
    const minAllowed = new Date(Date.now() + 3 * 60 * 60 * 1000);
    if (selectedDate < minAllowed) {
      toast.error("Takimi duhet të jetë të paktën 3 orë nga tani.");
      return;
    }
    setSendingAppointment(true);
    try {
      await api.post("/appointments", {
        propertyId: property.id,
        date: appointmentDate,
      });
      toast.success("Kërkesa u dërgua me sukses!");
      setAppointmentModal(false);
      setAppointmentDate("");
    } catch (e) {
      toast.error("Gabim gjatë dërgimit të kërkesës.");
    } finally {
      setSendingAppointment(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">

        {/* Breadcrumb */}
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ChevronLeft size={16} /> Kthehu te pronat
        </Link>

        {/* Main grid: images + info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* LEFT — Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-4/3 cursor-pointer" onClick={() => property.images?.length && setModalOpen(true)}>
              <img
                src={property.images?.[currentIndex] || "/placeholder.png"}
                alt="Foto e pronës"
                className="w-full h-full object-cover"
              />
              {property.images?.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                {currentIndex + 1} / {property.images?.length || 1}
              </div>
            </div>
            {/* Thumbnails */}
            {property.images?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setCurrentIndex(i)}
                    alt=""
                    className={`h-16 w-24 object-cover rounded-xl cursor-pointer shrink-0 transition-all ${i === currentIndex ? "ring-2 ring-[#FFAE42] opacity-100" : "opacity-60 hover:opacity-80"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="px-2.5 py-1 bg-[#FFAE42]/10 text-[#FFAE42] rounded-full font-medium text-xs">
                  {property.type} · {property.status === "FOR_SALE" ? "Në shitje" : "Me qira"}
                </span>
                {property.city && (
                  <span className="flex items-center gap-1"><MapPin size={13} />{property.city}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-2xl font-bold text-blue-600">
                  <Euro size={20} />{property.price?.toLocaleString()} €
                </div>
                {property.area && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <Ruler size={16} />{property.area} m²
                  </div>
                )}
              </div>
            </div>

            {/* Features grid */}
            {features.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {features.map((f, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 font-medium">{f.label}</span>
                    <span className="text-sm font-semibold text-gray-800">{f.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Appointment CTA */}
            <button
              onClick={handleAppointmentClick}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#FFAE42] hover:bg-[#e09a35] text-black font-semibold rounded-xl transition-colors mt-auto"
            >
              <CalendarCheck size={18} /> Kërko një takim
            </button>
          </div>
        </div>

        {/* Description + Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {property.description && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Përshkrimi</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}
          {property.contactInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Kontakt</h2>
              <p className="text-sm text-gray-600">{property.contactInfo}</p>
            </div>
          )}
        </div>

        {/* Map */}
        {property.latitude != null && property.longitude != null && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10 z-20">
            <h2 className="font-bold text-gray-900 mb-4">Harta e pronës</h2>
            <div className="rounded-xl overflow-hidden h-72 z-20">
              <MapContainer center={[property.latitude, property.longitude]} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: "20" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <Marker position={[property.latitude, property.longitude]}>
                  <Popup>{property.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-5">Prona të rekomanduara</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommended.map((p) => (
                <Link key={p.id} to={`/properties/${p.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-36 overflow-hidden">
                    <img src={p.images?.[0] || "/placeholder.png"} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.title}</p>
                    <p className="text-blue-600 font-bold text-sm mt-1">{p.price?.toLocaleString()} €</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.area} m² · {p.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setModalOpen(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10" onClick={() => setModalOpen(false)}>
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition z-10">
            <ChevronLeft size={24} />
          </button>
          <img src={property.images?.[currentIndex]} className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" alt="" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition z-10">
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Appointment modal */}
      {appointmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setAppointmentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Kërko një takim</h2>
              <button onClick={() => setAppointmentModal(false)} className="text-gray-400 hover:text-gray-700 transition"><X size={20} /></button>
            </div>
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFAE42]/40 focus:border-[#FFAE42] transition mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setAppointmentModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Anulo</button>
              <button onClick={sendAppointmentRequest} disabled={sendingAppointment} className="flex-1 py-2.5 bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-60 text-black font-semibold rounded-xl text-sm transition">
                {sendingAppointment ? "Dërgohet..." : "Dërgo kërkesën"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailSoftApple;
