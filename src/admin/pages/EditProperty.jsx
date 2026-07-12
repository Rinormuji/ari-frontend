import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, ImagePlus } from "lucide-react";
import { propertyAPI } from "../../services/api";
import MapPicker from "../components/MapPicker";
import { useToast } from "../../context/ToastContext";
import { paths } from "../../routes/paths";
import { cityAPI } from "../../services/api";

const inputCls =
  "w-full bg-[#123E35] border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#EFD391]/60 transition-colors";
const labelCls = "block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider";
const errorCls = "text-red-400 text-xs mt-1";

const CheckField = ({ name, checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <button
      type="button"
      onClick={() => onChange({ target: { name, type: "checkbox", checked: !checked } })}
      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
        checked ? "bg-[#EFD391] border-[#EFD391]" : "border-white/20 bg-white/5"
      }`}
    >
      {checked && <X size={12} className="text-black" />}
    </button>
    <span className="text-sm text-white/70">{label}</span>
  </label>
);


function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [type, setType] = useState("");
  const [form, setForm] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  
  

  // LOAD PROPERTY BY ID
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await propertyAPI.getProperty(id);
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
          priceType: found.priceType || "TOTAL",
          floor: found.floor || "",
          // floors: found.floors || "",
          bathrooms: found.bathrooms || "",
          hasElevator: found.hasElevator || false,
          hasBalcony: found.hasBalcony || false,
          hasGarden: found.hasGarden || false,
          hasGarage: found.hasGarage || false,
          hasParking: found.hasParking || false,
          hasInfrastructure: found.hasInfrastructure || false,
          images: found.images || [],
        });

        if (found.images && found.images.length > 0) {
          setPreviewImages(found.images);
        }
        }
      } catch (err) {
        console.error(err);
        toast.error("Nuk u gjet prona.");
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const fetchCities = async () => {
      try {
        const res = await cityAPI.getAll();
        if (!cancelled) setCities(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching cities:", err);
        toast.error("Gabim gjatë ngarkimit të komunave.");
      }
    };

    fetchCities();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (!form) return <div className="text-center mt-20 text-white">Loading...</div>;

  // HANDLE FORM CHANGES
  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
      ...(name === "priceType" && value === "NEGOTIABLE" ? { price: "" } : {}),
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
    if (form.priceType !== "NEGOTIABLE" && (!form.price || form.price <= 0)) newErrors.price = "Çmimi duhet të jetë > 0";
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
    const imagesBase64 = await Promise.all(
      form.images.map(item =>
        item instanceof File ? fileToBase64(item) : item
      )
    );

    const fullLocation = form.location
      ? `${form.location}${form.neighborhood ? ', ' + form.neighborhood : ''}`
      : form.neighborhood || '';

    const payload = {
      ...form,
      location: fullLocation,
      images: imagesBase64,
      type,
      price: form.priceType === "NEGOTIABLE" ? null : form.price,
    };

  await propertyAPI.updatePropertyByType(type, id, payload);

    toast.success("Pronë u përditësua me sukses!");
  } catch (err) {
    console.error(err);
    toast.error("Ndryshimi i pronës dështoi.");
  }
};

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     try {
//       // Convert images to base64
//       const imagesBase64 =
//         form.images.length > 0
//           ? await Promise.all(form.images.map(fileToBase64))
//           : [];

//           const fullLocation = form.location 
//           ? `${form.location}${form.neighborhood ? ', ' + form.neighborhood : ''}` 
//           : form.neighborhood || '';

//       const payload = {
//         ...form,
//         location: fullLocation,
//         images: imagesBase64,
//         type, // type readonly
//       };

//       // Cakto endpoint sipas type
//       let url = "";
//       switch (type) {
// case "BANESA": url = `${API_BASE}/banesa/${id}`; break;
//         case "SHTEPI": url = `${API_BASE}/shtepi/${id}`; break;
//         case "LOKALE": url = `${API_BASE}/lokale/${id}`; break;
//         case "TOKA": url = `${API_BASE}/toka/${id}`; break;
//   default: alert("Lloji i pronës nuk është valid!"); return;
// }


//       await axios.put(url, payload, { headers: { "Content-Type": "application/json" } });

//       alert("Pronë u përditësua me sukses!");
//     } catch (err) {
//       console.error(err);
//       alert("Ndryshimi i pronës dështoi.");
//     }
//   };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-2">Edito Pronën</h1>
      <p className="text-sm text-white/40 mb-6">{form.title}</p>

      <form className="space-y-5" onSubmit={handleSave}>
        {/* Type (readonly) + ID (readonly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Lloji</label>
            <select name="type" value={type} disabled className={`${inputCls} opacity-60 cursor-not-allowed`}>
              <option value="BANESA">Banesa</option>
              <option value="SHTEPI">Shtëpi</option>
              <option value="LOKALE">Lokale</option>
              <option value="TOKA">Tokë</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>ID</label>
            <input type="text" name="id" value={form.id} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelCls}>Titulli *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className={inputCls} />
          {errors.title && <p className={errorCls}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Përshkrimi</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputCls} resize-none`} />
        </div>

        {/* City + Neighborhood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Qyteti</label>
            <select name="location" value={form.location} onChange={handleChange} className={inputCls}>
              <option value="" disabled>Zgjidh qytetin</option>
              {Array.from(new Set([form.location, ...cities].filter(Boolean))).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Lagjja</label>
            <input type="text" name="neighborhood" value={form.neighborhood} onChange={handleChange} placeholder="Lagjja" className={inputCls} />
          </div>
        </div>

        {/* Price + Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Mënyra e çmimit</label>
            <select name="priceType" value={form.priceType || "TOTAL"} onChange={handleChange} className={inputCls}>
              <option value="TOTAL">Çmimi total</option>
              <option value="PER_M2">Çmimi për m²</option>
              <option value="NEGOTIABLE">Me marrëveshje</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{form.priceType === "PER_M2" ? "Çmimi për m² (€)" : "Çmimi (€)"} {form.priceType !== "NEGOTIABLE" ? "*" : ""}</label>
            <input
              type="number"
              name="price"
              value={form.price || ""}
              onChange={handleChange}
              placeholder={form.priceType === "NEGOTIABLE" ? "Me marrëveshje" : "Çmimi"}
              disabled={form.priceType === "NEGOTIABLE"}
              className={`${inputCls} ${form.priceType === "NEGOTIABLE" ? "opacity-55 cursor-not-allowed" : ""}`}
            />
            {errors.price && <p className={errorCls}>{errors.price}</p>}
          </div>
          <div>
            <label className={labelCls}>Sipërfaqja (m²) *</label>
            <input type="number" name="area" value={form.area} onChange={handleChange} placeholder="Sipërfaqja" className={inputCls} />
            {errors.area && <p className={errorCls}>{errors.area}</p>}
          </div>
        </div>
        {form.priceType === "PER_M2" && form.price && form.area && (
          <p className="text-xs text-white/40">
            Totali i llogaritur: {(Number(form.price) * Number(form.area)).toLocaleString()} €
          </p>
        )}

        {/* Type-specific fields */}
        {type === "BANESA" && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
            <p className="text-xs font-semibold text-[#EFD391] uppercase tracking-wider">Detajet e Banesës</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Dhomat *</label>
                <input type="number" name="rooms" value={form.rooms} onChange={handleChange} placeholder="0" className={inputCls} />
                {errors.rooms && <p className={errorCls}>{errors.rooms}</p>}
              </div>
              <div>
                <label className={labelCls}>Kati</label>
                <input type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Banjot</label>
                <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="0" className={inputCls} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <CheckField name="hasElevator" checked={form.hasElevator} onChange={handleChange} label="Ashensor" />
              <CheckField name="hasBalcony" checked={form.hasBalcony} onChange={handleChange} label="Ballkon" />
            </div>
          </div>
        )}

        {type === "SHTEPI" && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
            <p className="text-xs font-semibold text-[#EFD391] uppercase tracking-wider">Detajet e Shtëpisë</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Katet *</label>
                <input type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="0" className={inputCls} />
                {errors.floor && <p className={errorCls}>{errors.floor}</p>}
              </div>
              <div>
                <label className={labelCls}>Banjot</label>
                <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="0" className={inputCls} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <CheckField name="hasGarden" checked={form.hasGarden} onChange={handleChange} label="Oborr" />
              <CheckField name="hasGarage" checked={form.hasGarage} onChange={handleChange} label="Garazh" />
            </div>
          </div>
        )}

        {type === "LOKALE" && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
            <p className="text-xs font-semibold text-[#EFD391] uppercase tracking-wider">Detajet e Lokalit</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Kati</label>
                <input type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="0" className={inputCls} />
              </div>
            </div>
            <CheckField name="hasParking" checked={form.hasParking} onChange={handleChange} label="Parking" />
          </div>
        )}

        {type === "TOKA" && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs font-semibold text-[#EFD391] uppercase tracking-wider mb-3">Detajet e Tokës</p>
            <CheckField name="hasInfrastructure" checked={form.hasInfrastructure} onChange={handleChange} label="Infrastrukturë" />
          </div>
        )}

        {/* Status + Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Statusi</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              <option value="" disabled>Zgjidh statusin</option>
              <option value="FOR_SALE">Në shitje</option>
              <option value="FOR_RENT">Me qira</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Kontakt</label>
            <input type="text" name="contactInfo" value={form.contactInfo} onChange={handleChange} placeholder="Kontakt" className={inputCls} />
          </div>
        </div>

        {/* Map Picker */}
        <div>
          <label className={labelCls}>Vendndodhja në hartë</label>
          <MapPicker
            lat={form.latitude}
            lng={form.longitude}
            onSelect={(lat, lng) => setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
          />
        </div>

        {/* Images drag-drop */}
        <div>
          <label className={labelCls}>Fotot</label>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  className="flex flex-wrap gap-3 p-3 bg-white/5 rounded-lg border border-white/10 min-h-25"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {previewImages.map((src, idx) => (
                    <Draggable key={idx} draggableId={`img-${idx}`} index={idx}>
                      {(drag) => (
                        <div
                          className="relative h-24 w-24 max-w-full rounded-lg overflow-hidden border border-white/20 group"
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <GripVertical size={18} className="text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <label className="flex h-24 w-24 max-w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-white/40 transition-colors hover:border-[#EFD391]/50 hover:text-[#EFD391]/70">
                    <ImagePlus size={22} />
                    <span className="text-xs mt-1">Shto</span>
                    <input type="file" multiple className="hidden" onChange={handleImages} accept="image/*" />
                  </label>
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <p className="text-xs text-white/30 mt-1">Tërhiq për të rirendosur • Kliko × për të fshirë</p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(paths.adminProperties)}
            className="w-full rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/5 hover:text-white sm:w-40"
          >
            Anulo
          </button>
          <button
            type="submit"
            className="w-full bg-[#EFD391] hover:bg-[#D9BF7B] text-black font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            Ruaj Ndryshimet
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProperty;
