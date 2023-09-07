import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, FlatList, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { Divider, Icon } from '@rneui/base';
import Base from '../../../components/Base';
import Header from '../../../components/Header';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import { baseUri, fetchUri, getCurrency, getCurrentDate, toast } from '../../../functions/functions';
import BottomButton from '../../../components/BottomButton';
import { WtCar1 } from '../../../assets';
import { clone, getCoordinateAddress, getCurrentLocation, getErrorsToString, locationPermission, openCoordonateOnMap, openUrl, toTimestamp } from '../../../functions/helperFunction';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-spinkit';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import FlashMessage from '../../../components/FlashMessage';
import { setReload } from '../../../feature/reload.slice';
import { ActivityIndicator, Button } from 'react-native-paper';
import { addReservation, deleteCourse, resetCoords, setReservation } from '../../../feature/course.slice';
import { setDisponibiliteCourse, setDisponibiliteReservation } from '../../../feature/init.slice';
import { CommonActions } from '@react-navigation/native';
import { refreshHistoriqueReservations } from '../../../feature/refresh.slice';
import { polices } from '../../../data/data';

interface DetailsReservationViewProps {
    navigation: any,
    route: any
}
const DetailsReservationView: React.FC<DetailsReservationViewProps> = (props) => {

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const reload = useSelector((state: any) => state.reload.value);

    const refresh = useSelector((state: any) => state.refresh.reservation);

    const {navigation, route} = props;

    const [course, setCourse] = useState(route.params.course);

    const km = course.nb_km_parcouru || course.nb_km_prov;
    
    const {passager} = course;

    const path = passager.img ? {uri: baseUri + '/assets/avatars/' + passager.img} : require('../../../assets/images/user-1.png');

    const [rating, setRating] = useState(0);

    const [hideButton, setHideButton] = useState(true);

    const [visible, setVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    const coordsCourse = useSelector((state: any) => state.course.coords);

    // console.log('coordsCourse => ', coordsCourse);

    // console.log('Course: ', course);

    const onCourse = async (action: string, map: boolean = false) => {
        const locPermissionDenied = await locationPermission()
        if(locPermissionDenied) {
            setVisible(true);
            const response = await getCurrentLocation();
            console.log('Response: ', response);
            // const {latitude, longitude} = response;
            if(action == 'start') {
                dispatch(addReservation({[course.slug]: {origin: response}}))
            } else if(action == 'end') {
                dispatch(setReservation({[course.slug]: {end: response}}))
            }
            const formData = new FormData();
            formData.append('js', null);
            formData.append('upd-state-reservation', action);
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
                setVisible(false);
                if(json.success) {
                    setCourse((state: any) => ({...state, ...json.course}));
                    dispatch(setReload());
                    if(action == 'start') {
                        dispatch(setDisponibiliteReservation(false));
                        if(map)
                            navigation.navigate('DashItineraire', {course: json.course, category: 'reservation'});
                    } else if(action == 'end') {
                        dispatch(setDisponibiliteReservation(true));
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{name: 'DashFinition', params: {course: json.course, category: 'reservation'}}]
                            })
                        )
                    }
                } else {
                    const errors = json.errors;
                    console.log(errors);
                    const txt = getErrorsToString(errors);
                    toast('DANGER', txt)
                }
            })
            .catch(error => {
                setVisible(false);
                console.log(error)
            })
        } else {
            console.log('IMPOSSIBLE TO START COURSE')
        }
    }

    const onLocationOk = () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('js', null);
        formData.append('upd-state-reservation', 'prev-start');
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
            setLoading(false);
            if (json.success) {
                console.log('Course => ', json.course);
                toast('SUCCESS', 'Votre client sera notifié de votre arrivé sur le point de départ.');
                setCourse((state: any) => ({ ...state, ...json.course }));
            } else {
                const errors = json.errors;
                console.log(errors);
                const txt = getErrorsToString(errors);
                toast('DANGER', txt)
            }
        })
        .catch(error => {
            setVisible(false);
            console.log(error)
        })
    }

    const acceptCourse = () => {
        setVisible(true);
        const formData = new FormData();
        formData.append('js', null);
        formData.append('accept-reservation', null);
        formData.append('token', user.slug);
        formData.append('reservation', course.slug);
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            setVisible(false);
            if(json.success) {
                setCourse((state: any) => ({...state, ...json.course}));
                dispatch(setReload());
                setTimeout(() => {
                    navigation.goBack();
                }, 2000);
            } else {
                const errors = json.errors;
                console.log(errors);
                const txt = getErrorsToString(errors);
                toast('DANGER', txt, false)
            }
        })
        .catch(error => {
            setVisible(false);
            console.log(error)
        })
    }

    const onHandleCanceledCourse = () => {
        setVisible(true);
        const formData = new FormData();
        formData.append('js', null);
        formData.append('canceled-reservation', null);
        formData.append('token', user.slug);
        formData.append('reservation', course.slug);
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            setVisible(false);
            if(json.success) {
                setCourse((state: any) => ({...state, ...json.course}));
                dispatch(setReload());
                // DeviceEventEmitter.emit('event.home.reload')
            } else {
                const errors = json.errors;
                console.log(errors);
                const txt = getErrorsToString(errors);
                toast('DANGER', txt, false)
            }
        })
        .catch(error => {
            setVisible(false);
            console.log(error)
        })
    }

    DeviceEventEmitter.addListener("event.acceptCourse", (eventData) => {
        acceptCourse();
    });

    DeviceEventEmitter.addListener("event.canceledCourse", (eventData) => {
        onHandleCanceledCourse();
    });

    const isOk = useMemo(() => {
        let date1 = getCurrentDate();
        let date2 = course.date_depart
        console.log('Time1: ', toTimestamp(date1));
        console.log('Time2: ', toTimestamp(date2));
        setHideButton(!(toTimestamp(date1) >= toTimestamp(date2)));
    }, [hideButton])

    const getDataUser = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('data-user', passager.slug);
        formData.append('token', user.slug);
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
                setRating(json.scores);
            } else {
                const errors = json.errors;
                console.log(errors);
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    const getCourse = () => {
        // console.log('Bob')
        const formData = new FormData();
        formData.append('js', null);
        formData.append('data-course', null);
        formData.append('category', 'reservation-ci');
        formData.append('course', course.slug);
        formData.append('token', user.slug);
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            if (json.success) {
                setCourse((state: any) => ({ ...state, ...json.course }));
                dispatch(refreshHistoriqueReservations());

                if(json.disponibilite_course != undefined) {
                    dispatch(setDisponibiliteCourse(json.disponibilite_course));
                }
                if(json.disponibilite_reservation != undefined) {
                    dispatch(setDisponibiliteReservation(json.disponibilite_reservation));
                }
            } else {
                const errors = json.errors;
                console.log(errors);
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    const onHandleMaps = async () => {
        let lat = null,
            lng = null;
        if(course.latlng_depart) {
            console.log('course.latlng: ', course.latlng_depart);
            const coordonate = JSON.parse(course.latlng_depart)
            lat = coordonate.latitude
            lng = coordonate.longitude
        }
        openCoordonateOnMap(lat, lng, course.adresse_depart)
    }

    useEffect(() => {
        getCourse();
    }, [refresh])

    useEffect(() => {
        getDataUser();
    }, [reload])
    
    return (
        <Base>
            <ModalValidationForm showModal={visible} />
            <Header navigation={navigation} headerTitle='Détails/Réservation' />
            <ScrollView>
                <View style={[ tw`flex-row border-b border-t border-gray-200 px-3 py-2`, {} ]}>
                    <TouchableOpacity onPress={() => navigation.navigate('DashProfilPassager', {passager: passager})} style={tw`rounded-full mr-2`}>
                        <Image
                            source={path}
                            style={[ tw`rounded-full border-2`, {width: 70, height: 70, borderColor: ColorsEncr.main}]}
                        />
                    </TouchableOpacity>
                    <View style={tw`flex-1 pt-1 justify-between`}>
                        <Text style={[tw`text-black`, {fontFamily:'Itim-Regular'}, {fontFamily: polices.times_new_roman}]}>{ passager.nom.toUpperCase() + ' ' + passager.prenom }</Text>
                        <Text style={[tw`text-black`, {fontFamily:'Itim-Regular'}, {fontFamily: polices.times_new_roman}]} onPress={() => openUrl(`tel:${passager.tel}`)}>{ passager.tel }</Text>
                    </View>
                    <View style={tw`justify-between items-end`}>
                        <Rating
                            readonly
                            startingValue={rating}
                            ratingCount={5}
                            imageSize={15}
                            ratingColor={ColorsEncr.main}
                            style={[tw``, {marginTop: 7.5}]}
                        />
                        {(course.etat_course == 1 && course.suis_la == 0) && (
                            <Button onPress={onLocationOk} mode='outlined' disabled={loading} loading={loading} labelStyle={tw`text-xs`}>Je suis arrivé</Button>
                        )}
                    </View>
                </View>

                <View style={tw`border-b border-gray-200 px-3 py-4`}>
                    <View style={[ tw`flex-row items-center mb-3` ]}>
                        <Icon type='font-awesome-5' name='map-marker-alt' color='rgb(22, 101, 52)' containerStyle={tw`mr-2 self-start`} />
                        <Text style={[ tw`flex-1 text-gray-400`, {fontFamily: polices.times_new_roman} ]}>{course.adresse_depart}</Text>
                    </View>
                    <View style={[ tw`flex-row items-center` ]}>
                        <Icon type='font-awesome-5' name='map-marker-alt' color={ColorsEncr.main} containerStyle={tw`mr-2 self-start`} />
                        <Text style={[ tw`flex-1 text-gray-400`, {fontFamily: polices.times_new_roman} ]}>{course.adresse_arrive}</Text>
                    </View>

                    <View style={[ tw`flex-row justify-between px-2 mt-5` ]}>
                        <View style={[ tw`flex-row items-center bg-orange-100 rounded-2xl py-1 px-3` ]}>
                            {!course.nb_km_parcouru
                            ?
                                <Icon type='material-community' name='approximately-equal' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            :
                                null
                            }
                            <Icon type='font-awesome-5' name='car-alt' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            <Text style={[ tw`text-xs`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]}>{km.toString().replace('.', ',')} km</Text>
                        </View>
                        {/* <View style={[ tw`flex-row items-center bg-orange-100 rounded-2xl py-1 px-3` ]}>
                            <Icon type='material-community' name='approximately-equal' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            <Icon type='material-community' name='run' size={20} iconStyle={{ color: ColorsEncr.main }} />
                            <Text style={[ tw`text-xs`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]}>{'1h 45m'}</Text>
                        </View> */}
                    </View>
                </View>

                <View style={tw`flex-row justify-between border-b border-gray-200 px-3 py-4`}>

                    <View style={tw`flex-1 justify-between items-center`}>
                        <Text style={[tw`text-black font-bold text-center`, {fontFamily: polices.times_new_roman}]}>{ course.date_depart }</Text>
                        <Icon type='font-awesome-5' name='calendar-alt' color={ColorsEncr.main} />
                    </View>

                    <Divider orientation='vertical' />

                    <View style={tw`flex-1 justify-between items-center`}>
                        <Text style={[tw`text-black font-bold text-center`, {fontFamily: polices.times_new_roman}]}>{ course.heure_depart }</Text>
                        <Icon type='font-awesome-5' name='history' color={ColorsEncr.main} />
                    </View>

                </View>

                <View style={tw`flex-row justify-between border-b border-gray-200 px-3 py-4`}>

                    <View style={tw`flex-1 justify-between items-center`}>
                        <Text style={[tw`text-black font-bold`, {fontFamily: polices.times_new_roman}]}>{course.nb_place} Passager(s)</Text>
                        <Icon type='ant-design' name='user' color={ColorsEncr.main} />
                    </View>

                    <Divider orientation='vertical' />

                    <View style={tw`flex-1 justify-between items-center`}>
                        <View style={[ tw`flex-row justify-center items-center` ]}>
                            {course.etat_course != 11 && (
                                <Icon type='material-community' name='approximately-equal' size={20} containerStyle={[ tw`mr-1` ]} />
                            )}
                            <Text style={[tw`text-black font-bold`, {fontFamily: polices.times_new_roman}]}>Prix</Text>
                        </View>
                        <Text style={[ tw`text-lg`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]}>{getCurrency(course.prix)} XOF</Text>
                    </View>

                </View>

                <View style={tw`mt-10 mb-5`}>
                {course.etat_course == 0
                ?
                    <>
                        <View style={tw`items-center px-2`}>
                            <Text style={[tw`text-center text-black text-xl`, {fontFamily: 'Itim-Regular'}, {fontFamily: polices.times_new_roman}]}>En recherche de Taxi...</Text>
                            <Spinner isVisible={true} size={30} color={'black'} type='ThreeBounce' />
                            <Text style={[tw`text-center text-gray-500 mb-3`, {fontFamily: 'YatraOne-Regular'}, {fontFamily: polices.times_new_roman}]}>Veuillez accepter la course si vous êtes disponible au jour et heure indiqués et pas loin du point de départ!</Text>
                        </View>
                        <View style={tw`flex-1 justify-center items-center py-10`}>
                            <Spinner isVisible={true} size={100} color={ColorsEncr.main} type='WanderingCubes' />
                        </View>
                        <View style={tw`px-5`}>
                            <TouchableOpacity
                                onPress={acceptCourse}
                                style={[tw`flex-row justify-center items-center border rounded-lg p-3`, {borderColor: ColorsEncr.main}]}>
                                <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}, {fontFamily: polices.times_new_roman}]}>Accepter la course</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <View style={tw`flex-row justify-around`}>
                            <TouchableOpacity
                                onPress={acceptCourse}
                                style={[tw`flex-row justify-center items-center border rounded-lg p-3`, {borderColor: ColorsEncr.main}]}>
                                <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}, {fontFamily: polices.times_new_roman}]}>Accepter la course</Text>
                            </TouchableOpacity>
                            <Pressable
                                onPress={() => navigation.navigate('DashItineraire', {course: course, category: 'reservation'})}
                                style={[tw`flex-row justify-center items-center border rounded-lg p-3`, {borderColor: ColorsEncr.main}]}>
                                <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}, {fontFamily: polices.times_new_roman}]}>Voir la course</Text>
                            </Pressable>
                        </View> */}
                    </>
                :
                    course.etat_course == 1
                    ?
                        <>
                            <View style={tw`items-center px-2 mb-3`}>
                                <Text style={[tw`text-center text-black text-xl`, {fontFamily: 'Itim-Regular'}, {fontFamily: polices.times_new_roman}]}>Rendez-vous sur le point de départ.</Text>
                                <Spinner isVisible={true} size={30} color={'black'} type='ThreeBounce' />
                                <Text style={[tw`text-center text-gray-500 mb-3`, {fontFamily: 'YatraOne-Regular'}, {fontFamily: polices.times_new_roman}]}>Vous pouvez appeler le client sur son numéro de téléphone en cas de besoin.</Text>
                            </View>
                            <View style={tw`flex-row flex-wrap justify-around`}>
                                {/* {!hideButton && ( */}
                                    <TouchableOpacity
                                        onPress={() => onCourse('start', true)}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, {borderColor: ColorsEncr.main}]}>
                                        {/* <ActivityIndicator /> */}
                                        <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}, {fontFamily: polices.times_new_roman}]}>Démarrer la course</Text>
                                    </TouchableOpacity>
                                {/* )} */}
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    // onPress={() => navigation.navigate('DashItineraire', {course: course, category: 'reservation'})}
                                    onPress={onHandleMaps}
                                    style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, {borderColor: ColorsEncr.main}]}>
                                    <Image
                                        source={require('../../../assets/images/itineraire.png')}
                                        style={{width: 30, height: 30 }} />
                                    <Text style={[tw`ml-2 text-gray-500 text-base text-center`, {fontFamily: polices.font1}, {fontFamily: polices.times_new_roman}]}>Maps</Text>
                                </TouchableOpacity>
                            </View>
                            {/* <View style={tw`px-7 mt-2`}>
                                <Button onPress={onHandleCanceledCourse} mode='contained' color='rgb(185, 28, 28)' contentStyle={tw`p-3`} labelStyle={{ fontFamily: polices.times_new_roman }}>
                                    Annuler
                                </Button>
                            </View> */}
                        </>
                    :
                        course.etat_course == 10
                        ?
                            <>
                                <Text style={[tw`text-center text-black text-lg`, {fontFamily: 'Itim-Regular'}, {fontFamily: polices.times_new_roman}]}>Course en cours...</Text>
                                <View style={[tw`items-center`, {}]}>
                                    <Image resizeMode='contain' source={require('../../../assets/images/gifs/icons8-fiat-500.gif')} style={[tw``, {width: 200, height: 100}]} />
                                </View>
                                <View style={tw`flex-row flex-wrap justify-around`}>
                                    <TouchableOpacity
                                        onPress={() => onCourse('end')}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, {borderColor: ColorsEncr.main}]}>
                                        <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}, {fontFamily: polices.times_new_roman}]}>Course terminée</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => navigation.navigate('DashItineraire', {course: course, category: 'reservation'})}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, {borderColor: ColorsEncr.main}]}>
                                        <Image
                                            source={require('../../../assets/images/itineraire.png')}
                                            style={{width: 30, height: 30 }} />
                                        <Text style={[tw`ml-2 text-gray-500 text-base text-center`, {fontFamily: polices.font1}, {fontFamily: polices.times_new_roman}]}>Suivre la course</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        :
                            <>
                                <Text style={[tw`text-center font-black text-black`, {fontFamily: polices.times_new_roman}]}>Course Terminée</Text>
                                <View style={[tw`items-center`, {}]}>
                                    {/* <Image resizeMode='contain' source={require('../../../assets/images/gifs/icons8-voiture.gif')} style={[tw``, {width: 200, height: 100}]} /> */}
                                    <Image resizeMode='contain' source={require('../../../assets/images/icons8-taxi-stop-100.png')} style={[tw``, {width: 200, height: 100}]} />
                                </View>
                            </>
                }
                </View>

            </ScrollView>

            {/* { course.etat_course == 0 && (
                <BottomButton navigation={navigation} title='Annuler' />
            )} */}
        </Base>
    )

}

export default DetailsReservationView;