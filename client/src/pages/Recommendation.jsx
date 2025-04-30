import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { fetchWeather } from "../redux/slices/weatherSlice";

function Recommendation() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
  } = useSelector((state) => state.weather);
  const [formData, setFormData] = useState({
    species: "",
    location: "",
    light: "",
    temperature: "",
  });
  const [recommendation, setRecommendation] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/recommendation/care",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecommendation(response.data.recommendation);
      dispatch(fetchWeather(formData.location));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Care Recommendation</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          Get Recommendation
        </button>
      </form>
      {recommendation && (
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-xl font-bold">Recommendation</h3>
          <p>{recommendation}</p>
        </div>
      )}
      {weather && (
        <div className="bg-white p-4 rounded shadow-md mt-4">
          <h3 className="text-xl font-bold">Weather in {formData.location}</h3>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Description: {weather.description}</p>
        </div>
      )}
    </div>
  );
}

export default Recommendation;
