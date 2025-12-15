import '../admin.css';
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function EditProperty() {
  const { id } = useParams();
  const [type, setType] = useState("");
  const [form, setForm] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  
  

  // LOAD PROPERTY BY ID
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Cakto URL sipas backend
        let url = `http://localhost:8080/api/properties/${id}`;
        const res = await axios.get(url);
        const found = res.data;

        if (found) {
          setType(found.type.toUpperCase());
          let city = "";
        let neighborhood = "";
        if (found.location) {
          const parts = found.location.split(",").map(p => p.trim());
          city = parts[0] || "";
          neighborhood = parts[1] || "";
        }
        setForm({
          ...found,
          location: city,
          neighborhood: neighborhood,
          rooms: found.rooms || "",
          floor: found.floor || "",
          // floors: found.floors || "",
          bathrooms: found.bathrooms || "",
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
      } catch (err) {
        console.error(err);
        alert("Nuk u gjet prona.");
      }
    };

    fetchProperty();
  }, [id]);

  if (!form) return <div className="text-center mt-20 text-white">Loading...</div>;

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

    const files = Array.from(form.images);
    const [fileReordered] = files.splice(result.source.index, 1);
    files.splice(result.destination.index, 0, fileReordered);
    setForm((prev) => ({ ...prev, images: files }));
  };

  // VALIDATE FORM
  const validate = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Titulli është i detyrueshëm";
    if (!form.price || form.price <= 0) newErrors.price = "Çmimi duhet të jetë > 0";
    if (!form.area || form.area <= 0) newErrors.area = "Sipërfaqja duhet të jetë > 0";

    if (type === "BANESA" && (!form.rooms || form.rooms <= 0)) newErrors.rooms = "Numri i dhomave duhet të jetë > 0";
    if (type === "SHTEPI" && (!form.floor || form.floor <= 0)) newErrors.floor = "Numri i kateve duhet të jetë > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CONVERT FILE TO BASE64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // HANDLE SAVE (UPDATE)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Convert images to base64
      const imagesBase64 =
        form.images.length > 0
          ? await Promise.all(form.images.map(fileToBase64))
          : [];

          const fullLocation = form.location 
          ? `${form.location}${form.neighborhood ? ', ' + form.neighborhood : ''}` 
          : form.neighborhood || '';

      const payload = {
        ...form,
        location: fullLocation,
        images: imagesBase64,
        type, // type readonly
      };

      // Cakto endpoint sipas type
      let url = "";
      switch (type) {
        case "BANESA": url = `http://localhost:8080/api/banesa/${id}`; break;
        case "SHTEPI": url = `http://localhost:8080/api/shtepi/${id}`; break;
        case "LOKALE": url = `http://localhost:8080/api/lokale/${id}`; break;
        case "TOKA": url = `http://localhost:8080/api/toka/${id}`; break;
        default: alert("Lloji i pronës nuk është valid!"); return;
      }

      await axios.put(url, payload, { headers: { "Content-Type": "application/json" } });

      alert("Pronë u përditësua me sukses!");
    } catch (err) {
      console.error(err);
      alert("Ndryshimi i pronës dështoi.");
    }
  };

  return (
    <div className="admin-page">
      <h2 className="addproperty-title">Edit Property — {form.title}</h2>

      <form className="addproperty-form" onSubmit={handleSave}>
        {/* Type & ID */}
        <div className="addproperty-type-id">
          <select name="type" value={type} disabled className="addproperty-type">
            <option value="BANESA">Banesa</option>
            <option value="SHTEPI">Shtëpi</option>
            <option value="LOKALE">Lokale</option>
            <option value="TOKA">Tokë</option>
          </select>
          <input type="text" name="id" value={form.id} disabled className="addproperty-id" />
        </div>

        {/* Title */}
        <div className="addproperty-field addproperty-fullrow">
          <input type="text" name="title" value={form.title} onChange={handleChange} className="addproperty-input" />
          {errors.title && <p className="addproperty-error">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="addproperty-field addproperty-fullrow">
          <textarea name="description" value={form.description} onChange={handleChange} className="addproperty-input addproperty-textarea" />
        </div>

        {/* Location & Neighborhood */}
        <div className="addproperty-field addproperty-row">
          <select name="location" value={form.location} onChange={handleChange} className="addproperty-input flex-1">
            <option value="" disabled>Zgjidh qytetin</option>
            <option value="Prishtinë">Prishtinë</option>
            <option value="Prizren">Prizren</option>
            <option value="Pejë">Pejë</option>
            <option value="Gjakovë">Gjakovë</option>
            <option value="Ferizaj">Ferizaj</option>
            <option value="Gjilan">Gjilan</option>
            <option value="Mitrovicë">Mitrovicë</option>
          </select>
          <input type="text" name="neighborhood" value={form.neighborhood} onChange={handleChange} placeholder="Lagjja" className="addproperty-input flex-1" />
        </div>

        {/* Price & Area */}
        <div className="addproperty-field addproperty-row">
          <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Çmimi" className="addproperty-input flex-1" />
          {errors.price && <p className="addproperty-error">{errors.price}</p>}
          <input type="number" name="area" value={form.area} onChange={handleChange} placeholder="Sipërfaqja (m²)" className="addproperty-input flex-1" />
          {errors.area && <p className="addproperty-error">{errors.area}</p>}
        </div>

        {/* Type-specific fields */}
        {type === "BANESA" && (
          <div className="addproperty-typefields">
            <input type="number" name="rooms" value={form.rooms} onChange={handleChange} placeholder="Numri i dhomave" className="addproperty-input" />
            {errors.rooms && <p className="addproperty-error">{errors.rooms}</p>}
            <input type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="Kati" className="addproperty-input" />
            <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="Numri i banjove" className="addproperty-input" />
            <label><input type="checkbox" name="hasElevator" checked={form.hasElevator} onChange={handleChange} /> Ashensor</label>
            <label><input type="checkbox" name="hasBalcony" checked={form.hasBalcony} onChange={handleChange} /> Ballkon</label>
          </div>
        )}

        {type === "SHTEPI" && (
          <div className="addproperty-typefields">
            <input type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="Numri i kateve" className="addproperty-input" />
            {errors.floors && <p className="addproperty-error">{errors.floor}</p>}
            <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="Numri i banjove" className="addproperty-input" />
            <label><input type="checkbox" name="hasGarden" checked={form.hasGarden} onChange={handleChange} /> Oborr</label>
            <label><input type="checkbox" name="hasGarage" checked={form.hasGarage} onChange={handleChange} /> Garazh</label>
          </div>
        )}

        {type === "LOKALE" && (
          <div className="addproperty-typefields">
            <input type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="Kati" className="addproperty-input" />
            <label><input type="checkbox" name="hasParking" checked={form.hasParking} onChange={handleChange} /> Parking</label>
          </div>
        )}

        {type === "TOKA" && (
          <div className="addproperty-typefields">
            <label><input type="checkbox" name="hasInfrastructure" checked={form.hasInfrastructure} onChange={handleChange} /> Infrastrukturë</label>
          </div>
        )}

        {/* Latitude & Longitude */}
        <div className="addproperty-field">
          <input type="number" name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" className="addproperty-input" />
          <input type="number" name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" className="addproperty-input" />
        </div>

        {/* Status & Contact */}
        <div className="addproperty-field addproperty-row">
          <select name="status" value={form.status} onChange={handleChange} className="addproperty-input flex-1">
            <option value="" disabled>Zgjidh Statusin</option>
            <option value="FOR_SALE">Në shitje</option>
            <option value="FOR_RENT">Me qira</option>
          </select>
          <input type="text" name="contactInfo" value={form.contactInfo} onChange={handleChange} placeholder="Kontakt" className="addproperty-input flex-1" />
        </div>

        {/* Drag & Drop Images */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div className="addproperty-images" ref={provided.innerRef} {...provided.droppableProps}>
                {previewImages.map((src, idx) => (
                  <Draggable key={idx} draggableId={`img-${idx}`} index={idx}>
                    {(provided) => (
                      <div className="addproperty-image" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <img src={src} alt={`preview-${idx}`} className="addproperty-img" />
                        <button type="button" onClick={() => removeImage(idx)} className="addproperty-remove">X</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <label className="addproperty-addphoto">
                  + <input type="file" multiple className="hidden" onChange={handleImages} />
                </label>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button type="submit" className="addproperty-submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditProperty;
