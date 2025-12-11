import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const PropertyDetailSoftApple = () => {
  const { id } = useParams();

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
        const res = await fetch(`/api/properties/${id}/nearby?radiusKm=10`);
        if (res.ok) {
          const data = await res.json();
  
          // përjashto pronën që jemi duke parë
          const filtered = data.filter(p => String(p.id) !== String(id));
  
          setRecommended(filtered);
        }
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
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) throw new Error("Failed to fetch property");

        const data = await res.json();
        setProperty(data);
      } catch (err) {
        alert("Gabim gjatë marrjes së pronës!");
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loadingProperty) return <p>Ngarkohet prona...</p>;
  if (!property) return <p>Pronë nuk u gjet.</p>;

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
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Duhet të jeni i loguar ose i regjistruar për të kërkuar një takim.");
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
      alert("Zgjidhni një datë.");
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const minAllowed = new Date(Date.now() + 3 * 60 * 60 * 1000);

    if (selectedDate < minAllowed) {
      alert("Takimi duhet të jetë të paktën 3 orë nga tani.");
      return;
    }

    setSendingAppointment(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property.id,
          date: appointmentDate,
        }),
      });

      if (res.ok) {
        alert("Kërkesa u dërgua me sukses!");
        setAppointmentModal(false);
        setAppointmentDate("");
      } else {
        alert("Gabim gjatë dërgimit të kërkesës.");
      }
    } catch (e) {
      alert("Gabim me serverin.");
    } finally {
      setSendingAppointment(false);
    }
  };

  return (
    <div className="propertySoftApple-wrapper">
      
      {/* MAIN SECTION */}
      <div className="propertySoftApple-container">
        
        {/* LEFT IMAGES */}
        <div className="propertySoftApple-left">
          <div className="propertySoftApple-slider">

            <button className="softApple-arrow left" onClick={prevImage}>‹</button>

            <img
              src={property.images?.[currentIndex] || "/placeholder.png"}
              className="propertySoftApple-mainImg"
              onClick={() => property.images?.length && setModalOpen(true)}
              alt="Foto e pronës"
            />

            <button className="softApple-arrow right" onClick={nextImage}>›</button>
          </div>

          {/* THUMBNAILS */}
          <div className="propertySoftApple-thumbs">
            {property.images?.length > 0 ? (
              property.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`propertySoftApple-thumb ${i === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(i)}
                  alt=""
                />
              ))
            ) : (
              <p>Prona nuk ka foto.</p>
            )}
          </div>
        </div>

        {/* RIGHT INFO */}
        <div className="propertySoftApple-right">
          <h1>{property.title}</h1>
          <p className="softApple-price">{property.price?.toLocaleString()} €</p>

          <div className="propertySoftApple-featuresGrid">
            {features.map((f, i) => (
              <div key={i} className="propertySoftApple-featureCard">
                <span>{f.label}</span>
                <span>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="propertySoftApple-bottom">
        <h3>Përshkrimi</h3>
        <p>{property.description}</p>

        <h3>Kontakt</h3>
        <p>{property.contactInfo}</p>

        {/* APPOINTMENT BUTTON */}
        <button className="request-appointment-btn" onClick={handleAppointmentClick}>
          Kërko një takim
        </button>

        <div className="softApple-section">
  <h3>Harta e pronës</h3>
  
  {property.latitude != null && property.longitude != null ? (
    <MapContainer
      center={[property.latitude, property.longitude]}
      zoom={15}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[property.latitude, property.longitude]}>
        <Popup>{property.title}</Popup>
      </Marker>
    </MapContainer>
  ) : (
    <p>Koordinatat e pronës nuk janë të disponueshme.</p>
  )}
</div>

{/* RECOMMENDED PROPERTIES */}
{recommended.length > 0 && (
  <div className="recommended-section">
    <h3>Prona të rekomanduara</h3>

    <div className="recommended-list">
      {recommended.map((p) => (
        <a href={`/properties/${p.id}`} className="recommended-card" key={p.id}>
          <img src={p.images?.[0] || "/placeholder.png"} alt="" />
          
          <div className="recommended-info">
            <h4>{p.title}</h4>
            <p className="recommended-price">{p.price?.toLocaleString()} €</p>
            <p className="recommended-meta">
              {p.area} m² · {p.city}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
)}


      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      {modalOpen && (
        <div className="propertySoftApple-modal" onClick={() => setModalOpen(false)}>

          <button
            className="modal-arrow left"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            ‹
          </button>

          <img
            src={property.images?.[currentIndex]}
            className="propertySoftApple-modalImg"
            alt=""
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="modal-arrow right"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            ›
          </button>

        </div>
      )}

      {/* APPOINTMENT MODAL */}
      {appointmentModal && (
        <div className="appointment-modal" onClick={() => setAppointmentModal(false)}>
          <div className="appointment-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <h2>Kërko një takim</h2>

            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date(Date.now() + 3 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16)}
              className="appointment-input"
            />

            <div className="appointment-actions">
              <button className="cancel-btn" onClick={() => setAppointmentModal(false)}>
                Anulo
              </button>

              <button className="submit-btn" onClick={sendAppointmentRequest} disabled={sendingAppointment}>
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
