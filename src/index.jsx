import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import { HomePage, TrendsPage, TeamsPage, DraftsPage } from "./pages";
import MockDraftCenter from "./pages/mock/mocks";
import { MockNew } from "./pages/mock";

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
        path: "teams",
        element: <TeamsPage />,
      },
      {
        path: "drafts",
        element: <DraftsPage />,
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
        element: <MockNew />,
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
