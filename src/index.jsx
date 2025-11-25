import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import {
  HomePage,
  TrendsPage,
  TeamsPage,
  DraftsPage,
  TeamsV2Page,
} from "./pages";
import MockDraftCenter from "./pages/mock/mocks";
import { MockNew } from "./pages/mock";
import { Splash } from "./pages/splash";
import Rosters from "./pages/rosters";
import PlayerDetailsPage from "./pages/players";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Splash alt={(props) => <HomePage {...props} />} />,
      },
      {
        path: "player-value",
        element: <TeamsV2Page />,
      },
      {
        path: "teams",
        element: <TeamsPage />,
      },
      {
        path: "players",
        element: <TeamsPage />,
      },
      {
        path: "players/:playerId",
        element: <PlayerDetailsPage />,
      },
      {
        path: "drafts",
        element: <DraftsPage />,
      },
      {
        path: "rosters",
        element: <Rosters />,
      },
      {
        path: "mocks",
        element: <MockDraftCenter />,
      },
      {
        path: "mocks/new",
        element: <MockNew />,
      },
      {
        path: "mocks/:id",
        element: <Splash alt={() => <MockNew />} />,
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
    <Provider store={store}>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </Provider>
  </React.StrictMode>
);
