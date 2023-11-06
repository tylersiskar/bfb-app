import React, { useEffect } from "react";
import Content from "../../components/layout/content";
import { useAllDrafts } from "../../sleeper/drafts";

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
