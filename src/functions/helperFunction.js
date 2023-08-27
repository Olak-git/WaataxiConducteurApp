// import { Dialog, Toast, ALERT_TYPE, Root } from 'react-native-alert-notification';
import { Platform, PermissionsAndroid, Linking, Alert, NativeModules } from "react-native";
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { getRandomInt } from "./functions";
import { google_maps_apikey } from '../data/data';
import {showLocation} from 'react-native-map-link';

export const customGenerateRandomNumber = (length = 4) => (Math.random().toString(10) + '00000000000').substring(2, length+2)

export const customGenerateRandomCharacter = (length = 4) => (Math.random().toString(36) + '00000000000').substring(2, length+2)

export const generateNewOtpCode = () => new Promise(async (resolve, reject) => {
    resolve(getRandomInt(10000, 99999));
})

export const getErrorsToString = (errors) => {
    let txt = '';
    if(typeof errors == 'object') {
        const l = Object.keys(errors).length - 1;
        let i = 0;
        for(let k in errors) {
            if(txt) txt += '\n';
            txt += '-' + errors[k];
            // txt += '-' + k.replace(/_/g, ' ').replace(/(nb )|( prov)/g, '').replace(/km/g, 'distance') + ': ' + errors[k];
        }
    } else {
        txt = errors;
    }
    return txt;
}

const MONTH = ['jan', 'fév', 'mar', 'avr', 'mai', 'ju', 'jui', 'août', 'sep', 'oct', 'nov', 'déc'];

export const toTimestamp = (strDate) => {
    var datum = Date.parse(strDate);
    return datum/1000;

    // let myDate = strDate.split("-");
    // var newDate = new Date(myDate[0], myDate[1] - 1, myDate[2]);
    // return newDate.getTime();
}

export const getLocalDate = (date) => {
    const _date = date.split(' ')[0];
    const explode = _date.split('-');
    const year = explode[0];
    const month = explode[1];
    const dat = explode[2];
    return dat + ' ' + MONTH[parseInt(month) - 1] + ' ' + year;
    return (new Date(date)).toLocaleString('fr-FR', {day: '2-digit', month: 'long', year: 'numeric'});
}

export const getLocalTime = (date) => {
    return date.slice(date.split(' ')[0].length + 1, date.length - 3);
    return (new Date(date)).toLocaleString('fr-FR', {hour: '2-digit', minute: '2-digit'});
}

export const getLocalTimeStr = (h) => {
    return h.slice(0, h.length - 3);
    return (new Date('2000-00-00 ' + h)).toLocaleString('fr-FR', {hour12: false, hour: '2-digit', minute: '2-digit'});
}

export const getSqlFormatDateTime = (date) => {
    return getSqlFormatDate(date) + ' ' + getSqlFormatTime(date);
}

export const getSqlFormatDate = (date) => {
    return JSON.parse(JSON.stringify(date)).slice(0, 10)
    return (new Date(date)).toLocaleDateString('ko-KR', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/(\. )/g, '/').replace(/\./g, '');
}

export const getSqlFormatTime = (date) => {
    let $time = (new Date(date)).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit', second: '2-digit'});
    const reg = /pm/ig;
    const pm = reg.test($time)
    $time = $time.toString().replace(/\s?(am|pm)/ig, '');
    let ar = $time.split(':');
    const hr = pm ? parseInt(ar[0])+12 : ar[0];
    const h = hr.toString().padStart(2, '0');
    const m = ar[1].padStart(2, '0');
    const s = ar[2].padStart(2, '0');
    $time = h+':'+m+':'+s;
    return $time;
}

export const formatChaineHid = (text, face, back) => text.slice(0, face) + text.slice(face, text.length-back).replace(/./g, '*') + text.slice(text.length-back, text.length);


export const clone = (obj) => Object.assign({}, obj);

export const getCurrentLocation = () => 
    new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            position => {
                const cords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    heading: position?.coords?.heading,
                };
                resolve(cords);
            },
            error => {
                console.log('Error: ', error)
                reject(error.message);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        )
    })

