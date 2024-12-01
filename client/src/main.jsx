import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppWrapper from "./App.jsx";
import "./index.css";
import store, { persistor } from "./redux/store.js"; // import persistor
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <>
    <Toaster position="top-right" reverseOrder={false} />
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper />
      </PersistGate>
    </Provider>
  </>
);
