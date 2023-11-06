import { useState, useEffect } from "react";
import { draftUrl, allDraftsUrl } from "./constants";

const useAllDrafts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(allDraftsUrl); // Use the URL and parameters to fetch data
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
};

const fetchSingleDraft = async (draftId) => {
  try {
    const response = await fetch(
      draftUrl.replace("<draft_id>", draftId),
      params
    ); // Use the URL and parameters to fetch data
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const jsonData = await response.json();
    setData(jsonData);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};

export { fetchSingleDraft, useAllDrafts };
