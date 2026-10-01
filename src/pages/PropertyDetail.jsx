import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  Mail,
  MapPin,
  PhoneCall,
  Ruler,
  X,
} from "lucide-react";
import { appointmentAPI, propertyAPI } from "../services/api";
import { useAuth } from "../context/authContextValue";
import { useToast } from "../context/toastContextValue";
import { useImageSwipe } from "../hooks/useImageSwipe";
import { paths } from "../routes/paths";
import { getStatusLabel, getTypeLabel } from "../utils/propertyLabels";
import { formatPropertyViews } from "../utils/propertyViews";
import { formatCalculatedTotal, formatPropertyPrice } from "../utils/propertyPricing";
import { extractContactPhones, formatPropertyPhone } from "../utils/propertyContact";
import { parsePropertyLocation } from "../utils/propertyLocation";
import { contactInfo as agencyContactInfo } from "../utils/contactInfo";
import ImageGallery from "./property-detail/ImageGallery";
import FavoriteButton from "../components/FavoriteButton";
import RecommendedProperties from "./property-detail/RecommendedProperties";
import {
  buildPropertyFeatures,
  configureLeafletIcons,
  getGoogleMapsUrl,
  getPropertyImages,
  hasMapPosition,
} from "./property-detail/propertyDetailUtils";

