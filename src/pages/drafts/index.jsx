import React, { useEffect } from "react";
import Content from "../../components/layout/content";
import { useAllDrafts } from "../../sleeper/drafts";
/**
 *
 * @param {*} props
 * @returns
 * This page is supposed to be a multiseries chart that shows each draft slot vs ppg for that year, then marked red or someting if they were a keeper the following year?
 */
const DraftsPage = (props) => {
  const { data, loading, error } = useAllDrafts();
  useEffect(() => {}, [data]);

  return (
    <Content dark>
      <h1>Draft data coming soon...</h1>
    </Content>
  );
};

export default DraftsPage;
