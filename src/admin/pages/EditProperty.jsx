import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../admin.css";

function EditProperty() {
  const { id } = useParams();
  const [type, setType] = useState("");
  const [form, setForm] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});

  // LOAD PROPERTY BY ID
  useEffect(() => {
    const stored = localStorage.getItem("demoProperties");
    if (stored) {
      const list = JSON.parse(stored);
      const found = list.find((p) => p.id === parseInt(id));

      if (found) {
        setType(
          found.type.toUpperCase() === "BANESA" ? "BANESA" :
          found.type.toUpperCase() === "SHTEPI" ? "SHTEPI" :
          found.type.toUpperCase() === "LOKALE" ? "LOKALE" :
          "TOKA"
        );

        setForm({
          ...found,
          rooms: found.rooms || "",
          floor: found.floor || "",
          bathrooms: found.bathrooms || "",
          floors: found.floors || "",
          hasElevator: found.hasElevator || false,
          hasBalcony: found.hasBalcony || false,
          hasGarden: found.hasGarden || false,
          hasGarage: found.hasGarage || false,
          hasParking: found.hasParking || false,
          hasInfrastructure: found.hasInfrastructure || false,
          images: [],
        });

        if (found.images && found.images.length > 0) {
          setPreviewImages(found.images);
        }
      }
    }
  }, [id]);

  if (!form) {
    return <div className="text-center mt-20 text-white">Loading...</div>;
  }

  // HANDLE FORM CHANGES
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  // HANDLE IMAGES
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));

    setPreviewImages((prev) => [...prev, ...previews]);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (idx) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(previewImages);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setPreviewImages(items);
  };

  // VALIDATE FORM
  const validate = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Titulli është i detyrueshëm";
    if (!form.price || form.price <= 0) newErrors.price = "Çmimi duhet të jetë > 0";
    if (!form.area || form.area <= 0) newErrors.area = "Sipërfaqja duhet të jetë > 0";

    if (type === "BANESA" && (!form.rooms || form.rooms <= 0))
      newErrors.rooms = "Numri i dhomave duhet të jetë > 0";
    if (type === "SHTEPI" && (!form.floors || form.floors <= 0))
      newErrors.floors = "Numri i kateve duhet të jetë > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    alert("Changes saved (demo mode).");
  };

  return (
    <div className="editproperty-container">
      <h2 className="addproperty-title">Edit Property — {form.title}</h2>

      <form className="addproperty-form" onSubmit={(e) => e.preventDefault()}>
        {/* Type (disabled) */}
        <select value={type} disabled className="addproperty-type">
          <option value="BANESA">Banesa</option>
          <option value="SHTEPI">Shtëpi</option>
          <option value="LOKALE">Lokale</option>
          <option value="TOKA">Tokë</option>
        </select>

        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Titulli"
          value={form.title}
          onChange={handleChange}
          className="addproperty-input"
        />
        {errors.title && <p className="addproperty-error">{errors.title}</p>}

        {/* Description */}
        <textarea
          name="description"
          placeholder="Përshkrimi"
          value={form.description}
          onChange={handleChange}
          className="addproperty-input addproperty-textarea"
        />

        {/* Price + Area */}
        <div className="addproperty-row">
          <input
            type="number"
            name="price"
            placeholder="Çmimi"
            value={form.price}
            onChange={handleChange}
            className="addproperty-input"
          />
          <input
            type="number"
            name="area"
            placeholder="Sipërfaqja (m²)"
            value={form.area}
            onChange={handleChange}
            className="addproperty-input"
          />
        </div>

        {errors.price && <p className="addproperty-error">{errors.price}</p>}
        {errors.area && <p className="addproperty-error">{errors.area}</p>}

        {/* TYPE FIELDS */}
        {type === "BANESA" && (
          <div className="addproperty-typefields">
            <input type="number" name="rooms" placeholder="Numri i dhomave" value={form.rooms} onChange={handleChange} className="addproperty-input" />
            <input type="number" name="floor" placeholder="Kati" value={form.floor} onChange={handleChange} className="addproperty-input" />
            <input type="number" name="bathrooms" placeholder="Numri i banjove" value={form.bathrooms} onChange={handleChange} className="addproperty-input" />
            <label><input type="checkbox" name="hasElevator" checked={form.hasElevator} onChange={handleChange} /> Ashensor</label>
            <label><input type="checkbox" name="hasBalcony" checked={form.hasBalcony} onChange={handleChange} /> Ballkon</label>
            {errors.rooms && <p className="addproperty-error">{errors.rooms}</p>}
          </div>
        )}

        {type === "SHTEPI" && (
          <div className="addproperty-typefields">
            <input type="number" name="floors" placeholder="Numri i kateve" value={form.floors} onChange={handleChange} className="addproperty-input" />
            <input type="number" name="bathrooms" placeholder="Numri i banjove" value={form.bathrooms} onChange={handleChange} className="addproperty-input" />
            <label><input type="checkbox" name="hasGarden" checked={form.hasGarden} onChange={handleChange} /> Oborr</label>
            <label><input type="checkbox" name="hasGarage" checked={form.hasGarage} onChange={handleChange} /> Garazh</label>
            {errors.floors && <p className="addproperty-error">{errors.floors}</p>}
          </div>
        )}

        {type === "LOKALE" && (
          <div className="addproperty-typefields">
            <input type="number" name="floor" placeholder="Kati" value={form.floor} onChange={handleChange} className="addproperty-input" />
            <label><input type="checkbox" name="hasParking" checked={form.hasParking} onChange={handleChange} /> Parking</label>
          </div>
        )}

        {type === "TOKA" && (
          <div className="addproperty-typefields">
            <label><input type="checkbox" name="hasInfrastructure" checked={form.hasInfrastructure} onChange={handleChange} /> Infrastrukturë</label>
          </div>
        )}

        {/* DRAG & DROP IMAGES */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div className="addproperty-images" ref={provided.innerRef} {...provided.droppableProps}>
                {previewImages.map((src, idx) => (
                  <Draggable key={idx} draggableId={`img-${idx}`} index={idx}>
                    {(provided) => (
                      <div className="addproperty-image" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <img src={src} className="addproperty-img" />
                        <button type="button" className="addproperty-remove" onClick={() => removeImage(idx)}>X</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <label className="addproperty-addphoto">+
                  <input type="file" multiple className="hidden" onChange={handleImages} />
                </label>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button onClick={handleSave} className="addproperty-submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditProperty;
