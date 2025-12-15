import '../admin.css';
import { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function AddProperty() {
  const [type, setType] = useState("");
  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    location: "",
    neighborhood: "",
    contactInfo: "",
    price: "",
    area: "",
    rooms: "",
    floor: "",
    hasElevator: false,
    hasBalcony: false,
    hasGarden: false,
    hasGarage: false,
    hasParking: false,
    hasInfrastructure: false,
    bathrooms: "",
    latitude: "",
    longitude: "",
    images: [],
    status: "",
  });

  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: inputType === "checkbox" ? checked : value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    setPreviewImages(prev => [...prev, ...previews]);
    setForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (idx) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
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
    setForm(prev => ({ ...prev, images: files }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.id) newErrors.id = "ID duhet të vendoset";
    if (!form.title) newErrors.title = "Titulli është i detyrueshëm";
    if (!form.price || form.price <= 0) newErrors.price = "Çmimi duhet të jetë më i madh se 0";
    if (!form.area || form.area <= 0) newErrors.area = "Sipërfaqja duhet të jetë më e madhe se 0";
    if (!type) newErrors.type = "Ju lutem zgjidhni llojin e pronës";

    if (type === "BANESA" && (!form.rooms || form.rooms <= 0)) newErrors.rooms = "Numri i dhomave duhet të jetë më i madh se 0";
    if (type === "SHTEPI" && (!form.floor || form.floor <= 0)) newErrors.floor = "Numri i kateve duhet të jetë më i madh se 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validate()) return;
    
      try {
        // Convert-image ne base64
        const imagesBase64 =
          form.images.length > 0
            ? await Promise.all(form.images.map(fileToBase64))
            : [];
    
        // 🔹 Kombino city + neighborhood në një string për backend
        const fullLocation = form.location 
          ? `${form.location}${form.neighborhood ? ', ' + form.neighborhood : ''}` 
          : form.neighborhood || '';
    
        // krijo payload
        const payload = { 
          ...form, 
          type, 
          images: imagesBase64,
          location: fullLocation  // ✅ kjo zëvendëson fushën location
        };
    
        // cakto endpoint sipas llojit të pronës
        let url = "";
        switch (type) {
          case "BANESA": url = "http://localhost:8080/api/banesa"; break;
          case "SHTEPI": url = "http://localhost:8080/api/shtepi"; break;
          case "LOKALE": url = "http://localhost:8080/api/lokale"; break;
          case "TOKA": url = "http://localhost:8080/api/toka"; break;
          default:
            alert("Lloji i pronës nuk është valid!");
            return;
        }
    
        // dergo kerkesen
        await axios.post(url, payload, {
          headers: { "Content-Type": "application/json" }
        });
    
        alert("Pronë u shtua me sukses!");
        setForm({
          id: "", title: "", description: "", location: "", neighborhood: "", contactInfo: "",
          price: "", area: "", rooms: "", floor: "", hasElevator: false, hasBalcony: false,
           hasGarden: false, hasGarage: false, hasParking: false, hasInfrastructure: false,
          bathrooms: "", latitude: "", longitude: "", images: [], status: ""
        });
        setPreviewImages([]);
        setErrors({});
    
      } catch (err) {
        console.error(err);
        alert("Shtimi i pronës dështoi");
      }
    };
    
    

  return (
    <div className="admin-page">
      <h2 className="addproperty-title">Shto Pronë</h2>

      <form className="addproperty-form" onSubmit={handleSubmit}>
        {/* Lloji & ID */}
        <div className="addproperty-type-id">
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="addproperty-type">
            <option value="" disabled>Zgjidh llojin e pronës</option>
            <option value="BANESA">Banesa</option>
            <option value="SHTEPI">Shtëpi</option>
            <option value="LOKALE">Lokale</option>
            <option value="TOKA">Tokë</option>
          </select>
          <input type="text" name="id" placeholder="ID (manual)" value={form.id} onChange={handleChange} className="addproperty-id" />
        </div>
        {errors.id && <p className="addproperty-error">{errors.id}</p>}

        {/* Titulli */}
        <div className="addproperty-field addproperty-fullrow">
          <input type="text" name="title" placeholder="Titulli" value={form.title} onChange={handleChange} className="addproperty-input" />
          {errors.title && <p className="addproperty-error">{errors.title}</p>}
        </div>

        {/* Përshkrimi */}
        <div className="addproperty-field addproperty-fullrow">
          <textarea name="description" placeholder="Përshkrimi" value={form.description} onChange={handleChange} className="addproperty-input addproperty-textarea" />
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
          <input type="text" name="neighborhood" placeholder="Lagjja" value={form.neighborhood} onChange={handleChange} className="addproperty-input flex-1" />
        </div>

        {/* Price & Area */}
        <div className="addproperty-field addproperty-row">
          <input type="number" name="price" placeholder="Çmimi" value={form.price} onChange={handleChange} className="addproperty-input flex-1" />
          {errors.price && <p className="addproperty-error">{errors.price}</p>}
          <input type="number" name="area" placeholder="Sipërfaqja (m²)" value={form.area} onChange={handleChange} className="addproperty-input flex-1" />
          {errors.area && <p className="addproperty-error">{errors.area}</p>}
        </div>

        {/* Fushat sipas llojit */}
        {type === "BANESA" && (
          <div className="addproperty-typefields">
            <input type="number" name="rooms" placeholder="Numri i dhomave" value={form.rooms} onChange={handleChange} className="addproperty-input" />
            {errors.rooms && <p className="addproperty-error">{errors.rooms}</p>}
            <input type="number" name="floor" placeholder="Kati" value={form.floor} onChange={handleChange} className="addproperty-input" />
            <input type="number" name="bathrooms" placeholder="Numri i banjove" value={form.bathrooms} onChange={handleChange} className="addproperty-input" />
            <label><input type="checkbox" name="hasElevator" checked={form.hasElevator} onChange={handleChange} /> Ashensor</label>
            <label><input type="checkbox" name="hasBalcony" checked={form.hasBalcony} onChange={handleChange} /> Ballkon</label>
          </div>
        )}

        {type === "SHTEPI" && (
          <div className="addproperty-typefields">
            <input type="number" name="floor" placeholder="Numri i kateve" value={form.floor} onChange={handleChange} className="addproperty-input" />
            {errors.floor && <p className="addproperty-error">{errors.floor}</p>}
            <input type="number" name="bathrooms" placeholder="Numri i banjove" value={form.bathrooms} onChange={handleChange} className="addproperty-input" />
            <label><input type="checkbox" name="hasGarden" checked={form.hasGarden} onChange={handleChange} /> Oborr</label>
            <label><input type="checkbox" name="hasGarage" checked={form.hasGarage} onChange={handleChange} /> Garazh</label>
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

        {/* Latitude & Longitude */}
        <div className="addproperty-field">
          <input type="number" name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} className="addproperty-input" />
          <input type="number" name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} className="addproperty-input" />
        </div>

        {/* Status & Contact */}
        <div className="addproperty-field addproperty-row">
          <select name="status" value={form.status} onChange={handleChange} className="addproperty-input flex-1">
            <option value="" disabled>Zgjidh Statusin</option>
            <option value="FOR_SALE">Në shitje</option>
            <option value="FOR_RENT">Me qira</option>
          </select>
          <input type="text" name="contactInfo" placeholder="Kontakt" value={form.contactInfo} onChange={handleChange} className="addproperty-input flex-1" />
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

        <button type="submit" className="addproperty-submit">Shto Pronë</button>
      </form>
    </div>
  );
}

export default AddProperty;
