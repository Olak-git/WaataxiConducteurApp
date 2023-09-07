import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Pressable, ScrollView, useWindowDimensions, FlatList, Dimensions, StatusBar, DeviceEventEmitter, PixelRatio, Alert, RefreshControl } from 'react-native';
import Base from '../../../components/Base';
import MapView, { AnimatedRegion, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { google_maps_apikey, imageMapPath, LATITUDE_DELTA, LONGITUDE_DELTA, polices } from '../../../data/data';
import tw from 'twrnc';
import { locationPermission, getCurrentLocation, getErrorsToString, openUrl, openCoordonateOnMap, callPhoneNumber } from '../../../functions/helperFunction';
import { ActivityLoading } from '../../../components/ActivityLoading';
import Header from '../../../components/Header';
import { Divider, Icon } from '@rneui/base';
import { ColorsEncr } from '../../../assets/styles';
import Geocoder from 'react-native-geocoding';
import { useDispatch, useSelector } from 'react-redux';
import { setDialogCovoiturage } from '../../../feature/dialog.slice';
import RNMarker from '../../../components/RNMarker';
import { baseUri, fetchUri, toast, windowHeight } from '../../../functions/functions';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import { setDisponibiliteCourse, setDisponibiliteReservation } from '../../../feature/init.slice';
import { addCourse, setCourse as setCourseSlice, addReservation, setReservation } from '../../../feature/course.slice';
import { CommonActions } from '@react-navigation/native';
import { refreshCourse, refreshCovoiturage, refreshReservation } from '../../../feature/refresh.slice';
import FlashMessage from '../../../components/FlashMessage';
import CompoMarker from '../../../components/CompoMarker';
import CompoMarkerAnimated from '../../../components/CompoMarkerAnimated';
import { RNPModal } from '../../../components/RNPModal';
import { RNSpinner } from '../../../components/RNSpinner';

Geocoder.init(google_maps_apikey, {language : "fr"});

const {height: screenHeight, width: screenWidth} = Dimensions.get('screen');

interface RenderItembuttonChoiceLocationProps {
    callAction: any,
    data: any,
    stateCoords: any,
}
const BottomButton: React.FC<{buttonTitle: string, pressAction?: any, mapsCoords?: any}> = ({buttonTitle, pressAction, mapsCoords}) => {
    const onHandleMaps = async () => {
        openCoordonateOnMap(mapsCoords.latitude, mapsCoords.longitude)
    }

    return (
        <View style={[ tw`bg-white py-4`,  {width: '100%', borderTopEndRadius: 24, borderTopStartRadius: 24} ]}>
            <View style={[ tw`px-30 my-3` ]}>
                <Divider />
            </View>
            <View style={[ tw`px-8` ]}>
                <TouchableOpacity
                    onPress={pressAction}
                    style={[ tw`p-2 rounded-md border border-slate-300`, {}]}>
                    <Text style={[ tw`text-center font-semibold text-black text-lg`, {fontFamily: polices.times_new_roman} ]}>{buttonTitle}</Text>
                </TouchableOpacity>
                {mapsCoords && (
                    <Icon type='material-community' name='arrow-right-top-bold' containerStyle={tw`mt-4`} onPress={onHandleMaps} />
                )}
            </View>
        </View>
    )
}

const RenderItemCourse = (props: any) => {
    const { item, index, itemSelected, setItemSelected, onClose } = props
    const [coords, setCoords] = useState({})

    const foundCoords = async () => {
        if(item.latlng_depart) {
            const coords1 = JSON.parse(item.latlng_depart);
            setCoords({
                index: index+1,
                keys: item.id,
                points: {latitude: coords1.latitude, longitude: coords1.longitude},
                addr: {
                    start: item.adresse_depart,
                    end: item.adresse_arrive
                }
            })
        } else {
            await Geocoder.from(item.adresse_depart)
            .then(json => {
                let location = json.results[0].geometry.location;
                // console.log('Coords: ', location);
    
                setCoords({
                    index: index+1,
                    keys: item.id,
                    points: {latitude: location.lat, longitude: location.lng},
                    addr: {
                        start: item.adresse_depart,
                        end: item.adresse_arrive
                    }
                })
            })
            .catch(error => {
                console.warn(error)
            });
        }
    }

    const onSelected = () => {
        if(Object.keys(itemSelected).length != 0 && itemSelected.keys == item.id) {
            setItemSelected({})
        } else {
            setItemSelected(coords)
        }
        const timer = setTimeout(onClose, 300)
    }

    useEffect(() => {
        foundCoords()
    }, [])

    return (
        <View style={tw`flex-row mb-5`}>
        <Pressable onPress={onSelected} style={[tw`flex-1 flex-row relative`]}>
            {itemSelected.keys == item.id && (
                <Icon type="ant-design" name="checkcircle" containerStyle={tw`absolute z-10 top-10 left-10`} />
            )}
            <Image
                source={item.passager.img ? {uri: baseUri + '/assets/avatars/' + item.passager.img} : require('../../../assets/images/user-1.png')}
                style={[ tw`rounded-2xl border-2 border-orange-300 mr-1`, {width: 60, height: 60}]}
            />
            <View style={tw`flex-1`}>
                <View style={tw`flex-row mb-1`}>
                    <Image source={require("../../../assets/images/icons8-epingle-de-carte-windows-11-color/icons8-epingle-de-carte-96.png")} style={[tw`mr-1`,{width:20, height:20}]} />
                    {/* <Icon type='material-community' name={'map-marker-outline'} size={18} color='green' style={tw`mr-1`} /> */}
                    <Text style={[ tw`flex-1 text-gray-400 text-xs`, {fontFamily: polices.times_new_roman} ]}>{item.adresse_depart}lokjijoihu hiuhiuhuhugiyufyftfyguyppppppppppppppppp</Text>
                </View>
                <View style={tw`flex-row mb-2`}>
                    <Image source={require("../../../assets/images/epingle-carte.png")} style={[tw`mr-1`,{width:20, height:20}]} />
                    {/* <Icon type='material-community' name={'map-marker-outline'} size={18} color={ColorsEncr.main} style={tw`mr-1`} /> */}
                    <Text style={[ tw`flex-1 text-gray-400 text-xs`, {fontFamily: polices.times_new_roman} ]}>{item.adresse_arrive}</Text>
                </View>
                <View style={tw`flex-row items-center`}>
                    <Icon type="feather" name="phone" size={18} color="#bbb" containerStyle={tw`mr-1`} />
                    <Text style={[tw`text-black text-sm`, {fontFamily: polices.times_new_roman}]} onPress={() => callPhoneNumber(item.passager.tel)}>({item.passager.tel})</Text>
                </View>
            </View>
        </Pressable>
        <View style={tw`self-end`}>
            <Icon type='material-community' name='arrow-right-top-bold' iconStyle={tw`p-1`} onPress={() => openCoordonateOnMap(coords.points.latitude, coords.points.longitude, coords.addr.start)} />
        </View>
        </View>
    )
}
const ReservationCovoiturageModl: React.FC<{visible: boolean, onClose: ()=>void, course_key: string, user_key: string, courses: Array<any>|undefined, itemSelected: any, setItemSelected: (a:any)=>void}> = ({visible, onClose, course_key, user_key, courses, itemSelected, setItemSelected}) => {
    const [reservationsCovoiturage, setReservationsCovoiturage] = useState(courses||[]);
    const [coordsReservationsCovoiturage, setCoordsReservationsCovoiturage] = useState([]);
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const getReservations = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('reservations-covoiturage', null);
        formData.append('token', user_key);
        formData.append('course', course_key);
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            if(json.success) {
                // console.log('Reservations: ', json.reservations);
                setReservationsCovoiturage([...json.reservations]);
            } else {
                const errors = json.errors;
                console.log(errors);
            }
        })
        .catch(error => {
            console.log(error);
        })
        .finally(()=>{
            setLoading(false)
            setRefreshing(false)
        })
    }

    const onRefresh = () => {
        setRefreshing(true)
        getReservations()
    }

    // @ts-ignore
    const renderItem = ({item, index}) => <RenderItemCourse item={item} index={index} itemSelected={itemSelected} setItemSelected={setItemSelected} onClose={onClose} />

    useEffect(() => {
        getReservations()
    }, [])
    
    return (
        <RNPModal animationType='slide' showModal={visible} containerStyle={[tw``]}>
            <View style={[tw`justify-end`,{width: '100%', height: '100%'}]}>
                <View style={[tw`bg-white rounded-t-3xl`, {height: windowHeight/2, width: '100%'}]}>
                    <View style={tw`items-end`}>
                        <Icon type="fontawesome" name="close" reverse size={16} onPress={onClose} />
                    </View>
                    <FlatList 
                        refreshControl={
                            <RefreshControl
                                colors={['red', 'blue', 'green']}
                                refreshing={refreshing} 
                                onRefresh={onRefresh}
                            />
                        }
                        data={reservationsCovoiturage}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        ListHeaderComponent={loading?<RNSpinner visible={loading} />:undefined}
                        ListEmptyComponent={ 
                            <View>
                                <Text style={[tw`text-gray-400 text-base`, {fontFamily: polices.times_new_roman}]}>Aucune réservation disponible</Text>
                            </View>
                        }
                        contentContainerStyle={[ tw`px-4 pb-2` ]}
                    />
                </View>
            </View>
        </RNPModal>
    )
}

