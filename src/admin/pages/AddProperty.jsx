import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, ImagePlus } from "lucide-react";
import api from "../../services/api";
import MapPicker from "../components/MapPicker";
import { useToast } from "../../context/ToastContext";

const CITIES = ["Prishtinë", "Prizren", "Pejë", "Gjakovë", "Ferizaj", "Gjilan", "Mitrovicë"];

const inputCls =
  "w-full bg-[#1a1a1a] border border-white/10 text-white placeholder-white/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FFAE42]/60 transition-colors";
const labelCls = "block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider";
const errorCls = "text-red-400 text-xs mt-1";

const CheckField = ({ name, checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <button
      type="button"
      onClick={() => onChange({ target: { name, type: "checkbox", checked: !checked } })}
      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
        checked ? "bg-[#FFAE42] border-[#FFAE42]" : "border-white/20 bg-white/5"
      }`}
    >
      {checked && <X size={12} className="text-black" />}
    </button>
    <span className="text-sm text-white/70">{label}</span>
  </label>
);

function AddProperty() {
  const toast = useToast();
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
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: inputType === "checkbox" ? checked : value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setPreviewImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (idx) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const imgs = [...previewImages];
    const [img] = imgs.splice(source.index, 1);
    imgs.splice(destination.index, 0, img);
    setPreviewImages(imgs);
    const files = [...form.images];
    const [file] = files.splice(source.index, 1);
    files.splice(destination.index, 0, file);
    setForm((prev) => ({ ...prev, images: files }));
  };

  const validate = () => {
    const e = {};
    if (!form.id) e.id = "ID është i detyrueshëm";
    if (!type) e.type = "Zgjidh llojin e pronës";
    if (!form.title) e.title = "Titulli është i detyrueshëm";
    if (!form.price || form.price <= 0) e.price = "Çmimi duhet të jetë > 0";
    if (!form.area || form.area <= 0) e.area = "Sipërfaqja duhet të jetë > 0";
    if (type === "BANESA" && (!form.rooms || form.rooms <= 0)) e.rooms = "Numri i dhomave duhet të jetë > 0";
    if (type === "SHTEPI" && (!form.floor || form.floor <= 0)) e.floor = "Numri i kateve duhet të jetë > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const imagesBase64 =
        form.images.length > 0 ? await Promise.all(form.images.map(fileToBase64)) : [];
      const fullLocation = form.location
        ? `${form.location}${form.neighborhood ? ", " + form.neighborhood : ""}`
        : form.neighborhood || "";
      const endpoints = { BANESA: "/banesa", SHTEPI: "/shtepi", LOKALE: "/lokale", TOKA: "/toka" };
      await api.post(endpoints[type], { ...form, type, images: imagesBase64, location: fullLocation });

      toast.success("Pronë u shtua me sukses!");
      setForm({
        id: "", title: "", description: "", location: "", neighborhood: "", contactInfo: "",
        price: "", area: "", rooms: "", floor: "", hasElevator: false, hasBalcony: false,
        hasGarden: false, hasGarage: false, hasParking: false, hasInfrastructure: false,
        bathrooms: "", latitude: "", longitude: "", images: [], status: "",
      });
      setPreviewImages([]);
      setErrors({});
      setType("");
    } catch (err) {
      console.error(err);
      toast.error("Shtimi i pronës dështoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Shto Pronë të Re</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type + ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Lloji i pronës *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="" disabled>Zgjidh llojin...</option>
              <option value="BANESA">Banesa</option>
              <option value="SHTEPI">Shtëpi</option>
              <option value="LOKALE">Lokale</option>
              <option value="TOKA">Tokë</option>
            </select>
            {errors.type && <p className={errorCls}>{errors.type}</p>}
          </div>
          <div>
            <label className={labelCls}>ID *</label>
            <input type="text" name="id" placeholder="p.sh. B-101" value={form.id} onChange={handleChange} className={inputCls} />
            {errors.id && <p className={errorCls}>{errors.id}</p>}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelCls}>Titulli *</label>
          <input type="text" name="title" placeholder="Titulli i pronës" value={form.title} onChange={handleChange} className={inputCls} />
          {errors.title && <p className={errorCls}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Përshkrimi</label>
          <textarea name="description" placeholder="Përshkrim i detajuar..." value={form.description} onChange={handleChange} rows={4} className={`${inputCls} resize-none`} />
        </div>

        {/* City + Neighborhood */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Qyteti</label>
            <select name="location" value={form.location} onChange={handleChange} className={inputCls}>
              <option value="" disabled>Zgjidh qytetin</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Lagjja</label>
            <input type="text" name="neighborhood" placeholder="Lagjja" value={form.neighborhood} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        {/* Price + Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Çmimi (€) *</label>
            <input type="number" name="price" placeholder="0" value={form.price} onChange={handleChange} className={inputCls} />
            {errors.price && <p className={errorCls}>{errors.price}</p>}
          </div>
          <div>
            <label className={labelCls}>Sipërfaqja (m²) *</label>
            <input type="number" name="area" placeholder="0" value={form.area} onChange={handleChange} className={inputCls} />
            {errors.area && <p className={errorCls}>{errors.area}</p>}
          </div>
        </div>

        {/* Type-specific fields */}
        {type === "BANESA" && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
            <p className="text-xs font-semibold text-[#FFAE42] uppercase tracking-wider">Detajet e Banesës</p>
            <div className="grid grid-cols-3 gap-3">
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
            <p className="text-xs font-semibold text-[#FFAE42] uppercase tracking-wider">Detajet e Shtëpisë</p>
            <div className="grid grid-cols-2 gap-3">
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
            <p className="text-xs font-semibold text-[#FFAE42] uppercase tracking-wider">Detajet e Lokalit</p>
            <div className="grid grid-cols-2 gap-3">
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
            <p className="text-xs font-semibold text-[#FFAE42] uppercase tracking-wider mb-3">Detajet e Tokës</p>
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
            <input type="text" name="contactInfo" placeholder="+383..." value={form.contactInfo} onChange={handleChange} className={inputCls} />
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

        {/* Images */}
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
                          className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 group"
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
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#FFAE42]/50 transition-colors text-white/40 hover:text-[#FFAE42]/70">
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          {submitting ? "Duke shtuar..." : "Shto Pronën"}
        </button>
      </form>
    </div>
  );
}

export default AddProperty;
