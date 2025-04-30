function PlantCard({ plant }) {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-xl font-bold">{plant.name}</h3>
      <p>Species: {plant.species}</p>
      <p>Location: {plant.location}</p>
      <p>Light: {plant.light}</p>
      <p>Temperature: {plant.temperature}°C</p>
    </div>
  );
}

export default PlantCard;
