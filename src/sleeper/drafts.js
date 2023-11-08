import { useState, useEffect } from "react";
import { draftUrl, allDraftsUrl } from "./constants";

const useDraft = (year) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let drafts = {
    2023: "934894009888088065",
    2022: "812458201160237056",
  };

  useEffect(() => {
    let url = year
      ? draftUrl.replace("<draft_id>", drafts[year])
      : allDraftsUrl;
    async function fetchData() {
      try {
        const response = await fetch(url); // Use the URL and parameters to fetch data
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
  }, [year]);

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

export { fetchSingleDraft, useDraft };
