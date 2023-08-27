import { Header, Icon } from '@rneui/base';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, DrawerLayoutAndroid, Image, Pressable, RefreshControl, ScrollView, Switch, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Switch as RNESwitch } from '@rneui/base';
import Base from '../../../components/Base';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import ButtonMenu from './components/ButtonMenu';
import { baseUri, fetchUri, getCurrency, toast, windowHeight, windowWidth } from '../../../functions/functions';
import { useDispatch, useSelector } from 'react-redux';
import { Accueil } from '../../../assets';
import { deleteUser, setUser } from '../../../feature/user.slice';
import { clone, getErrorsToString, openUrl } from '../../../functions/helperFunction';
import { ActivityIndicator, Badge, Switch as SwitchPaper } from 'react-native-paper';
import { RNPModal } from '../../../components/RNPModal';
import Spinner from 'react-native-spinkit';
import { deleteCourse, deleteReservation, resetCoords } from '../../../feature/course.slice';
import { resetNotifications, setCount } from '../../../feature/notifications.slice';
import { setDisponibilite, setDisponibiliteCourse, setDisponibiliteReservation, setStopped, setWithPortefeuille } from '../../../feature/init.slice';
import { Divider } from '@rneui/themed';
import { google_maps_apikey, waataxi_infos } from '../../../data/data';
import Geocoder from 'react-native-geocoding';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import { clearStoreCourses } from '../../../feature/courses.slice';
import Lottie from 'lottie-react-native';

Geocoder.init(google_maps_apikey, {language : "fr"});

const timer = require('react-native-timer')

