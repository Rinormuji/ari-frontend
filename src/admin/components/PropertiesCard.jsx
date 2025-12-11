import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../admin.css'; 

function PropertiesCard({ property }) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/admin/properties/edit/${property.id}`);
  };
  return (
    <div className="property-card-admin">
      {/* Emri dhe status */}
      <div className="mb-3">
        <h3 className="text-white font-semibold text-lg">{property.name}</h3>
        <span
          className={`status-badge ${
            property.status === "For Sale" ? "status-sale" : "status-rent"
          }`}
        >
          {property.status}
        </span>
      </div>

      {/* Info */}
      <div className="text-gray-300 text-sm mb-3">
        <p>Type: {property.type}</p>
        <p>Area: {property.area} m²</p>
        <p>Price: {property.price}</p>
      </div>

      {/* Actions */}
      <div className="actions">
        <button className="action-button action-edit" onClick={handleEdit}>
          <FaEdit className="text-white" />
        </button>
        <button className="action-button action-delete">
          <FaTrash className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default PropertiesCard;
