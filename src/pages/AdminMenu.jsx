import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMenu } from "../hooks/useMenu";
import { addMenuItem, updateMenuItem, deleteMenuItem } from "../services/menuService";
import "./adminMenu.css";

export default function AdminMenu() {
  const navigate = useNavigate();
  const { menuItems, loading } = useMenu();
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState("upload"); // "upload" | "url"
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [...new Set(menuItems.map(m => m.category))];

  const handleEdit = (item) => {
    setEditingItem(item.id);
    // Detect if stored image is base64 or a URL
    const isBase64 = (item.image || "").startsWith("data:");
    setUploadMode(isBase64 ? "upload" : "url");
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || ""
    });
  };

  const handleAddNew = () => {
    setEditingItem("NEW");
    setUploadMode("upload");
    setFormData({
      name: "",
      description: "",
      price: "",
      category: categories[0] || "",
      image: ""
    });
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, image: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      await deleteMenuItem(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem === "NEW") {
        await addMenuItem(formData);
      } else {
        await updateMenuItem(editingItem, formData);
      }
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Loading Menu DB...</p>
      </div>
    );
  }

  return (
    <div className="admin-menu-page">
      <div className="admin-menu-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
          <h1 className="page-title">⚙️ Menu Editor</h1>
        </div>
        <button className="btn-primary" onClick={handleAddNew}>+ Add New Item</button>
      </div>

      <div className="admin-grid-layout">
        {/* Left Side: Item List */}
        <div className="menu-database-list">
          {menuItems.map((item) => (
            <div key={item.id} className={`admin-menu-card ${editingItem === item.id ? 'active' : ''}`}>
              <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="admin-menu-img" loading="lazy" />
              <div className="admin-menu-info">
                <h3>{item.name}</h3>
                <span className="admin-menu-cat">{item.category}</span>
                <p className="admin-menu-price">₹{Number(item.price).toFixed(2)}</p>
              </div>
              <div className="admin-menu-actions">
                <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Editor Form Panel */}
        {editingItem && (
          <div className="menu-editor-panel">
            <h2>{editingItem === "NEW" ? "Create New Item" : "Edit Item"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Garlic Naan"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  required 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the item..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Breads"
                    list="categoryOptions"
                  />
                  <datalist id="categoryOptions">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="form-group">
                <div className="image-mode-tabs">
                  <button
                    type="button"
                    className={`img-mode-btn ${uploadMode === "upload" ? "active" : ""}`}
                    onClick={() => setUploadMode("upload")}
                  >
                    📁 Upload File
                  </button>
                  <button
                    type="button"
                    className={`img-mode-btn ${uploadMode === "url" ? "active" : ""}`}
                    onClick={() => setUploadMode("url")}
                  >
                    🔗 Image URL
                  </button>
                </div>

                {uploadMode === "upload" ? (
                  <div
                    className={`upload-dropzone ${isDragging ? "dragging" : ""} ${formData.image ? "has-image" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                    {formData.image && formData.image.startsWith("data:") ? (
                      <div className="upload-preview-wrap">
                        <img src={formData.image} alt="Preview" className="upload-preview-img" />
                        <div className="upload-overlay">
                          <span>🔄 Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <p>Click or drag an image here</p>
                        <span className="upload-hint">PNG, JPG, WEBP supported</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.image.startsWith("data:") ? "" : formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    {formData.image && !formData.image.startsWith("data:") && (
                      <div className="image-preview">
                        <img src={formData.image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="editor-actions">
                <button type="button" className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
