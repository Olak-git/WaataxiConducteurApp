import { createSlice } from "@reduxjs/toolkit";
import { getVersion } from "react-native-device-info";

export const initSlice = createSlice({
    name: 'init',
    initialState: {
        presentation: false,
        welcome: false,
        with_portefeuille: false,
        otp_authentication: false,
        disponibilite: false,
        disponibilite_course: true,
        disponibilite_reservation: true,
        app_current_version: getVersion(),

        stopped: false,
        stopped_home_timer: false,
        stopped_courses_dispo_timer: false,
    },
    reducers: {
        setPresentation: (state, action) => {
            state.presentation = action.payload
        },
        setWelcome: (state, action) => {
            state.welcome = action.payload
        },
        setWithPortefeuille: (state, action) => {
            state.with_portefeuille = action.payload
        },
        setOtpAuthentication: (state, action) => {
            state.otp_authentication = action.payload
        },
        setDisponibilite: (state, action) => {
            state.disponibilite = action.payload
        },
        setDisponibiliteCourse: (state, action) => {
            state.disponibilite_course = action.payload
        },
        setDisponibiliteReservation: (state, action) => {
            state.disponibilite_reservation = action.payload
        },
        setStopped: (state, action) => {
            state.stopped = action.payload
        },
        setAppcurrentVersion: (state, action) => {
            state.app_current_version = action.payload
        }
    }
})

export default initSlice.reducer;
export const { setPresentation, setWelcome, setDisponibilite, setDisponibiliteCourse, setDisponibiliteReservation, setAppcurrentVersion, setStopped, setWithPortefeuille, setOtpAuthentication } = initSlice.actions