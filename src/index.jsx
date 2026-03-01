import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import HomePage from "./pages/home/home";

const TeamsV2Page = lazy(() => import("./pages/teams/teams-v2"));
const TeamsPage = lazy(() => import("./pages/teams/teams"));
const DraftsPage = lazy(() => import("./pages/drafts/drafts"));
const TrendsPage = lazy(() => import("./pages/trends/trends"));
const MockDraftCenter = lazy(() => import("./pages/mock/mocks"));
const MockNew = lazy(() => import("./pages/mock/mocks-new"));
const Rosters = lazy(() => import("./pages/rosters"));
const PlayerDetailsPage = lazy(() => import("./pages/players"));

const Fallback = <div style={{ height: "100dvh", background: "#1f2126" }} />;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "player-value",
        element: <Suspense fallback={Fallback}><TeamsV2Page /></Suspense>,
      },
      {
        path: "teams",
        element: <Suspense fallback={Fallback}><TeamsPage /></Suspense>,
      },
      {
        path: "players",
        element: <Suspense fallback={Fallback}><TeamsPage /></Suspense>,
      },
      {
        path: "players/:playerId",
        element: <Suspense fallback={Fallback}><PlayerDetailsPage /></Suspense>,
      },
      {
        path: "drafts",
        element: <Suspense fallback={Fallback}><DraftsPage /></Suspense>,
      },
      {
        path: "rosters",
        element: <Suspense fallback={Fallback}><Rosters /></Suspense>,
      },
      {
        path: "mocks",
        element: <Suspense fallback={Fallback}><MockDraftCenter /></Suspense>,
      },
      {
        path: "mocks/new",
        element: <Suspense fallback={Fallback}><MockNew /></Suspense>,
      },
      {
        path: "mocks/:id",
        element: <Suspense fallback={Fallback}><MockNew /></Suspense>,
      },
      {
        path: "trends",
        element: <Suspense fallback={Fallback}><TrendsPage /></Suspense>,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </Provider>
  </React.StrictMode>
);
