import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPlants, addPlant } from "../redux/slices/plantSlice";
import PlantForm from "../components/PlantForm";
import PlantCard from "../components/PlantCard";
import Shimmer from "../components/Shimmer";

function Plants() {
  const dispatch = useDispatch();
  const { plants, loading, errors } = useSelector((state) => state.plants);

  useEffect(() => {
    dispatch(fetchPlants());
  }, [dispatch]);

  const handleAddPlant = useCallback(
    (plantData) => dispatch(addPlant(plantData)).unwrap(),
    [dispatch]
  );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Tanaman Saya
      </h2>
      <PlantForm onSubmit={handleAddPlant} />
      {errors.fetchPlants && (
        <p className="text-red-500">{errors.fetchPlants}</p>
      )}
      {errors.addPlant && <p className="text-red-500">{errors.addPlant}</p>}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Shimmer type="card" count={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Plants;
