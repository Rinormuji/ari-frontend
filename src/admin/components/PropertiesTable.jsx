import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import '../admin.css'; // CSS custom për tabelën

function PropertiesTable({ properties }) {
  const navigate = useNavigate(); // Shto këtë

  const handleEdit = (propertyId) => {
    navigate(`/admin/properties/edit/${propertyId}`);
  };
  return (
    <div className="properties-table-container">
      <table className="properties-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Area (m²)</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {properties.map((prop) => (
            <tr key={prop.id}>
              <td>{prop.id}</td>
              <td>{prop.name}</td>
              <td>{prop.type}</td>
              <td>
                <span className={`status-badge ${prop.status === "For Sale" ? "status-sale" : "status-rent"}`}>
                  {prop.status}
                </span>
              </td>
              <td>{prop.area}</td>
              <td>{prop.price}</td>
              <td className="actions">
                <button className="action-button action-edit"  onClick={() => handleEdit(prop.id)}>
                  <FaEdit className="text-white" />
                </button>
                <button className="action-button action-delete">
                  <FaTrash className="text-white" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PropertiesTable;
