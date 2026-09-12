import { useState, useEffect } from "react";
import { equipementsApi } from "../services/api";

export function useEquipments() {
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    equipementsApi
      .getAll()
      .then(setEquipements)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { equipements, loading, error };
}
