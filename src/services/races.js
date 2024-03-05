import { api_ref } from "../functions/functions";

const getResponseJson = (response) => {
    return response.json()
}

const getErrorResponse = (error) => {
    console.log({ error });
}

export function acceptInstantRace(formData)
{
    return fetch(api_ref + '/accept_instant_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function acceptReservationInstantRace(params) {
    return fetch(api_ref + '/accept_reservation_instant_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function cancelInstantRace(params) {
    return fetch(api_ref + '/cancel_instant_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function cancelReservationInstantRace(params) {
    return fetch(api_ref + '/cancel_reservation_instant_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function checkAccount(params) {
    return fetch(api_ref + '/check_account.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function deleteAccount(params) {
    return fetch(api_ref + '/delete_account.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function deleteCarsharing(params) {
    return fetch(api_ref + '/delete_carsharing.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function editProfile(params) {
    return fetch(api_ref + '/edit_profile.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getCarsharings(params) {
    return fetch(api_ref + '/get_carsharings.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function get_cash(params) {
    return fetch(api_ref + '/get_cash.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getChart(params) {
    return fetch(api_ref + '/get_chart.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getClientRates(params) {
    return fetch(api_ref + '/get_client_rates.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getNewCodeForAuthAccount(params) {
    return fetch(api_ref + '/get_new_code_for_auth_account.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getNewInstantRaces(params) {
    return fetch(api_ref + '/get_new_instant_races.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function get_notifications(params) {
    return fetch(api_ref + '/get_notifications.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getRace(params) {
    return fetch(api_ref + '/get_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getRaces(params) {
    return fetch(api_ref + '/get_races.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getReservationsCarsharing(params) {
    return fetch(api_ref + '/get_reservations_carsharing.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getReservationsInstantRace(params) {
    return fetch(api_ref + '/get_reservations_instant_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function get_transactions(params) {
    return fetch(api_ref + '/get_transactions.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function getUserRate(params) {
    return fetch(api_ref + '/get_user_rate.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function newCarsharing(params) {
    return fetch(api_ref + '/new_carsharing.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function newPassword(params) {
    return fetch(api_ref + '/new_password.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function refreshHomeScreen(params) {
    return fetch(api_ref + '/refresh_home_screen.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function sendHelpMessage(params) {
    return fetch(api_ref + '/send_help_message.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function signin(params) {
    return fetch(api_ref + '/signin.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function signup(params) {
    return fetch(api_ref + '/signup.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updateClientRate(params) {
    return fetch(api_ref + '/update_client_rate.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updatePassword(params) {
    return fetch(api_ref + '/update_password.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updatePhoneNumber(params) {
    return fetch(api_ref + '/update_phone_number.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updatePriceReservationCarsharing(params) {
    return fetch(api_ref + '/update_price_reservation_carsharing.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updateStateAccount(params) {
    return fetch(api_ref + '/update_state_account.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updateStateCarsharingRace(params) {
    return fetch(api_ref + '/update_state_carsharing_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updateStateInstantRace(params) {
    return fetch(api_ref + '/update_state_instant_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updateStateReservationOrInstantRace(params) {
    return fetch(api_ref + '/update_state_reservation_or_instant_race.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}

export function updateWallet(params) {
    return fetch(api_ref + '/update_wallet.php', {
        method: 'POST',
        body: params.formData,
        headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
        }
    })
    .then(getResponseJson)
    .catch(getErrorResponse)
}
