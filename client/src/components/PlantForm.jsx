import { useState } from "react";

function PlantForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    location: "",
    light: "",
    temperature: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      species: "",
      location: "",
      light: "",
      temperature: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Plant Name"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="species"
          value={formData.species}
          onChange={handleChange}
          placeholder="Species"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location (e.g., Jakarta)"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="light"
          value={formData.light}
          onChange={handleChange}
          placeholder="Light (e.g., Medium)"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="temperature"
          value={formData.temperature}
          onChange={handleChange}
          placeholder="Temperature (°C)"
          className="border p-2 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-plant-green text-white px-4 py-2 mt-4 rounded"
      >
        Add Plant
      </button>
    </form>
  );
}

export default PlantForm;
