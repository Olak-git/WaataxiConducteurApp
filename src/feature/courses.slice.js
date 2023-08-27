import { createSlice } from "@reduxjs/toolkit";

export const coursesSlice = createSlice({
    name: 'courses',
    initialState: {
        instantanee: [],
        covoiturage: [],
        reservation_covoiturage: [],
        reservation: [],
        history: {
            instantanes: [],
            covoiturages: [],
            reservations: []
        },
        configuration: null
    },
    reducers: {
        setStoreCourseInstantanee: (state, action) => {
            state.instantanee = [...action.payload]
        },
        setStoreCovoiturage: (state, action) => {
            state.covoiturage = [...action.payload]
        },
        setStoreReservationCovoiturage: (state, action) => {
            state.reservation_covoiturage = [...action.payload]
        },
        setStoreReservation: (state, action) => {
            state.reservation = [...action.payload]
        },
        setStoreHistoryCourses: (state, action) => {
            state.history = Object.assign(state.history, action.payload)
        },
        setCourseConfiguration: (state, action) => {
            state.configuration = action.payload
        },
        clearStoreCourses: (state) => {
            state.instantanee = [];
            state.covoiturage = [];
            state.reservation_covoiturage = [];
            state.reservation = [];
            state.history = {
                instantanes: [],
                covoiturages: [],
                reservations: []
            };
            state.configuration = null;
        }
    }
})

export default coursesSlice.reducer;
export const { setStoreCourseInstantanee, setStoreCovoiturage, setStoreReservationCovoiturage, setStoreReservation, setStoreHistoryCourses, setCourseConfiguration, clearStoreCourses } = coursesSlice.actions