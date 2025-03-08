import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connection",
  initialState: [], // Cambiado de null a array vacío
  reducers: {
    addConnections: (state, action) => action.payload,
    removeConnections: () => [], // Cambiado de null a array vacío
    removeConnection: (state, action) => {
      return state.filter(connection => connection._id !== action.payload);
    }
  },
});

export const { addConnections, removeConnections, removeConnection } = connectionSlice.actions;
export default connectionSlice.reducer;