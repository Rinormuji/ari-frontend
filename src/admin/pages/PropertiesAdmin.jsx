import { useState, useEffect } from "react";
import PropertiesTable from "../components/PropertiesTable";
import PropertiesCard from "../components/PropertiesCard";
import { FaThLarge, FaTable } from "react-icons/fa"; // ikonat për toggle

function PropertiesAdmin() {
  const [properties, setProperties] = useState([]);
  const [view, setView] = useState("table"); // "table" ose "cards"
  const [animating, setAnimating] = useState(false);

  // Demo data
  useEffect(() => {
    const demoData = [
      {
        id: 1,
        title: "Banesa në Tiranë",
        name: "Banesa në Tiranë",
        description: "Banesa moderne në qendër të Tiranës.",
        location: "Tiranë",
        neighborhood: "21 Dhjetori",
        type: "BANESA",
        status: "FOR_SALE",
        area: 120,
        price: 120000,
        rooms: 3,
        floor: 5,
        bathrooms: 2,
        hasElevator: true,
        hasBalcony: true,
        contactInfo: "044-123-456",
        latitude: "41.3275",
        longitude: "19.8187",
        images: [],
      },
      {
        id: 2,
        title: "Shtepi në Durrës",
        name: "Shtepi në Durrës",
        description: "Shtëpi e re pranë plazhit.",
        location: "Durrës",
        neighborhood: "Iliria",
        type: "SHTEPI",
        status: "FOR_RENT",
        area: 200,
        price: 800,
        floors: 2,
        bathrooms: 2,
        hasGarden: true,
        hasGarage: true,
        contactInfo: "045-987-654",
        latitude: "41.3167",
        longitude: "19.4500",
        images: [],
      }
    ];

    setProperties(demoData);
    localStorage.setItem("demoProperties", JSON.stringify(demoData));
  }, []);

  // Toggle view me animacion
  const handleToggle = (newView) => {
    if (view === newView) return;
    setAnimating(true);
    setTimeout(() => {
      setView(newView);
      setAnimating(false);
    }, 200); // 200ms animation
  };

  return (
    <div className="admin-page-container">
      {/* Header + Toggle Buttons me ikonë */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Properties</h2>
        <div className="flex gap-2">
          <button
            className={`p-2 rounded-md border shadow-sm transition-all duration-200 ${
              view === "table" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            } hover:bg-blue-500 hover:text-white hover:scale-105`}
            onClick={() => handleToggle("table")}
            title="Table View"
          >
            <FaTable size={20} />
          </button>
          <button
            className={`p-2 rounded-md border shadow-sm transition-all duration-200 ${
              view === "cards" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            } hover:bg-blue-500 hover:text-white hover:scale-105`}
            onClick={() => handleToggle("cards")}
            title="Card View"
          >
            <FaThLarge size={20} />
          </button>
        </div>
      </div>

      {/* Container me animacion fade + slide */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          animating ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        {view === "table" ? (
          <PropertiesTable properties={properties} />
        ) : (
          <div className="properties-cards-grid">
            {properties.map((property) => (
              <PropertiesCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertiesAdmin;
