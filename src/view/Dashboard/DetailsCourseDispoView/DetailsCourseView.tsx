import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, Image, Linking, Modal, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { Divider, Icon } from '@rneui/base';
import Base from '../../../components/Base';
import Header from '../../../components/Header';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import { baseUri, fetchUri, getCurrency, toast } from '../../../functions/functions';
import Spinner from 'react-native-spinkit';
import { WtCar1 } from '../../../assets';
import { callPhoneNumber, getCoordinateAddress, getCurrentLocation, getErrorsToString, locationPermission, openCoordonateOnMap, openUrl, watchCurrentLocation } from '../../../functions/helperFunction';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import FlashMessage from '../../../components/FlashMessage';
import { useDispatch, useSelector } from 'react-redux';
import { setReload } from '../../../feature/reload.slice';
import { setDisponibiliteCourse, setDisponibiliteReservation } from '../../../feature/init.slice';
import { addCourse, resetCoords } from '../../../feature/course.slice';
import { setCourse as setCourseSlice } from '../../../feature/course.slice';
import { CommonActions } from '@react-navigation/native';
import { refreshHistoriqueCoures } from '../../../feature/refresh.slice';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { Button, IconButton } from 'react-native-paper';
import { polices } from '../../../data/data';

interface DetailsCourseViewProps {
    navigation: any,
    route: any
}
const DetailsCourseView: React.FC<DetailsCourseViewProps> = (props) => {

    const dispatch = useDispatch();

    const init = useSelector((state:any) => state.init)

    // console.log('init: ', init)

    const { navigation, route } = props;

    // const coords = useSelector((state: any) => state.course.coords.course);

    // const coordsCourse = useSelector((state: any) => state.course.coords);

    // console.log('coordsCourse => ', coordsCourse);

    const [course, setCourse] = useState(route.params.course);

    const km = course.nb_km_parcouru || course.nb_km_prov;

    const { passager } = course;

    const path = passager.img ? { uri: baseUri + '/assets/avatars/' + passager.img } : require('../../../assets/images/user-1.png');

    const user = useSelector((state: any) => state.user.data);

    const reload = useSelector((state: any) => state.reload.value);
    const refresh = useSelector((state: any) => state.refresh.course);

    const [visible, setVisible] = useState(false);

    const [show, setShow] = useState(false);

    const [loading, setLoading] = useState(false);

    const [rating, setRating] = useState(0);

    const onCourse = async (action: string, map: boolean = false) => {
        const locPermissionDenied = await locationPermission()
        if (locPermissionDenied) {
            setVisible(true);
            const response = await getCurrentLocation();
            // console.log('Response: ', response);
            // const {latitude, longitude} = response;
            if (action == 'start') {
                dispatch(addCourse({ [course.slug]: { origin: response } }))
            } else if (action == 'end') {
                dispatch(setCourseSlice({ [course.slug]: { end: response } }))
            }
            const formData = new FormData();
            formData.append('js', null);
            formData.append('upd-state-course', action);
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
                if (json.success) {
                    setCourse((state: any) => ({ ...state, ...json.course }));
                    // dispatch(setReload());
                    if(action == 'start') {
                        // dispatch(setDisponibiliteCourse(false));
                        if (map)
                            navigation.navigate('DashItineraire', { course: json.course, category: 'ci' });
                    } else if (action == 'end') {
                        dispatch(setDisponibiliteCourse(true));
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{name: 'DashFinition', params: {course: course, category: 'ci'}}]
                            })
                        )
                    }
                } else {
                    const errors = json.errors;
                    console.log(errors);
                    const txt = getErrorsToString(errors);
                    // @ts-ignore
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
        formData.append('upd-state-course', 'prev-start');
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
        formData.append('accept-course', null);
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
            if (json.success) {
                setCourse((state: any) => ({ ...state, ...json.course }));
                dispatch(refreshHistoriqueCoures());
                dispatch(setDisponibiliteCourse(false));
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

    const onHandleCanceledCourse = () => {
        setVisible(true);
        const formData = new FormData();
        formData.append('js', null);
        formData.append('canceled-course', null);
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
            if (json.success) {
                setCourse((state: any) => ({ ...state, ...json.course }));
                dispatch(refreshHistoriqueCoures());
                dispatch(setDisponibiliteCourse(true));
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

    DeviceEventEmitter.addListener("event.acceptCourse", (eventData) => {
        acceptCourse();
    });

    DeviceEventEmitter.addListener("event.canceledCourse", (eventData) => {
        onHandleCanceledCourse();
    });

    const getDataUser = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('data-user', passager.slug);
        formData.append('token', user.slug);
        console.log('data-user');
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
        console.log('Bob')
        const formData = new FormData();
        formData.append('js', null);
        formData.append('data-course', null);
        formData.append('category', 'ci');
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
                dispatch(refreshHistoriqueCoures());

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

    useEffect(() => {
        // const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
        // const latLng = `37.484847,-122.148386`;
        // const label = 'Custom Label';
        // const url = Platform.select({
        //   ios: `${scheme}${label}@${latLng}`,
        //   android: `${scheme}${latLng}(${label})`
        // });

        // openUrl(url)

        console.log('Course: ', course);
        console.log('addr.dep: ', getCoordinateAddress(course.adresse_depart));
    }, [course])

    return (
        <Base>
            <ModalValidationForm showModal={visible} />
            <Modal 
                transparent
                visible={show}
                animationType='slide'
                children={
                    <View style={[tw`flex-1 bg-black`, {backgroundColor: 'rgba(0,0,0,0.8)'}]}>
                        <View style={tw`px-3`}>
                            <Icon onPress={() => setShow(false)} type='evilicon' name='close' color='#FFF' size={30} containerStyle={tw`self-end ${Platform.OS=='android'?'mt-3':'mt-10'} mr-3`} />
                            <View style={tw`mt-5`}>
                                <Text style={tw`text-white text-center font-black text-lg`}>Note: </Text>
                                <Text style={tw`text-white mt-1`}>Vous avez une course (instantanée/réservation) non achevée. Veuillez boucler la course avant de pouvoir en prendre une autre.</Text>
                                <Text style={tw`text-white mt-1`}>Vous pouvez consulter <Text onPress={() => navigation.navigate('DashHistoriqueCourses')} style={tw`underline`}>l'historique</Text> de vos courses si vous ne la voyez pas.</Text>
                            </View>
                        </View>
                    </View>
                }
            />
            <Header navigation={navigation} headerTitle='Détails/Course instantanée' />
            <ScrollView>
                <View style={[tw`flex-row border-b border-t border-gray-200 px-3 py-2`, {}]}>
                    <TouchableOpacity onPress={() => navigation.navigate('DashProfilPassager', { passager: passager })} style={tw`rounded-full mr-2`}>
                        <Image
                            source={path}
                            style={[tw`rounded-full border-2`, { width: 70, height: 70, borderColor: ColorsEncr.main }]}
                        />
                    </TouchableOpacity>
                    <View style={tw`flex-1 pt-1 justify-between`}>
                        <Text style={[tw`text-black`, {fontFamily:'Itim-Regular'}]}>{passager.nom.toUpperCase() + ' ' + passager.prenom}</Text>
                        <Text style={[tw`text-black`, {fontFamily:'Itim-Regular'}]} onPress={() => callPhoneNumber(passager.tel)}>{passager.tel}</Text>
                    </View>
                    <View style={tw`justify-between items-end`}>
                        <Rating
                            readonly
                            startingValue={rating}
                            ratingCount={5}
                            imageSize={15}
                            ratingColor={ColorsEncr.main}
                            style={[tw``, { marginTop: 7.5 }]}
                        />
                        {(course.etat_course == 1 && course.suis_la == 0) && (
                            <Button onPress={onLocationOk} mode='outlined' disabled={loading} loading={loading} labelStyle={tw`text-xs`}>Je suis arrivé</Button>
                        )}
                    </View>
                </View>

                <View style={tw`border-b border-gray-200 px-3 py-4`}>
                    <View style={[tw`flex-row items-center mb-3`]}>
                        <Icon type='font-awesome-5' name='map-marker-alt' color='rgb(22, 101, 52)' containerStyle={tw`mr-2 self-start`} />
                        <Text style={[tw`flex-1 text-gray-400`]}>{course.adresse_depart}</Text>
                    </View>
                    <View style={[tw`flex-row items-center`]}>
                        <Icon type='font-awesome-5' name='map-marker-alt' color={ColorsEncr.main} containerStyle={tw`mr-2 self-start`} />
                        <Text style={[tw`flex-1 text-gray-400`]}>{course.adresse_arrive}</Text>
                    </View>

                    <View style={[tw`flex-row justify-between px-2 mt-5`]}>
                        <View style={[tw`flex-row items-center bg-orange-100 rounded-2xl py-1 px-3`]}>
                            <Icon type='material-community' name='approximately-equal' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[tw`mr-1`]} />
                            <Icon type='font-awesome-5' name='car-alt' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[tw`mr-1`]} />
                            <Text style={[tw`text-xs`, { color: ColorsEncr.main }]}>{km.toString().replace('.', ',')} km</Text>
                        </View>
                        {/* <View style={[ tw`flex-row items-center bg-orange-100 rounded-2xl py-1 px-3` ]}>
                            <Icon type='material-community' name='approximately-equal' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            <Icon type='material-community' name='run' size={20} iconStyle={{ color: ColorsEncr.main }} />
                            <Text style={[ tw`text-xs`, {color: ColorsEncr.main} ]}>{'1h 45m'}</Text>
                        </View> */}
                    </View>
                </View>

                <View style={tw`flex-row justify-between border-b border-gray-200 px-3 py-4`}>

                    <View style={tw`flex-1 justify-between items-center`}>
                        <Text style={tw`text-black font-bold`}>{course.nb_place} Passager(s)</Text>
                        <Icon type='ant-design' name='user' color={ColorsEncr.main} />
                    </View>

                    <Divider orientation='vertical' />

                    <View style={tw`flex-1 justify-between items-center`}>
                        <View style={[tw`flex-row justify-center items-center`]}>
                            {course.etat_course != 11 && (
                                <Icon type='material-community' name='approximately-equal' size={20} containerStyle={[tw`mr-1`]} />
                            )}
                            <Text style={tw`text-black font-bold`}>Prix</Text>
                        </View>
                        <Text style={[tw`text-lg`, { color: ColorsEncr.main }]}>{getCurrency(course.prix)} XOF</Text>
                    </View>

                </View>

                <View style={tw`mt-10 mb-5`}>
                    {course.etat_course == 0
                        ?
                        <>
                            <View style={tw`items-center px-2`}>
                                <Text style={[tw`text-center text-black text-xl`, {fontFamily: 'Itim-Regular'}]}>En recherche de Taxi...</Text>
                                <Spinner isVisible={true} size={30} color={'black'} type='ThreeBounce' />
                                <Text style={[tw`text-center text-gray-500 mb-3`, {fontFamily: 'YatraOne-Regular'}]}>Veuillez accepter la course si vous êtes disponible et pas loin du point de départ!</Text>
                            </View>
                            <View style={tw`flex-1 justify-center items-center py-10`}>
                                <Spinner isVisible={true} size={100} color={ColorsEncr.main} type='WanderingCubes' />
                            </View>
                            <View style={tw`px-5`}>
                                {init.disponibilite_course && init.disponibilite_reservation
                                ?
                                    <Pressable
                                        onPress={acceptCourse}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, { borderColor: ColorsEncr.main }]}>
                                        <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}]}>Accepter la course</Text>
                                    </Pressable>
                                :
                                    <TouchableOpacity onPress={() => setShow(true)} style={tw`flex-row justify-center items-center border-t border-b border-gray-200 p-3 mb-3`}>
                                        <Icon type='ionicon' name='help' />
                                        <Text style={[tw`text-black text-center`, {fontFamily: polices.font1}]}>Verrouillé</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                            {/* <View style={tw`${init.disponibilite_course && init.disponibilite_reservation ? 'flex-row flex-wrap justify-around' : 'px-5'}`}>
                                {init.disponibilite_course && init.disponibilite_reservation
                                ?
                                    <Pressable
                                        onPress={acceptCourse}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, { borderColor: ColorsEncr.main }]}>
                                        <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}]}>Accepter la course</Text>
                                    </Pressable>
                                :
                                    <TouchableOpacity onPress={() => setShow(true)} style={tw`flex-row justify-center items-center border-t border-b border-gray-200 p-3 mb-3`}>
                                        <Icon type='ionicon' name='help' />
                                        <Text style={[tw`text-black text-center`, {fontFamily: polices.font1}]}>Verrouillé</Text>
                                    </TouchableOpacity>
                                }
                                <Pressable
                                    onPress={() => navigation.navigate('DashItineraire', { course: course, category: 'ci' })}
                                    style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, { borderColor: ColorsEncr.main }]}>
                                    <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}]}>Voir la course</Text>
                                </Pressable>
                            </View> */}
                        </>
                        :
                        course.etat_course == 1
                            ?
                            <>
                                <View style={tw`items-center px-2`}>
                                    <Text style={[tw`text-center text-black text-xl`, {fontFamily: 'Itim-Regular'}]}>Rendez-vous sur le point de départ.</Text>
                                    <Spinner isVisible={true} size={30} color={'black'} type='ThreeBounce' />
                                    <Text style={[tw`text-center text-gray-500 mb-3`, {fontFamily: 'YatraOne-Regular'}]}>Vous pouvez appeler le client sur son numéro de téléphone en cas de besoin.</Text>
                                </View>
                                <View style={[tw`items-center`, {}]}>
                                    <Image resizeMode='contain' source={require('../../../assets/images/gifs/icons8-voiture.gif')} style={[tw``, {width: 200, height: 100}]} />
                                </View>
                                <View style={tw`flex-row flex-wrap justify-around mt-10`}>
                                    <TouchableOpacity
                                        onPress={() => onCourse('start', true)}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, { borderColor: ColorsEncr.main }]}>
                                        <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}]}>Démarrer la course</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        // onPress={() => navigation.navigate('DashItineraire', { course: course, category: 'ci' })}
                                        onPress={onHandleMaps}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, { borderColor: ColorsEncr.main }]}>
                                        <Image
                                            source={require('../../../assets/images/itineraire.png')}
                                            style={{ width: 30, height: 30 }} />
                                        <Text style={[tw`ml-2 text-gray-500 text-base text-center`, {fontFamily: polices.font1}]}>Maps</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* <View style={tw`px-7 mt-2`}>
                                    <Button onPress={onHandleCanceledCourse} mode='contained' color='rgb(185, 28, 28)' contentStyle={tw`p-3`}>
                                        Annuler
                                    </Button>
                                </View> */}
                            </>
                            :
                            course.etat_course == 10
                                ?
                                <>
                                    <Text style={[tw`text-center text-black text-lg`,{fontFamily: 'Itim-Regular'}]}>Course en cours...</Text>
                                    <View style={[tw`items-center`, {}]}>
                                        <Image resizeMode='contain' source={require('../../../assets/images/gifs/icons8-fiat-500.gif')} style={[tw``, {width: 200, height: 100}]} />
                                    </View>
                                    <View style={tw`flex-row flex-wrap justify-around mt-5`}>
                                        <TouchableOpacity
                                            onPress={() => onCourse('end')}
                                            style={[tw`flex-row justify-center items-center border rounded-lg p-3`, { borderColor: ColorsEncr.main }]}>
                                            <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.font1}]}>Course terminée</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.5}
                                            onPress={() => navigation.navigate('DashItineraire', { course: course, category: 'ci' })}
                                            style={[tw`flex-row justify-center items-center border rounded-lg p-3`, { borderColor: ColorsEncr.main }]}>
                                            <Image
                                                source={require('../../../assets/images/itineraire.png')}
                                                style={{ width: 30, height: 30 }} />
                                            <Text style={[tw`ml-2 text-gray-500 text-base text-center`, {fontFamily: polices.font1}]}>Suivre la course</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                                :
                                <>
                                    <Text style={tw`text-center font-black text-black`}>Course Terminée</Text>
                                    <View style={[tw`items-center`, {}]}>
                                        {/* <Image resizeMode='contain' source={require('../../../assets/images/gifs/icons8-voiture.gif')} style={[tw``, {width: 200, height: 100}]} /> */}
                                        <Image resizeMode='contain' source={require('../../../assets/images/icons8-taxi-stop-100.png')} style={[tw``, {width: 200, height: 100}]} />
                                    </View>
                                </>
                    }
                    
                </View>

            </ScrollView>
        </Base>
    )

}

export default DetailsCourseView;