import {
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from "redux-persist";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist"; // Added persistReducer and persistStore imports
import UserSlice from "./UserSlice";
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
    user: UserSlice,
    // Add other slices here if needed
});

const persistConfig = {
    key: "root",
    version: 1,
    storage,
};


const persistedReducer = persistReducer(persistConfig, rootReducer); // Renamed persistReducer to rootReducer

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export let persistor = persistStore(store);
export default store;
