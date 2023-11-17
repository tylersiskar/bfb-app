import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import DraftsPage from "./pages/drafts";
import TeamsPage from "./pages/teams";
import TrendsPage from "./pages/trends";
import HomePage from "./pages/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <TeamsPage />,
      },
      {
        path: "teams",
        element: <TeamsPage />,
      },
      {
        path: "drafts",
        element: <DraftsPage />,
      },
      {
        path: "trends",
        element: <TrendsPage />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