interface HomeViewProps {
    navigation: any,
    route: any
}
const HomeView: React.FC<HomeViewProps> = ({navigation, route}) => {

    const dispatch = useDispatch();

    const stopped = useSelector((state: any) => state.init.stopped);

    const disponibilite = useSelector((state: any) => state.init.disponibilite);

    const reload = useSelector((state: any) => state.reload.value);

    const notifies = useSelector((state: any) => state.notifications.data);

    // console.log('notifies => ', notifies);

    const [countNotifs, setCountNotifs] = useState(0);

    const [isSwitchOn, setIsSwitchOn] = React.useState(false);

    const [disabled, setDisabled] = useState(false);

    const [visible, setVisible] = useState(false);

    const user = useSelector((state: any) => state.user.data);

    const {height} = useWindowDimensions();

    const [refresh, setRefresh] = useState(false);

    const [end, setEnd] = useState(false);

    const [geo, setGeo] = useState<any>('');

    const [fullNewCourses, setFullNewCourses] = useState(0);
    const [newCourses, setNewCourses] = useState(0);
    const [newReservations, setNewReservations] = useState(0);

    const onHandlePicker = (value: boolean): void => {
        setDisabled(true);
        const formData = new FormData()
        formData.append('js', null);
        formData.append('update-state', null);
        formData.append('value', value);
        formData.append('token', user.slug)
        console.log('FormData: ', formData);
        fetch(fetchUri, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(json => {
            if(json.success) {
                dispatch(setDisponibilite(value));
                // let image = json.user.img;
                // const data = clone(json.user);
                // if(data.img) {
                //     data.img = `${baseUri}/assets/avatars/${image}`;
                // }
                // dispatch(setUser({...data}));
                // let c = 0;
                // const notifications = json.notifications;
                // notifications.map((v: any) => {
                //     if(notifies.indexOf(v.id) == -1) {
                //         c++;
                //     }
                // })
                // setCountNotifs(c);
            } else {
                const errors = json.errors;
                console.log('Errors: ', errors);
                toast('DANGER', getErrorsToString(errors));
            }
            setDisabled(false);
        })
        .catch(e => {
            setDisabled(false);
            console.warn(e)
        })
    }

    const getData = (): void => {
        // if(!stopped) {
            const formData = new FormData()
            formData.append('js', null)
            formData.append(`refresh`, null)
            formData.append('token', user.slug)
            fetch(fetchUri, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(json => {
                // console.log(json)
                if(json.success) {
                    let image = json.user.img;
                    const data = clone(json.user);
                    if(data.img) {
                        data.img = `${baseUri}/assets/avatars/${image}`;
                    }
                    dispatch(setUser({...data}));
                    if(data.disponibilite == 1) {
                        dispatch(setDisponibilite(true))
                    } else if(data.disponibilite == 0) {
                        dispatch(setDisponibilite(false));
                    }
                    let c = 0;
                    const notifications = json.notifications;
                    notifications.map((v: any) => {
                        if(notifies.indexOf(v.id) == -1) {
                            c++;
                        }
                    })
                    dispatch(setCount(c))
                    setCountNotifs(c);

                    // console.log('json.disponibilite_course: ', json.disponibilite_course);
                    // console.log('json.disponibilite_reservation: ', json.disponibilite_reservation);

                    if(json.with_portefeuille != undefined) {
                        dispatch(setWithPortefeuille(json.with_portefeuille))
                    }
                    if(json.disponibilite_course != undefined) {
                        dispatch(setDisponibiliteCourse(json.disponibilite_course));
                    }
                    if(json.disponibilite_reservation != undefined) {
                        dispatch(setDisponibiliteReservation(json.disponibilite_reservation));
                    }

                    if(data.disponibilite == 1) {
                        if(json.new_courses != undefined) setNewCourses(json.new_courses);
                        if(json.new_reservations != undefined) setNewReservations(json.new_reservations);
                        if(json.full_new_courses != undefined) setFullNewCourses(json.full_new_courses);
                    } else {
                        setNewCourses(2);
                        setNewReservations(2);
                        setFullNewCourses(0);
                    }

                    if(json.app_current_versions) {
                        checkVersion(json.app_current_versions)
                    }
                } else {
                    const errors = json.errors;
                    console.log('Errors: ', errors);
                    toast('DANGER', getErrorsToString(errors));
                }
                setRefresh(false);
                setEnd(true);
            })
            .catch(e => {
                setRefresh(false);
                console.warn(e)
            })
        // }
    }

    const getCoordonates = async () => {
        await Geocoder.from(waataxi_infos.address)
        .then(json => {
            let location = json.results[0].geometry.location;
            console.log('StartCoords: ', location);
            setGeo(`${location.lat},${location.lng}`);
        })
        .catch(error => {
            console.warn(error)
        });
    }

    const onRefresh = (): void => {
        if(stopped) dispatch(setStopped(false))
        setRefresh(true);
        getData();
    }

    const onSignOut = async () => {
        await dispatch(setStopped(true));
        await dispatch(clearStoreCourses())
        setVisible(true);
        setTimeout(async () => {
            setVisible(false);
            await dispatch(resetCoords());
            await dispatch(deleteUser());
        }, 4000)
    }

    const openTimer = () => {
        timer.setInterval('home-data', getData, 5000)
    }
    const clearTimer = () => {
        if(timer.intervalExists('home-data')) timer.clearInterval('home-data')
    }
    const event1 = DeviceEventEmitter.addListener("event.home.opentimer", (eventData) => {
        openTimer();
    });
    const event2 = DeviceEventEmitter.addListener("event.home.cleartimer", (eventData) => {
        clearTimer();
    });

    const checkVersion = useCallback((a)=>{
        DeviceEventEmitter.emit('check.version', a)
    }, [])

    useEffect(() => {
        if(stopped) {
            clearTimer();
        } else {
            openTimer();
        }
        return () => {
            clearTimer();
        }
    }, [notifies, stopped])

    useEffect(() => {
        getCoordonates();
        getData();
    }, [reload])

    useEffect(() => {
        console.log('NEW');
        return () => {
            event1.remove()
            event2.remove()
        }
    }, [])

    return (
        <Base containerStyle={tw`pt-0`}>
            <ModalValidationForm showModal={visible} />

            {user.actif == 0 && (
                <RNPModal showModal={true}>
                    <View style={[tw`rounded-lg p-3 bg-white`, { width: 300 }]}>
                        <View style={tw`items-center mb-3`}>
                            <Spinner isVisible={true} size={100} color={ColorsEncr.main} type='ChasingDots' />
                        </View>
                        {user.compte_business == 1
                            ?
                                <>
                                    <Text style={[tw`text-black font-bold mb-2`, { lineHeight: 18 }]}>Veuillez vous rendre à l'agence pour finaliser votre inscription.</Text>
                                    <Text style={tw`text-black mb-2`}>Soyez muni des pièces:</Text>
                                    <Text style={tw`text-black`}>- Carte nationale d'identité (ou passeport);</Text>
                                    <Text style={tw`text-black`}>- Carte grise;</Text>
                                    <Text style={tw`text-black mb-2`}>- Permis de conduire.</Text>
                                    <Text style={tw`text-black font-bold`}>NB: Venez avec votre véhicule.</Text>                                
                                </>
                            :
                                <>
                                    <Text style={[tw`text-black font-bold mb-2`, { lineHeight: 18 }]}>Veuillez patienter un instant. Nous vérifions vos informations.</Text>
                                    <Text style={tw`text-black`}>Votre compte sera activé d'ici peu.</Text>
                                </>
                        }
                        <Divider color='#ddd' style={tw`my-3`} />
                        <View style={tw`flex-row items-center mb-1`}>
                            <Icon type='material-icon' name='location-pin' color={ColorsEncr.main} />
                            <Text style={tw`flex-1 text-black ml-2`} onPress={() => openUrl(`geo:${geo}`)}>{waataxi_infos.address}</Text>
                        </View>
                        <View style={tw`flex-row items-center mb-1`}>
                            <Icon type='material-community' name='email-newsletter' color={ColorsEncr.main} />
                            <Text style={tw`flex-1 text-black ml-2`} onPress={() => openUrl(`mailto:${waataxi_infos.email}`)}>{waataxi_infos.email}</Text>
                        </View>
                        <View style={tw`flex-row items-center`}>
                            <Icon type='material-icon' name='phone' color={ColorsEncr.main} />
                            <Text style={tw`flex-1 text-black ml-2`} onPress={() => openUrl(`tel:${waataxi_infos.phone}`)}>{waataxi_infos.phone}</Text>
                        </View>
                        <Divider color='#ddd' style={tw`my-3`} />
                        <TouchableOpacity onPress={onSignOut}><Text style={tw`text-center font-semibold text-red-600`}>Me déconnecter</Text></TouchableOpacity>
                    </View>
                </RNPModal>                
            )}
            {/* <View style={[tw``, { height: 80 }]}>
                <View style={[tw`flex-row justify-around items-center`]}>
                    <Pressable
                        // @ts-ignore
                        onPress={() => drawerRef?.current.openDrawer()}>
                        <Icon
                            type='ionicon'
                            name='ios-menu'
                            size={30}
                        />
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('DashNotifications')}
                        style={tw`relative`}
                    >
                        <Icon
                            type='ionicon'
                            name='ios-notifications-sharp'
                            size={30}
                        />
                        <Badge children={countNotifs} visible={countNotifs !== 0} style={tw`absolute left-4`} />
                    </Pressable>
                </View>
                <View style={[tw`flex-row justify-center items-center`]}>
                    <View style={tw`flex-row mr-2`}>
                        <Text style={[tw`uppercase text-center text-black text-lg mr-2`, { maxWidth: windowWidth - 100 }]}>{disponibilite ? 'Arreter le travail' : 'Commencer le travail'}</Text>
                        {disabled && (
                            <ActivityIndicator size='small' color={ColorsEncr.main} />
                        )}
                    </View>
                    <SwitchPaper disabled={user.compte_business == 1 && user.actif == 0 ? true : disabled} value={disponibilite} onValueChange={(value) => onHandlePicker(value)} />
                </View>
            </View> */}

            {user.compte_business == 1 && (
                <View style={[tw`flex-row justify-center items-center my-2`]}>
                    <View style={tw`flex-row mr-2`}>
                        <Text style={[tw`uppercase text-center text-black text-lg mr-2`, { maxWidth: windowWidth - 100 }]}>{disponibilite ? 'Arreter le travail' : 'Commencer le travail'}</Text>
                        {disabled && (
                            <ActivityIndicator size='small' color={ColorsEncr.main} />
                        )}
                    </View>
                    <SwitchPaper disabled={user.compte_business == 1 && user.actif == 0 ? true : disabled} value={disponibilite} onValueChange={(value) => onHandlePicker(value)} />
                </View>
            )}

            <ScrollView
                refreshControl={
                    <RefreshControl
                        colors={['red', 'blue', 'green']}
                        refreshing={refresh}
                        onRefresh={onRefresh}
                        progressBackgroundColor='#ffffff'
                    />
                }
                contentContainerStyle={[tw``, { minHeight: height - 116 - 98.5 }]}>
                <View style={[tw`${user.compte_business == 1 ? 'flex-1 justify-around' : ''} py-3`]}>
                    {user.compte_business == 1 && user.actif == 0 && (
                        <Text style={tw`text-center text-black px-3`}>Votre compte est momentanément désactivé. Veuillez vous rendre dans notre agence pour compléter votre inscription. Merci.</Text>
                    )}

                    {user.compte_business == 1
                        ? fullNewCourses > 0
                            ? (
                                <View style={tw`mx-5 my-2 p-3 bg-black rounded-md`}>
                                    <Text style={[tw`text-base text-orange-400`]}>De nouvelles courses sont disponibles. <Text style={tw`font-bold`}>{fullNewCourses.toString().padStart(2, '0')} courses en attente.</Text></Text>
                                </View>
                            )
                            : (newCourses > 0 || newReservations > 0) && (
                                <View style={tw`mx-5 my-2 p-3 bg-black rounded-md`}>
                                    <Text style={tw`text-base text-orange-400`}>
                                        <Text>De nouvelles courses disponibles: </Text> 
                                        {newCourses > 0 && (
                                            <><Text style={tw`font-bold`}>{newCourses.toString().padStart(2,'0')}</Text> course(s) instantanée(s)</>
                                        )}
                                        {(newCourses > 0 && newReservations > 0) && (
                                            <> et </>
                                        )}
                                        {newReservations > 0 && (
                                            <><Text style={tw`font-bold`}>{newReservations.toString().padStart(2,'0')}</Text> Réservations(s)</>
                                        )}
                                    </Text>
                                </View>
                            )
                        : null
                    }

                    {user.compte_business == 1
                        ?
                        <View style={[tw`flex-1 justify-center`]}>
                            <View style={[tw`flex-row justify-center items-start px-10 mb-4`, { height: 200 }]}>
                                <ButtonMenu disabled={user.actif == 0} navigation={navigation} route='DashCoursesDispos' iconName='car-alt' caption='Courses Disponibles' />
                                <Text style={[tw`mx-2`]}></Text>
                                <ButtonMenu disabled={user.actif == 0} navigation={navigation} route='DashCovoiturages' iconName='user-friends' caption="Covoiturage" />
                            </View>
                            <View style={[tw`flex-row justify-center items-start px-10`, { height: 200 }]}>
                                <ButtonMenu disabled={user.actif == 0} navigation={navigation} route='DashReservations' iconName='calendar-alt' caption='Réservation' />
                                <Text style={[tw`mx-2`]}></Text>
                                <ButtonMenu navigation={navigation} route='DashBilan' disabled={user.actif == 0} iconName='chart-bar' caption='Bilan' />
                            </View>
                        </View>
                        :
                        <View style={[tw`flex-1 justify-center mt-5`]}>
                            <View style={[tw`flex-row justify-center items-start px-10 mb-4`, { height: 200 }]}>
                                <ButtonMenu navigation={navigation} route='DashCovoiturages' iconName='user-friends' caption="Covoiturage" containerStyle={tw`rounded-lg`} />
                                <Text style={[tw`mx-2`]}></Text>
                                <ButtonMenu navigation={navigation} route='DashBilan' iconName='chart-bar' caption='Bilan' containerStyle={tw`rounded-lg`} />
                            </View>
                        </View>
                    }
                </View>
            </ScrollView>

            <View style={[tw`px-10 py-2`]}>
                <View style={[tw`bg-slate-300 rounded-lg py-2 px-3 flex-row justify-between`, { height: 80 }]}>
                    <Pressable
                        onPress={() => navigation.navigate('DashPortefeuille')}
                        style={[tw`flex-1 flex-row items-center`]}>
                        <Icon
                            type="font-awesome-5"
                            name="wallet"
                            size={30} />
                        <View style={[tw`ml-3`]}>
                            <Text style={[tw`text-gray-800`]}>Portefeuille</Text>
                            <Text style={[tw`text-black font-bold text-2xl`]}>{getCurrency(user.portefeuille)} F</Text>
                        </View>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('DashTransactions')}
                        style={[tw`justify-center items-center`]}>
                        <Icon
                            type="font-awesome-5"
                            name="history"
                            size={30}
                        />
                        <Text style={[tw`text-black`]}>Historique</Text>
                    </Pressable>
                </View>
            </View>
        </Base>
    )
}

export default HomeView;