configureLeafletIcons();

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

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
  const phones = contactInfo.split("\n").filter(Boolean);

  return (
    <div className="rounded-xl border border-[#0F4638]/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F4638] text-[#EFD391]">
          <PhoneCall size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-[#0F4638]">Kontakto për pronën</h2>
          <p className="mt-0.5 text-xs text-[#0F4638]/55">Zgjidh një numër për të telefonuar</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {phones.map((phone, index) => {
          const normalized = phone.replace(/[^+\d]/g, "");
          const label = agencyContactInfo.phones.find(({ href }) => href === `tel:${normalized}`)?.label || `Kontakt ${index + 1}`;
          return (
            <a key={`${normalized}-${index}`} href={`tel:${normalized}`}
              className="flex min-h-16 items-center gap-3 rounded-xl border border-[#0F4638]/10 bg-[#f5f8f5] px-3.5 py-3 text-[#0F4638] transition-colors hover:border-[#D9BF7B] hover:bg-[#fff9ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4638]"
              aria-label={`${label}: ${formatPropertyPhone(phone)}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F4638] shadow-sm">
                <PhoneCall size={16} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-[#0F4638]/50">{label}</span>
                <span className="block whitespace-nowrap text-sm font-bold tracking-wide">{formatPropertyPhone(phone)}</span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

const FeatureCard = ({ label, value }) => (
  <div className="min-w-0 rounded-xl border border-[#0F4638]/10 bg-white p-3 shadow-sm transition hover:border-[#EFD391]/70 hover:shadow-md sm:p-4">
    <span className="block break-words text-[10px] font-semibold uppercase tracking-wide text-[#0F4638]/50 sm:text-xs">{label}</span>
    <span className="mt-1 block break-words text-sm font-bold text-[#0F4638] sm:text-base">{value}</span>
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
  const [appointmentDay, setAppointmentDay] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [sendingAppointment, setSendingAppointment] = useState(false);
  const [detailsMaxHeight, setDetailsMaxHeight] = useState(null);
  const galleryRef = useRef(null);
  const summaryRef = useRef(null);
  const images = useMemo(() => getPropertyImages(property), [property]);
  const features = useMemo(() => buildPropertyFeatures(property), [property]);

  useEffect(() => {
    if (!property || !galleryRef.current || !summaryRef.current) return undefined;

    const updateDetailsHeight = () => {
      if (!galleryRef.current || !summaryRef.current) return;
      const available = galleryRef.current.getBoundingClientRect().height
        - summaryRef.current.getBoundingClientRect().height - 20;
      const next = Math.max(180, Math.round(available));
      setDetailsMaxHeight((previous) => previous === next ? previous : next);
    };

    const observer = new ResizeObserver(updateDetailsHeight);
    observer.observe(galleryRef.current);
    observer.observe(summaryRef.current);
    updateDetailsHeight();
    return () => observer.disconnect();
  }, [property]);

  useEffect(() => {
    let cancelled = false;

    const fetchProperty = async () => {
      setLoadingProperty(true);
      setCurrentIndex(0);

      try {
        const res = await propertyAPI.getProperty(id);
        if (!cancelled) setProperty(res.data);

        // A view count write should not hold up the property page.
        propertyAPI.trackView(id)
          .then((viewRes) => {
            if (!cancelled) {
              setProperty((current) => current?.id === res.data.id
                ? { ...current, views: viewRes.data.views }
                : current);
            }
          })
          .catch(() => {});
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
      setRecommended([]);
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
  const modalSwipeHandlers = useImageSwipe({ enabled: modalOpen && images.length > 1, onNext: nextImage, onPrevious: previousImage });

  useEffect(() => {
    if (!modalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setModalOpen(false);
      if (images.length < 2) return;
      if (event.key === "ArrowRight") setCurrentIndex((prev) => (prev + 1) % images.length);
      if (event.key === "ArrowLeft") setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, images.length]);

  const openAppointmentModal = () => {
    if (!isAuthenticated) {
      toast.error("Duhet të jeni i kyçur për të kërkuar një takim.");
      return;
    }

    setAppointmentModal(true);
  };

  useEffect(() => {
    let cancelled = false;
    if (!appointmentModal || !property?.id) return undefined;
    appointmentAPI.getBookedSlots()
      .then((response) => {
        if (!cancelled) setBookedSlots(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) setBookedSlots([]);
      });
    return () => { cancelled = true; };
  }, [appointmentModal, property?.id]);

  const isBooked = (time) => bookedSlots.some(
    (slot) => slot.slice(0, 16) === `${appointmentDay}T${time}`
  );

  useEffect(() => {
    const slotIsBooked = (time) => bookedSlots.some(
      (slot) => slot.slice(0, 16) === `${appointmentDay}T${time}`
    );
    if (appointmentDay && slotIsBooked(appointmentTime)) {
      const availableTime = TIME_SLOTS.find((time) => !slotIsBooked(time));
      if (availableTime) setAppointmentTime(availableTime);
    }
  }, [appointmentDay, appointmentTime, bookedSlots]);

  const sendAppointmentRequest = async () => {
    if (!appointmentDay) {
      toast.error("Zgjidhni një datë.");
      return;
    }

    if (isBooked(appointmentTime)) {
      toast.error("Kjo orë është rezervuar. Zgjidhni një orar tjetër.");
      return;
    }

    const appointmentDate = `${appointmentDay}T${appointmentTime}:00`;
    const selectedDate = new Date(appointmentDate);
    const minAllowed = new Date(Date.now() + 3 * 60 * 60 * 1000);
    if (selectedDate < minAllowed) {
      toast.error("Takimi duhet të jetë të paktën 3 orë nga tani.");
      return;
    }

    setSendingAppointment(true);
    try {
      await appointmentAPI.create(property.id, appointmentDate);
      toast.success("Kërkesa u dërgua me sukses.");
      setAppointmentModal(false);
      setAppointmentDay("");
      setAppointmentTime("10:00");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gabim gjatë dërgimit të kërkesës.");
    } finally {
      setSendingAppointment(false);
    }
  };

  if (loadingProperty) return <LoadingState />;
  if (!property) return <EmptyState />;
  const { city, area, areaType } = parsePropertyLocation(property);

  return (
    <div className="min-h-screen bg-[#f6f7f4] pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Link to={paths.properties} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4638]/60 transition-colors hover:text-[#0F4638]">
          <ChevronLeft size={16} /> Kthehu te pronat
        </Link>

        <section className="mb-6 grid grid-cols-1 items-start gap-x-8 gap-y-5 lg:grid-cols-2">
          <div ref={galleryRef} className="min-w-0 lg:col-start-1 lg:row-start-1">
            <ImageGallery
              images={images}
              currentIndex={currentIndex}
              onNext={nextImage}
              onPrevious={previousImage}
              onSelect={setCurrentIndex}
              onOpen={() => setModalOpen(true)}
              title={property.title}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-5 lg:col-start-2 lg:row-start-1">
            <div ref={summaryRef}>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[#0F4638]/55">
                <span className="rounded-full bg-[#EFD391]/25 px-2.5 py-1 text-xs font-bold text-[#7A621F]">
                  {getTypeLabel(property.type)} · {getStatusLabel(property.status)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={13} /> {formatPropertyViews(property)} views
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#071f1a] sm:text-3xl">{property.title}</h1>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-[#0F4638]/10 bg-white px-3 py-2.5 shadow-sm min-[360px]:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div className="col-span-2 min-w-0 min-[360px]:col-span-1">
                  <div className="break-words text-lg font-bold text-[#0F4638] sm:text-2xl">
                    {formatPropertyPrice(property)}
                  </div>
                  {formatCalculatedTotal(property) && (
                    <span className="block text-xs font-semibold text-[#0F4638]/45">{formatCalculatedTotal(property)}</span>
                  )}
                </div>
                {property.area && (
                  <div className="flex items-center gap-1.5 border-t border-[#0F4638]/10 pt-2 text-xs font-semibold whitespace-nowrap text-[#0F4638]/75 min-[360px]:border-t-0 min-[360px]:border-l min-[360px]:pt-0 min-[360px]:pl-2 sm:pl-3 sm:text-sm">
                    <Ruler size={16} className="shrink-0 text-[#D9BF7B]" /> {property.area} m²
                  </div>
                )}
                <div className="border-t border-[#0F4638]/10 pt-2 min-[360px]:border-t-0 min-[360px]:border-l min-[360px]:pt-0 min-[360px]:pl-2 sm:pl-3">
                  <FavoriteButton propertyId={property.id} />
                </div>
              </div>
              {(city || area) && (
                <div className={`mt-3 grid gap-2 ${city && area ? "grid-cols-2" : "grid-cols-1"}`} aria-label="Lokacioni i pronës">
                  {city && (
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#0F4638]/10 bg-white px-3 py-3 shadow-sm">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf2ee] text-[#0F4638]">
                        <Building2 size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#0F4638]/50">Komuna</span>
                        <span className="block break-words text-sm font-bold text-[#0F4638]">{city}</span>
                      </span>
                    </div>
                  )}
                  {area && (
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#D9BF7B]/40 bg-[#fffaf0] px-3 py-3 shadow-sm">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f7e9c3] text-[#886922]">
                        <MapPin size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#0F4638]/50">{areaType === "village" ? "Fshati" : "Lagja"}</span>
                        <span className="block break-words text-sm font-bold text-[#0F4638]">{area}</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {features.length > 0 && (
              <section aria-label="Detajet e pronës"
                className="max-h-[65vh] overflow-y-auto overscroll-contain pr-1.5 sm:max-h-[520px] lg:max-h-[var(--details-max-height)] lg:pr-2"
                style={detailsMaxHeight === null ? undefined : { "--details-max-height": `${detailsMaxHeight}px` }}>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {features.map((feature) => (
                    <FeatureCard key={`${feature.label}-${feature.value}`} {...feature} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <ContactCard contactInfo={extractContactPhones(property.contactInfo)} />
          </div>

          <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-[#0F4638]/10 bg-white p-4 shadow-sm sm:p-5 lg:col-start-2 lg:row-start-2">
            <div>
              <h2 className="text-sm font-bold text-[#0F4638]">Interesohesh për këtë pronë?</h2>
              <p className="mt-1 text-xs text-[#0F4638]/55">Cakto një takim ose na shkruaj drejtpërdrejt.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={openAppointmentModal}
                className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#EFD391] px-3 py-2 text-sm font-bold text-black transition-colors hover:bg-[#D9BF7B]">
                <CalendarCheck size={17} /> Kërko një takim
              </button>
              <a href={`mailto:${agencyContactInfo.email}?subject=${encodeURIComponent(`Pyetje për pronën #${property.id}: ${property.title}`)}`}
                className="flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-xl border border-[#0F4638]/15 bg-[#f5f8f5] px-3 py-2 text-[#0F4638] transition-colors hover:border-[#D9BF7B] hover:bg-[#fff9ea]">
                <Mail size={17} className="shrink-0" aria-hidden="true" />
                <span className="min-w-0 text-left"><span className="block text-sm font-bold">Kontakto me email</span><span className="block break-all text-[11px]">{agencyContactInfo.email}</span></span>
              </a>
            </div>
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
                center={[Number(property.latitude), Number(property.longitude)]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 20 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                <Marker position={[Number(property.latitude), Number(property.longitude)]}>
                  <Popup>{property.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#EFD391]/45 bg-[#fff9ea] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F4638] text-[#EFD391]">
                  <MapPin size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0F4638]">Vendndodhja e pronës</p>
                </div>
              </div>
              <a href={getGoogleMapsUrl(property)} target="_blank" rel="noopener noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0F4638] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#17614e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4638]"
                aria-label={`Shih vendndodhjen e ${property.title || "pronës"} në Google Maps`}>
                Shih në Google Maps <ExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </section>
        )}

        <RecommendedProperties properties={recommended} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex touch-pan-y items-center justify-center bg-black/90" onClick={() => setModalOpen(false)} {...modalSwipeHandlers}>
          <button type="button" className="absolute right-4 top-4 z-[10000] text-white transition hover:text-gray-300" onClick={() => setModalOpen(false)} aria-label="Mbyll galerinë">
            <X size={28} />
          </button>
          {images.length > 1 && (
            <button type="button" onClick={(event) => { event.stopPropagation(); previousImage(); }} className="absolute left-4 top-1/2 z-[10000] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="Foto e mëparshme">
              <ChevronLeft size={24} />
            </button>
          )}
          <img src={images[currentIndex]} draggable="false" className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" alt={property.title || ""} onClick={(event) => event.stopPropagation()} />
          {images.length > 1 && (
            <button type="button" onClick={(event) => { event.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 z-[10000] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="Foto tjetër">
              <ChevronRight size={24} />
            </button>
          )}
          {images.length > 1 && (
            <span aria-live="polite" className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
              {currentIndex + 1} / {images.length}
            </span>
          )}
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
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  value={appointmentDay}
                  onChange={(event) => setAppointmentDay(event.target.value)}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#EFD391] focus:ring-2 focus:ring-[#EFD391]/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Ora</label>
                <select
                  value={appointmentTime}
                  onChange={(event) => setAppointmentTime(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#EFD391] focus:ring-2 focus:ring-[#EFD391]/40"
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={time} value={time} disabled={isBooked(time)}>
                      {time}{isBooked(time) ? " (e rezervuar)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
