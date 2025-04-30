import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPlants, addPlant } from "../redux/slices/plantSlice";
import PlantForm from "../components/PlantForm";
import PlantCard from "../components/PlantCard";

function Plants() {
  const dispatch = useDispatch();
  const { plants, loading, error } = useSelector((state) => state.plants);

  useEffect(() => {
    dispatch(fetchPlants());
  }, [dispatch]);

  const handleAddPlant = (plantData) => {
    dispatch(addPlant(plantData));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">My Plants</h2>
      <PlantForm onSubmit={handleAddPlant} />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </div>
  );
}

export default Plants;
