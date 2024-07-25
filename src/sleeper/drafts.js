import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectLeague } from "../api/leagueSlice";
import { draftUrl, allDraftsUrl } from "./constants";

const useDraft = (year) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let { draft_id } = useSelector(selectLeague);
  useEffect(() => {
    let url = year ? draftUrl.replace("<draft_id>", draft_id) : allDraftsUrl;
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

export { useDraft };