export const watchCurrentLocation = () => 
    new Promise((resolve, reject) => {
        Geolocation.watchPosition(
            position => {
                const cords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                resolve(cords);
            },
            error => {
                console.log('Error: ', error)
                reject(error.message);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        )
    })

export const locationPermission = () => new Promise(async (resolve, reject) => {
    if(Platform.OS == 'ios') {
        try {
            const permissionStatus = await Geolocation.requestAuthorization('whenInUse');
            if(permissionStatus == 'granted') {
                return resolve('granted')
            }
            reject('permission not granted')
        } catch(error) {
            return reject(error)
        }
    }
    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ).then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve('granted')
        }
        return reject('Location Permission denied')
    }).catch((error) => {
        console.log('Ask Location permission error: ', error)
    })
})

export const storagePermission = () => new Promise(async (resolve, reject) => {
    if(Platform.OS == 'ios') {
        return resolve('granted')
    }
    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        // {
        //     title: 'File',
        //     message:
        //         'App needs access to your Storage Memory... ',
        //     buttonNeutral: 'Ask Me Later',
        //     buttonNegative: 'Cancel',
        //     buttonPositive: 'OK',
        // },
    ).then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve('granted')
        }
        return reject('Storage Permission denied')
    }).catch((error) => {
        console.log('Ask Storage permission error: ', error)
    })
})

export const readPhonePermission = () => new Promise(async (resolve, reject) => {
    if(Platform.OS == 'ios') {
        return resolve('granted')
    }
    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
        {
            title: 'Phone',
            message:
                'App needs access to your Files... ',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
        },
    ).then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve('granted')
        }
        return reject('Storage Permission denied')
    }).catch((error) => {
        console.log('Ask Storage permission error: ', error)
    })
})

export const cameraPermission = () => new Promise(async (resolve, reject) => {
    if(Platform.OS == 'ios') {
        return resolve('granted')
    }
    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
    ).then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve('granted')
        }
        return reject('Camera Permission denied')
    }).catch((error) => {
        console.log('Ask Camera permission error: ', error)
    })
})

Geocoder.init(google_maps_apikey, {language : "fr"});
export const getCoordinateAddress = async (addr) => {
    let coordinate = {};
    await Geocoder.from(addr)
    .then(json => {
        let location = json.results[0].geometry.location;
        // console.log('StartCoords: ', location);
        coordinate = {latitude: location.lat, longitude: location.lng}
    })
    .catch(error => {
        console.warn(error)
    });

    console.log(coordinate);
    return coordinate;
}

