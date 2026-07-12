import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  PhoneCall,
  Ruler,
  X,
} from "lucide-react";
import api, { propertyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { paths } from "../routes/paths";
import { getStatusLabel, getTypeLabel } from "../utils/propertyLabels";
import { formatPropertyViews } from "../utils/propertyViews";
import { formatCalculatedTotal, formatPropertyPrice } from "../utils/propertyPricing";
import ImageGallery from "./property-detail/ImageGallery";
import RecommendedProperties from "./property-detail/RecommendedProperties";
import {
  buildPropertyFeatures,
  configureLeafletIcons,
  getPropertyImages,
  hasMapPosition,
} from "./property-detail/propertyDetailUtils";

configureLeafletIcons();

const LoadingState = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3 text-gray-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EFD391] border-t-transparent" />
      <span className="text-sm">Duke ngarkuar pronën...</span>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <p className="text-gray-500">Pronë nuk u gjet.</p>
  </div>
);

const ContactCard = ({ contactInfo }) => {
  if (!contactInfo) return null;

  return (
    <div className="rounded-xl border border-[#EFD391]/45 bg-[#fff9ea] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F4638] text-[#EFD391]">
          <PhoneCall size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#0F4638]/55">Kontakt</span>
          <p className="mt-1 break-words text-base font-bold leading-snug text-[#0F4638]">{contactInfo}</p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ label, value }) => (
  <div className="rounded-xl border border-[#0F4638]/10 bg-white p-4 shadow-sm transition hover:border-[#EFD391]/70 hover:shadow-md">
    <span className="text-xs font-semibold uppercase tracking-wide text-[#0F4638]/40">{label}</span>
    <span className="mt-1 block text-base font-bold text-[#0F4638]">{value}</span>
  </div>
);

const PropertyDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [property, setProperty] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [sendingAppointment, setSendingAppointment] = useState(false);

  const images = useMemo(() => getPropertyImages(property), [property]);
  const features = useMemo(() => buildPropertyFeatures(property), [property]);

  useEffect(() => {
    let cancelled = false;

    const fetchProperty = async () => {
      setLoadingProperty(true);
      setCurrentIndex(0);

      try {
        const res = await propertyAPI.getProperty(id);
        let nextProperty = res.data;

        try {
          const viewRes = await propertyAPI.trackView(id);
          nextProperty = viewRes.data || nextProperty;
        } catch {
          // View tracking should not block the property page.
        }

        if (!cancelled) setProperty(nextProperty);
      } catch {
        if (!cancelled) {
          setProperty(null);
          toast.error("Gabim gjatë marrjes së pronës.");
        }
      } finally {
        if (!cancelled) setLoadingProperty(false);
      }
    };

    fetchProperty();
    return () => {
      cancelled = true;
    };
  }, [id, toast]);

  useEffect(() => {
    let cancelled = false;

    const fetchRecommended = async () => {
      try {
        const res = await propertyAPI.getRecommendations(id, 10);
        const filtered = (res.data || []).filter((item) => String(item.id) !== String(id));
        if (!cancelled) setRecommended(filtered);
      } catch (error) {
        if (!cancelled) setRecommended([]);
        console.error("Error fetching recommended properties", error);
      }
    };

    fetchRecommended();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const previousImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const openAppointmentModal = () => {
    if (!isAuthenticated) {
      toast.error("Duhet të jeni i kyçur për të kërkuar një takim.");
      return;
    }

    setAppointmentModal(true);
  };

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
      toast.success("Kërkesa u dërgua me sukses.");
      setAppointmentModal(false);
      setAppointmentDate("");
    } catch {
      toast.error("Gabim gjatë dërgimit të kërkesës.");
    } finally {
      setSendingAppointment(false);
    }
  };

  if (loadingProperty) return <LoadingState />;
  if (!property) return <EmptyState />;

  return (
    <div className="min-h-screen bg-[#f6f7f4] pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Link to={paths.properties} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4638]/60 transition-colors hover:text-[#0F4638]">
          <ChevronLeft size={16} /> Kthehu te pronat
        </Link>

        <section className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ImageGallery
            images={images}
            currentIndex={currentIndex}
            onNext={nextImage}
            onPrevious={previousImage}
            onSelect={setCurrentIndex}
            onOpen={() => setModalOpen(true)}
            title={property.title}
          />

          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[#0F4638]/55">
                <span className="rounded-full bg-[#EFD391]/25 px-2.5 py-1 text-xs font-bold text-[#7A621F]">
                  {getTypeLabel(property.type)} · {getStatusLabel(property.status)}
                </span>
                {property.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {property.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye size={13} /> {formatPropertyViews(property)} views
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#071f1a] sm:text-3xl">{property.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-[#0F4638]">
                    {formatPropertyPrice(property)}
                  </div>
                  {formatCalculatedTotal(property) && (
                    <span className="text-xs font-semibold text-[#0F4638]/45">{formatCalculatedTotal(property)}</span>
                  )}
                </div>
                {property.area && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#0F4638]/70 shadow-sm">
                    <Ruler size={16} className="text-[#D9BF7B]" /> {property.area} m²
                  </div>
                )}
              </div>
            </div>

            {features.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <FeatureCard key={`${feature.label}-${feature.value}`} {...feature} />
                ))}
              </div>
            )}

            <ContactCard contactInfo={property.contactInfo} />

            <button
              type="button"
              onClick={openAppointmentModal}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#EFD391] py-3.5 font-bold text-black shadow-sm transition-colors hover:bg-[#D9BF7B]"
            >
              <CalendarCheck size={18} /> Kërko një takim
            </button>
          </div>
        </section>

        {property.description && (
          <section className="mb-10 rounded-2xl border border-[#0F4638]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-[#071f1a]">Përshkrimi</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-[#0F4638]/70">{property.description}</p>
          </section>
        )}

        {hasMapPosition(property) && (
          <section className="z-20 mb-10 rounded-2xl border border-[#0F4638]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-[#071f1a]">Harta e pronës</h2>
            <div className="z-20 h-72 overflow-hidden rounded-xl">
              <MapContainer
                center={[property.latitude, property.longitude]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 20 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                <Marker position={[property.latitude, property.longitude]}>
                  <Popup>{property.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </section>
        )}

        <RecommendedProperties properties={recommended} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={() => setModalOpen(false)}>
          <button type="button" className="absolute right-4 top-4 z-[10000] text-white transition hover:text-gray-300" onClick={() => setModalOpen(false)} aria-label="Mbyll galerinë">
            <X size={28} />
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); previousImage(); }} className="absolute left-4 top-1/2 z-[10000] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Foto e mëparshme">
            <ChevronLeft size={24} />
          </button>
          <img src={images[currentIndex]} className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" alt={property.title || ""} onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => { event.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 z-[10000] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Foto tjetër">
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {appointmentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onClick={() => setAppointmentModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Kërko një takim</h2>
              <button type="button" onClick={() => setAppointmentModal(false)} className="text-gray-400 transition hover:text-gray-700" aria-label="Mbyll">
                <X size={20} />
              </button>
            </div>
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              min={new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16)}
              className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#EFD391] focus:ring-2 focus:ring-[#EFD391]/40"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setAppointmentModal(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                Anulo
              </button>
              <button type="button" onClick={sendAppointmentRequest} disabled={sendingAppointment} className="flex-1 rounded-xl bg-[#EFD391] py-2.5 text-sm font-semibold text-black transition hover:bg-[#D9BF7B] disabled:opacity-60">
                {sendingAppointment ? "Dërgohet..." : "Dërgo kërkesën"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