interface ItineraireViewProps {
    navigation: any,
    route: any
}
const ItineraireView: React.FC<ItineraireViewProps> = ({ navigation, route }) => {

    const mapRef = useRef();
    const markerRef = useRef();
    const flatRef = useRef(null);

    const {disponibilite_course, disponibilite_reservation} = useSelector((state: any) => state.init);

    const [itemSelected, setItemSelected] = useState({})

    const [visible, setVisible] = useState({
        modal: false,
        description_start: false,
        description_end: false,
        reservation_course: false
    });

    const [show, setShow] = useState(false)

    const { width: useWindowWidth, height: useWindowHeight } = useWindowDimensions();

    const { category } = route.params;

    const [course, setCourse] = useState(route.params.course);

    const stateCourse = course.etat_course;

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const dialog = useSelector((state: any) => state.dialog.covoiturage);

    const init = useSelector((state:any) => state.init);

    const [currentCoords, setCurrentCoords] = useState({});

    const [startFetch, setStartFetch] = useState(false);

    const [endFetch, setEndFetch] = useState(false);

    const [startAddress, setStartAddress] = useState(course.adresse_depart);

    const [endAddress, setEndAddress] = useState(course.adresse_arrive);

    const [distance, setDistance] = useState('0 m');

    const [duration, setDuration] = useState('0 s');

    var timer: any = null;

    const delta = {
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA        
    }

    const [state, setState] = useState({
        startingCords: {},
        destinationCords: {},
        coordinate: new AnimatedRegion({
            latitude: 0,
            longitude: 0,
            ...delta
        }),
        isLoading: false
    });
    const {startingCords, destinationCords, isLoading, coordinate} = state;

    const showReservationCourse = () => {
        setVisible(prev => ({...prev, reservation_course: true}))
    }
    const hideReservationCourse = () => {
        setVisible(prev => ({...prev, reservation_course: false}))
    }

    const onCenter = () => {
        // @ts-ignore
        mapRef.current?.animateToRegion({
            ...startingCords,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    }

    const onCenterReverse = () => {
        // @ts-ignore
        mapRef.current?.animateToRegion({
            ...destinationCords,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    }

    const fetchValues = (data: any) => {
        // console.log('Data: ', data);
        if(data.hasOwnProperty('pickupCords') && Object.keys(data.pickupCords).length > 0) {
            setState(state => ({
                ...state,
                startingCords: {
                    ...data.pickupCords
                },
                coordinate: new AnimatedRegion({
                    ...coordinate,
                    ...data.pickupCords
                }),
            }));
            setStartAddress(data.pickupCords.address);
            onCenter();
        }
        if(data.hasOwnProperty('destinationCords') && Object.keys(data.destinationCords).length > 0) {
            setState(state => ({
                ...state,
                destinationCords: {
                    ...data.destinationCords
                }
            }));
            setEndAddress(data.destinationCords.address);
        }
    }

    const getCoordonates = async () => {
        if(course.latlng_depart) {
            const coords1 = JSON.parse(course.latlng_depart)
            fetchValues({pickupCords: {...coords1, address: startAddress}});

            const coords2 = JSON.parse(course.latlng_arrive)
            fetchValues({pickupCords: {...coords2, address: endAddress}});
        } else {
            await Geocoder.from(startAddress)
            .then(json => {
                let location = json.results[0].geometry.location;
                // console.log('StartCoords: ', location);
                fetchValues({pickupCords: {latitude: location.lat, longitude: location.lng, address: startAddress}});
                // setStartFetch(true);
            })
            .catch(error => {
                console.warn(error)
            });
    
            await Geocoder.from(endAddress)
            .then(json => {
                let location = json.results[0].geometry.location;
                // console.log('EndCoords: ', location);
                fetchValues({destinationCords: {latitude: location.lat, longitude: location.lng, address: endAddress}});
                // setEndFetch(true);
            })
            .catch(error => {
                console.warn(error)
            });
        }
    }

    const animate = (latitude: number, longitude: number) => {
        const newCoordinate = {latitude, longitude};
        if(Platform.OS == 'android') {
            // @ts-ignore
            markerRef.current?.animateMarkerToCoordinate(newCoordinate, 7000)
        } else {
            // @ts-ignore
            coordinate.timing(newCoordinate).start();
        }
    }

    const getLiveLocation = async () => {
        const locPermissionDenied = await locationPermission()
        if(locPermissionDenied) {
            const res = await getCurrentLocation();
            const {latitude, longitude} = res
            animate(latitude, longitude);
            // console.log('CurrentCoordinates: ', res);
            setCurrentCoords(res)
            setState({
                ...state,
                startingCords: {
                    ...startingCords,
                    ...res
                    // latitude: res.latitude,
                    // longitude: res.longitude
                },
                coordinate: new AnimatedRegion({
                    ...coordinate,
                    ...res
                }),
                isLoading: true
            })

            Geocoder.from({lat: res.latitude, lng: res.longitude})
                    .then(json => {
                        setStartAddress(json.results[0].formatted_address);
                        console.log(json.results[0].formatted_address)
                    })
                    .catch(error => console.warn(error));
        }
    }

    const currentCoordonates = async () => {
        const locPermissionDenied = await locationPermission()
        if(locPermissionDenied) {
            const response = await getCurrentLocation();
            // console.log('Response: ', response);
            const {latitude, longitude} = response;
            animate(latitude, longitude);


            if(Object.keys(currentCoords).length == 0) {
                setCurrentCoords(
                    new AnimatedRegion({
                        latitude: latitude,
                        longitude: longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA
                    })
                )
            } else {
                // console.log('Yak');
                const newCoordinate = {latitude, longitude};
                if(Platform.OS == 'android') {
                    // @ts-ignore
                    markerRef.current?.animateMarkerToCoordinate(newCoordinate, 7000)
                } else {
                    // @ts-ignore
                    // currentCoords.timing(newCoordinate).start();
                }
            }
        }
    }

    const onStateCourse = async (action: string) => {
        const locPermissionDenied = await locationPermission()
        if(locPermissionDenied) {
            setVisible(state => ({...state, modal: true}));
            hideReservationCourse()
            const response = await getCurrentLocation();
            if(action == 'start') {
                if(category == 'reservation') {
                    dispatch(addReservation({[course.slug]: {origin: response}}))
                } else if(category == 'ci') {
                    dispatch(addCourse({ [course.slug]: { origin: response } }))
                }
            } else if(action == 'end') {
                if(category == 'reservation') {
                    dispatch(setReservation({[course.slug]: {end: response}}))
                } else if(category == 'ci') {
                    dispatch(setCourseSlice({ [course.slug]: { end: response } }))
                }
            }
            const formData = new FormData();
            formData.append('js', null);
            if(category == 'reservation') {
                formData.append('upd-state-reservation', action);
            } else if(category == 'ci') {
                formData.append('upd-state-course', action);
            } else if(category == 'covoiturage') {
                formData.append('upd-state-covoiturage', action);
            }
            formData.append('token', user.slug);
            formData.append('course', course.slug);
            fetch(fetchUri, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(json => {
                setVisible(state => ({...state, modal: false}));
                if(json.success) {
                    if(category == 'ci') {
                        dispatch(refreshCourse());
                    } else if(category == 'reservation') {
                        dispatch(refreshReservation());
                    } else if(category == 'covoiturage') {
                        dispatch(refreshCovoiturage());
                    }
                    setCourse((state: any) => ({...state, ...json.course}));
                    if(action == 'end') {
                        if(category == 'covoiturage') {
                            navigation.goBack();
                        } else {
                            if(category == 'ci') {
                                dispatch(setDisponibiliteCourse(true));
                            } else if(category == 'reservation') {
                                dispatch(setDisponibiliteReservation(true));
                            }
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{name: 'DashFinition', params: {course: course, category: category}}]
                                })
                            )
                        }
                    } else if(category == 'reservation' && action == 'start') {
                        dispatch(setDisponibiliteReservation(false));
                    }
                    // setCourse((state: any) => ({...state, ...json.course}));
                    // dispatch(setReload());
                } else {
                    const errors = json.errors;
                    console.log(errors);
                    const txt = getErrorsToString(errors);
                    toast('DANGER', txt, false);
                }
            })
            .catch(error => {
                setVisible(state => ({...state, modal: false}));
                console.log(error)
            })
        }
    }

    const onAcceptCourse = () => {
        setVisible(state => ({...state, modal: true}));
        hideReservationCourse()
        const formData = new FormData();
        formData.append('js', null);
        formData.append('token', user.slug);
        if(category == 'ci') {
            formData.append('accept-course', null);
            formData.append('course', course.slug);
        } else if(category == 'reservation') {
            formData.append('accept-reservation', null);
            formData.append('reservation', course.slug);
        }
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            setVisible(state => ({...state, modal: false}));
            if(json.success) {
                setCourse((state: any) => ({...state, ...json.course}));
                if(category == 'ci') {
                    dispatch(setDisponibiliteCourse(false));
                    dispatch(refreshCourse());
                } else if(category == 'reservation') {
                    dispatch(refreshReservation());
                    setTimeout(() => {
                        navigation.goBack();
                    }, 2000);
                }
            } else {
                const errors = json.errors;
                console.log(errors);
                const txt = getErrorsToString(errors);
                toast('DANGER', txt, false);
            }
        })
        .catch(error => {
            setVisible(state => ({...state, modal: false}));
            console.log(error)
        })
    }

    useEffect(() => {
        if(true) {
            timer = setInterval(() => {
                currentCoordonates();
            }, 1000)
        }
        // console.log('state: ', stateCourse);
        return () => {
            if(timer !== null) {
                clearInterval(timer);
            }
        }
    }, [])

    useEffect(() => {
        getCoordonates();
        return () => {
            setStartFetch(false);
            setEndFetch(false);
            // @ts-ignore
            setState(prevState => ({
                ...prevState,
                startingCords: {},
                destinationCords: {},
                isLoading: false
            }))
        }
    }, [])

    useEffect(() => {
        if(Object.keys(startingCords).length > 0 && Object.keys(destinationCords).length > 0) {
            setStartFetch(true);
            setEndFetch(true);
            // setState({
            //     ...state,
            //     isLoading: true
            // })
        }
        if(startFetch && endFetch) {
            setState({
                ...state,
                isLoading: true
            })
        }
    }, [startingCords, destinationCords])

    useEffect(() => {
        if(!show) {
            onCenter()
        }
    }, [show])

    return (
        <Base>
            {category == 'covoiturage' && (
                <ReservationCovoiturageModl visible={visible.reservation_course} onClose={hideReservationCourse} course_key={course.slug} user_key={user.slug} courses={route.params.reservations} itemSelected={itemSelected} setItemSelected={setItemSelected} />
            )}

            <ModalValidationForm showModal={visible.modal} />
            {startFetch && endFetch
            ?
                <>
                <View style={[ tw`bg-white p-2`, {minHeight: 100} ]}>
                    <View style={[ tw`flex-row items-start` ]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={[ tw`rounded p-3 px-2`, {backgroundColor: 'transparent'} ]}>
                            <Icon 
                                type='ant-design'
                                name='arrowleft'
                                size={20} />
                        </TouchableOpacity>

                        <View style={[ tw`flex-1 flex-row px-3` ]}>
                            <View style={[ tw`justify-around mr-1` ]}>
                                <Icon type='font-awesome' name='circle-thin' size={18} containerStyle={tw`mt-2`} />
                                <Icon type='material-community' name='dots-vertical' size={20} color={'silver'} />
                                <Icon type='material-community' name='map-marker-outline' size={20} color={'red'} containerStyle={tw`mb-2`} />
                            </View>
                            <View style={[ tw`flex-1` ]}>
                                <View style={[ tw`border border-slate-200 rounded-md mb-2 bg-gray-200` ]}>
                                    <Text style={[ tw`p-3 text-slate-600`, {fontFamily: polices.times_new_roman} ]} numberOfLines={1} ellipsizeMode='tail'>{startAddress}</Text>
                                </View>
                                <View style={[ tw`border border-slate-200 rounded-md bg-gray-200` ]}>
                                    <Text style={[ tw`p-3 text-slate-600`, {fontFamily: polices.times_new_roman} ]} numberOfLines={1} ellipsizeMode='tail'>{endAddress}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[ tw`flex-row justify-between px-2 mt-3` ]}>
                        <View style={[ tw`flex-row items-center bg-orange-100 rounded-2xl py-1 px-3` ]}>
                            {endFetch && startFetch && (
                                <Icon type='material-community' name='approximately-equal' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            )}
                            <Icon type='font-awesome-5' name='car-alt' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            <Text style={[ tw`text-xs`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]}>{distance}</Text>
                        </View>
                        <View style={[ tw`flex-row items-center bg-orange-100 rounded-2xl py-1 px-3` ]}>
                            {endFetch && startFetch && (
                                <Icon type='material-community' name='approximately-equal' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            )}
                            <Icon type='material-community' name='clock' size={20} iconStyle={{ color: ColorsEncr.main }} />
                            <Text style={[ tw`text-xs ml-1`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]}>{duration}</Text>
                        </View>
                    </View>
                </View>
                <View style={{flex: 1}}>
                    <MapView
                        // @ts-ignore
                        ref={mapRef}
                        style={StyleSheet.absoluteFill}
                        // @ts-ignore
                        initialRegion={
                            Object.keys(startingCords).length > 0 ? {
                                ...startingCords,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA
                            } : undefined
                        }
                        onPress={(e) => {
                            setVisible((state) => ({...state, description_start: false, description_end: false}))
                            // @ts-ignore
                            // setCurrentCoords(e.nativeEvent.coordinate)
                            // currentCoordonates();
                            // const {latitude, longitude} = e.nativeEvent.coordinate
                        }}
                    >
                        {/* icons8-voiture-vue-du-dessus-ios-16-filled/icons8-voiture-vue-du-dessus-100.png */}
                        {/* icons8-automobile-color/icons8-automobile-96.png */}
                        {/*
                        * (1) : Affiche un marqueur montrant la position du chauffeur pendant la course
                        * (2) : Affiche un marqueur montrant la position courante du chauffeur
                         */}
                        {stateCourse > 1
                            ?   <CompoMarkerAnimated 
                                    source={require("../../../assets/images/icons8-voiture-vue-du-dessus-ios-16-filled/icons8-voiture-vue-du-dessus-100.png")}
                                    mapRef={mapRef} rotate={120}
                                />
                            :   <CompoMarkerAnimated 
                                    source={require("../../../assets/images/icons8-street-view-100.png")}
                                    mapRef={mapRef} show={show} imageStyle={{transform: [{rotate: `0deg`}]}}
                                />
                        }

                        {/* Affiche un marqueur indiquqnt le point de départ d'une course */}
                        <CompoMarker coords={startingCords} title='Départ' description={startAddress} source={require("../../../assets/images/icons8-epingle-de-carte-windows-11-color/icons8-epingle-de-carte-96.png")} imageStyle={{}} />

                        {/* Affiche le marqueur du point de rencontre pour une réservation de covoiturage */}
                        {Object.keys(itemSelected).length!==0 && (
                            // @ts-ignore
                            <CompoMarker coords={itemSelected.points} title={`Point ${itemSelected.index}`} description={itemSelected.addr.start} 
                                source={require("../../../assets/images/localisation-user.png")} 
                                // source={require("../../../assets/images/icons8-epingle-de-carte-color/icons8-epingle-de-carte-96.png")} 
                            />
                        )}

                        { Object.keys(destinationCords).length > 0 && (
                            <>
                                {/* Affiche un marqueur indiquqnt la destination d'une course */}
                                <CompoMarker coords={destinationCords} title='Arrivé' description={endAddress} source={require("../../../assets/images/epingle-carte.png")} />

                                {/* @ts-ignore */}
                                <MapViewDirections
                                    origin={startingCords}
                                    // @ts-ignore
                                    destination={destinationCords}
                                    apikey={ google_maps_apikey }
                                    language='fr'
                                    optimizeWaypoints={true}
                                    mode='DRIVING' //'WALKING'
                                    precision='high'
                                    strokeWidth={5}
                                    strokeColor="hotpink"
                                    lineDashPattern={[0]}
                                    onStart={params => {
                                        console.log('Params', params);
                                        // {origin, destination, waypoints} = params
                                    }}
                                    // lineCap=''
                                    onReady={result => {
                                        const {distance, duration, coordinates, legs} = result
                                        const data = legs[0];

                                        // const steps = data.steps;
                                        // for(let k in steps) {
                                        //     console.log(k, steps[k]);
                                        // }

                                        // console.log('Result: ', result);
                                        // setStartAddress(data.start_address);
                                        // setEndAddress(data.end_address);
                                        setDistance(data.distance.text);
                                        setDuration(data.duration.text.replace(/heures?/g, 'h').replace(/minutes?/g, 'm').replace(/secondes?/g, ''))
                                        // @ts-ignore
                                        mapRef.current.fitToCoordinates(result.coordinates, {
                                            edgePadding: {
                                                right: 30,
                                                bottom: 300,
                                                left: 30,
                                                top: 100
                                            }
                                        })
                                    }}
                                    onError={errorMessage => {
                                        console.log(errorMessage);
                                    }}
                                />
                            </>
                        )}
                    </MapView>

                    {/* Dans le cadre d'une course de covoiturage, ce bouton est utilisé pour afficher ou non les réservations pour ladite course */}
                    {category == 'covoiturage' && (
                        <TouchableOpacity
                            onPress={showReservationCourse}
                            style={[ tw`absolute rounded top-1 right-1 p-3`, {backgroundColor: 'rgba(255, 255, 255, 0.5)'} ]}>
                            <Icon type="material-icon" name="location-searching" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={onCenter}
                        style={[ tw`absolute rounded bottom-1 right-1 p-3`, {backgroundColor: 'rgba(255, 255, 255, 0.5)'} ]}>
                        <Image 
                            source={imageMapPath.icMapCenter}
                            style={{width: 25, height: 25}} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onCenterReverse}
                        style={[ tw`absolute rounded bottom-1 left-1 p-3`, {backgroundColor: 'rgba(255, 255, 255, 0.5)'} ]}>
                            <Icon type='font-awesome-5' name='compress-arrows-alt' />
                    </TouchableOpacity>

                    {/* Selon que la course n'a pas encore démarré, ce bouton est utilisé pour laisser apparaître ou non la position du chauffeur à un moment t */}
                    {(stateCourse == 0 || ((category == 'ci' || category == 'reservation') && stateCourse == 1)) && (
                        <TouchableOpacity
                            onPress={()=>setShow(!show)}
                            style={[ tw`absolute rounded bottom-1 right-15 p-3`, {backgroundColor: show?'rgba(0,0,0,0.2)':'rgba(255, 255, 255, 0.5)'} ]}>
                            <Image 
                                source={require('../../../assets/images/icons8-street-view-100.png')}
                                style={{width: 25, height: 25}} />
                        </TouchableOpacity>
                    )}
                </View>

                {category == 'ci'
                ?
                    // stateCourse == 0 && user.disponibilite == 0
                    stateCourse == 0
                    ?
                        init.disponibilite_course && init.disponibilite_reservation
                        ?
                            <BottomButton buttonTitle='Accepter la course' 
                                pressAction={onAcceptCourse}
                            />
                        :
                            <View style={tw`p-3`}>
                                <View style={[ tw`px-30 my-3` ]}>
                                    <Divider />
                                </View>
                                <Text style={[tw`text-black text-center`, {fontFamily: polices.times_new_roman}]}>Verrouillée</Text>
                            </View>
                    : 
                        stateCourse == 1
                        ?
                            <BottomButton buttonTitle='Démarrer la course'
                                pressAction={() => onStateCourse('start')}
                                mapsCoords={startingCords}
                            />
                        : 
                            stateCourse == 10
                            ?
                                <BottomButton buttonTitle='Course Terminée' 
                                    pressAction={() => onStateCourse('end')}
                                />
                            : null
                :
                    category == 'reservation'
                    ?
                        stateCourse == 0
                        ?
                            <BottomButton buttonTitle='Accepter la course' 
                                pressAction={onAcceptCourse}
                            />
                        : 
                            stateCourse == 1
                            ?
                                <BottomButton buttonTitle='Démarrer la course'
                                    pressAction={() => onStateCourse('start')}
                                    mapsCoords={startingCords}
                                />
                            : 
                                stateCourse == 10
                                ?
                                    <BottomButton buttonTitle='Course Terminée' 
                                        pressAction={() => onStateCourse('end')}
                                    />
                                : null
                    :
                        category == 'covoiturage'
                        ?
                            stateCourse == 0
                            ?
                                <BottomButton buttonTitle='Démarrer la course'
                                    pressAction={() => onStateCourse('start')}
                                />
                            : 
                                stateCourse == 1
                                ?
                                    <BottomButton buttonTitle='Course Terminée' 
                                        pressAction={() => onStateCourse('end')}
                                    />
                                : null
                        : null
                }

                </>
            :
                <ActivityLoading loadingText='Chargement en cours...' navigation={navigation} goBack />
            }
        </Base>
    )
}

export default ItineraireView;