export const openCoordonateOnMap = async (lat, lon, source=null) => {
    const coords = await getCurrentLocation();
    let destination;
    if(lat && lon) {
        destination = `${lat},${lon}`
    } else if(source) {
        destination = encodeURI(source)
    } else {
        destination = `${coords.latitude},${coords.longitude}`
    }
    openUrl(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&zoom=20&center=${destination}`)
}

// export const openCoordonateOnMap = async (origin_lat, origin_lon, destination_lat, destinantion_lng, origin_label=null, destination_label=null, use_label=false) => {
//     const coords = await getCurrentLocation();

//     const originLat = origin_lat||coords.latitude
//     const originLon = origin_lon||coords.longitude

//     let origin, destination;

//     if(origin_lat && origin_lon) {
//         origin = `${originLat},${originLon}`
//     } else {
//         origin = encodeURI(origin_label)
//     }

//     if(destination_lat && destinantion_lng) {
//         destination = `${destination_lat},${destinantion_lng}`
//     } else {
//         destination = encodeURI(destination_label)
//     }

//     console.log('origin: ', origin);
//     console.log('destination: ', destination);

//     // if(use_label) {
//     //     if(origin_lat && origin_lon) {
//     //         origin = `${originLat},${originLon}`
//     //     } else {
//     //         origin = encodeURI(origin_label)
//     //     }
//     //     if(destination_lat && destinantion_lng) {
//     //         destination = `${destination_lat},${destinantion_lng}`
//     //     } else {
//     //         destination = encodeURI(destination_label)
//     //     }
//     // } else {
//     //     origin = `${originLat},${originLon}`
//     //     destination = `${destination_lat},${destinantion_lng}`
//     // }

//     // if(use_label) {
//     //     origin = encodeURI(origin_label)
//     //     destination = encodeURI(destination_label)
//     // } else {
//     //     origin = `${originLat},${originLon}`
//     //     destination = `${destination_lat},${destinantion_lng}`
//     // }

//     openUrl(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&zoom=20&center=${destination}`)
//     return;

//     showLocation({
//         latitude: destination_lat,
//         longitude: destinantion_lng,
//         sourceLatitude: originLat, // spécifier éventuellement l'emplacement de départ pour les directions
//         sourceLongitude: originLon, // non facultatif si sourceLatitude est spécifié
//         title: label||'Point de rencontre', // facultatif
//         googleForceLatLon: false, // forcer éventuellement GoogleMaps à utiliser le latlon pour la requête au lieu du titre
//         // googlePlaceId: 'ChIJGVtI4by3t4kRr51d_Qm_x58', // spécifiez éventuellement le google-place-id
//         alwaysIncludeGoogle: true, // facultatif, true ajoutera toujours Google Maps à iOS et s'ouvrira dans Safari, même si l'application n'est pas installée (par défaut : false)
//         // dialogTitle: 'Ouvrir dans Maps', // facultatif (par défaut : 'Ouvrir dans Maps')
//         // dialogMessage : 'Quelle application souhaitez-vous utiliser?', // facultatif (par défaut : 'Quelle application souhaitez-vous utiliser ?')
//         // cancelText : 'Annuler', // facultatif (par défaut : 'Annuler')
//         appsWhiteList : ['google-maps'], // en option, vous pouvez définir les applications à afficher (par défaut : affichera toutes les applications prises en charge installées sur l'appareil)
//         // naverCallerName : 'com.example.myapp', // pour créer un lien vers Naver Map Vous devez fournir votre nom d'application qui est l'ID du paquet dans iOS et l'applicationId dans Android.
//         // appTitles : { 'google-maps' : 'Mon titre Google Maps personnalisé' }, // en option, vous pouvez remplacer les titres d'application par défaut
//         // app : 'uber', // éventuellement spécifier une application spécifique à utiliser
//         app: "google-maps",
//         directionsMode : 'car', // facultatif, les valeurs acceptées sont 'car', 'walk', 'public-transport' ou 'bike'
//     }) ;
// }

export const openUrl = async (url) => {
    const supported = await Linking.canOpenURL(url);
    
    console.log(`Link pressed: ${url}`);

    if (supported) {
        // Opening the link with some app, if the URL scheme is "http" the web link should be opened
        // by some browser in the mobile
        await Linking.openURL(url);
    } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);

        // Alert.alert(
        //     `Don't know how to open this URL`,
        //     '',
        //     [
        //         {text: 'OK', onPress: ()=>console.log('Bravo'), style: 'default'},
        //         {text: 'Copie', onPress: ()=>console.log('Copier'), style: 'default'}
        //     ]
        // );
    }
}

export const callPhoneNumber = (number) => {
    const phoneNumber = `${Platform.OS !== 'android' ? 'telprompt' : 'tel'}:${number}`;
    openUrl(phoneNumber);
}

// const hasPermission = async () => {
//     if(Platform.OS == 'android') {
//         const granted = await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//             {
//               title: 'File',
//               message:
//                 'App needs access to your Files... ',
//               buttonNeutral: 'Ask Me Later',
//               buttonNegative: 'Cancel',
//               buttonPositive: 'OK',
//             },
//         );
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             return true;
//         }
//     } else {
//         return true;
//     }
//     return false
// }