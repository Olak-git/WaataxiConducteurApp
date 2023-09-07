import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, Icon } from '@rneui/base';
import Base from '../../../components/Base';
import Header from '../../../components/Header';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import { baseUri, fetchUri, getCurrency, toast } from '../../../functions/functions';
import { Rating } from 'react-native-ratings';
import Spinner from 'react-native-spinkit';
import { getErrorsToString, getLocalTimeStr } from '../../../functions/helperFunction';
import BottomButton from '../../../components/BottomButton';
import { DataTable, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityLoading } from '../../../components/ActivityLoading';
import InputForm from '../../../components/InputForm';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import FlashMessage from '../../../components/FlashMessage';
import { setReload } from '../../../feature/reload.slice';
import { refreshHistoriqueCovoiturages } from '../../../feature/refresh.slice';
import { polices } from '../../../data/data';

interface RowProps {
    iconType: string,
    iconName: string,
    iconSize?: number,
    textStyle?: any,
    text: string,
    _text?: React.ReactElement
}
const Row: React.FC<RowProps> = ({ iconType, iconName, iconSize = 30, textStyle = [], text, _text }) => {
    return (
        <View style={[ tw`flex-row items-center mb-3` ]}>
            <View style={[ tw``, {width: 50} ]}>
                <Icon
                    type={iconType}
                    name={iconName}
                    color='#666'
                    size={iconSize} />
            </View>
            <Text style={[ tw`text-gray-600 font-semibold text-lg mx-2`, {fontFamily: polices.times_new_roman} ]}>:</Text>
            <View style={[ tw`flex-1` ]}>
                <Text style={[ tw`text-black font-medium text-lg`, {fontFamily: polices.times_new_roman}, ...textStyle ]}>{ text }{_text}</Text>
            </View>
        </View>
    )
}

interface DetailsNewCovoiturageViewProps {
    navigation: any,
    route: any
}
const DetailsNewCovoiturageView: React.FC<DetailsNewCovoiturageViewProps> = (props) => {

    const dispatch = useDispatch();

    const {navigation, route} = props;
    
    const { valide } = route.params;

    const [course, setCourse] = useState(route.params.course);

    const [reservations, setReservations] = useState<any>([]);
    
    const { conducteur } = course;

    // const path = conducteur.img ? {uri: baseUri + '/assets/avatars/' + conducteur.img} : require('../../../assets/images/user-1.png');
    const path = require('../../../assets/images/icons8-cab-100.png');

    const user = useSelector((state: any) => state.user.data);

    var timer:any = null;

    const reload = useSelector((state: any) => state.reload.value);
    const refreshCourse = useSelector((state: any) => state.refresh.covoiturage);

    const [rating, setRating] = useState(0);

    const [endFetch, setEndFetch] = useState(false);

    const [dialog, setDialog] = useState(false);

    const [selected, setSelected] = useState<number | undefined>(undefined);

    const [refresh, setRefresh] = useState(false);

    const [visible, setVisible] = useState({
        modal: false,
        form: false
    });
    const [loading, setLoading] = useState(false);

    const [inputs, setInputs] = useState({
        mnt: undefined
    });

    const [errors, setErrors] = useState({
        mnt: null
    });

    const handleOnChange = (input: string, text: any) => {
        setInputs(prevState => ({ ...prevState, [input]: text }))
    }

    const handleError = (input: string, text: any) => {
        setErrors(prevState => ({...prevState, [input]: text}))
    }

    const getReservations = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('reservations-covoiturage', null);
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
            setRefresh(false);
            if(json.success) {
                // console.log('Reservations: ', json.reservations);
                setReservations([...json.reservations]);
            } else {
                const errors = json.errors;
                console.log(errors);
            }
            setEndFetch(true);
        })
        .catch(error => {
            setRefresh(false);
            console.log(error);
        })
    }

    const onHandlePrice = () => {
        let valide = true;
        if(!inputs.mnt) {
            handleError('mnt', 'est requis.');
            valide = false;
        } else {
            handleError('mnt', null);
        }
        if(valide) {
            setLoading(true)
            setVisible(state => ({...state, modal: true}));
            const formData = new FormData()
            formData.append('js', null)
            formData.append(`update-prix-reservation-covoiturage`, null)
            formData.append('token', user.slug)
            // @ts-ignore
            formData.append('reservation', reservations[selected].slug)
            formData.append('prix', inputs.mnt)

            // console.log('Form: ', formData);

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
                setLoading(false);
                if(json.success) {
                    // toast('SUCCESS', `Votre portefeuille a été crédité de ${inputs.mnt} FCFA`, false)
                    // console.log('Reservations: ', json.reservations);
                    setReservations([...json.reservations]);
                } else {
                    const errors = json.errors;
                    console.log('Errors: ', errors);
                    const txt = getErrorsToString(errors);
                    // console.log('Err: ', txt);
                    toast('DANGER', txt, false)
                }
            })
            .catch(e => {
                setVisible(state => ({...state, modal: false}));
                setLoading(false);
                console.warn(e)
            })
        }
    }

    const onCourse = (action: string) => {
        setVisible(state => ({...state, modal: true}));
        const formData = new FormData();
        formData.append('js', null);
        formData.append('upd-state-covoiturage', action);
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
                setCourse((state: any) => ({...state, ...json.course}));
                dispatch(refreshHistoriqueCovoiturages());
            } else {
                const errors = json.errors;
                console.log(errors);
                const txt = getErrorsToString(errors);
                toast('DANGER', txt, false)
            }
        })
        .catch(error => {
            setVisible(state => ({...state, modal: false}));
            console.log(error)
        })
    }

    const getDataUser = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('data-user', conducteur.slug);
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

    const onRefresh = () => {
        setRefresh(true);
        getCourse();
        getReservations();
    }

    DeviceEventEmitter.addListener("event.cleartimer", (eventData) => {
        clearInterval(timer);
        console.log('Clear');
    });

    const getCourse = () => {
        // console.log('Bob')
        const formData = new FormData();
        formData.append('js', null);
        formData.append('data-course', null);
        formData.append('category', 'covoiturage');
        formData.append('course', course.slug);
        formData.append('token', user.slug);
        // console.log(formData);
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
                dispatch(refreshHistoriqueCovoiturages());
            } else {
                const errors = json.errors;
                console.log(errors);
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    const onHandleCanceledCourse = () => {
        setVisible(state => ({...state, modal: true}));
        const formData = new FormData();
        formData.append('js', null);
        formData.append('canceled-covoiturage', null);
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
            if(json.success) {
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
            console.log(error)
        })
        .finally(()=>{
            setVisible(state => ({...state, modal: false}));
        })
    }

    useEffect(() => {
        getReservations();
    }, [])

    useEffect(() => {
        timer = setInterval(getReservations, 5000);
        return () => {
            clearInterval(timer);
        }
    }, [])

    useEffect(() => {
        getCourse();
    }, [refreshCourse])

    // useEffect(() => {
    //     getDataUser();
    // }, [reload])
    
    return (
        <Base>
            <ModalValidationForm showModal={visible.modal} />
            <Header navigation={navigation} headerTitle='Détails/Covoiturage' />
            
            {dialog && (
                <View style={[ tw`justify-center items-center`, StyleSheet.absoluteFill, {backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1} ]}>
                    <Pressable
                        onPress={() => {
                                setDialog(false)
                                setLoading(false)
                                setVisible(state => ({...state, form: false}))
                            }
                        }
                        // @ts-ignore
                        style={[tw`absolute right-5`, {zIndex: 10, top: Platform.OS == 'android' ? StatusBar.currentHeight + 5 : 30}]}>
                        <Icon type='ant-design' name='close' size={40} color='white' />
                    </Pressable>
                    <View style={[ tw`bg-white justify-center rounded-2xl p-3`, {minHeight: 300, width: 300} ]}>
                        {selected !== undefined && (
                        <View style={[tw``, {}]}>
                            <View style={[ tw`items-center border-b border-t border-gray-200 px-3 py-2 mb-2`, {} ]}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('DashProfilPassager', {passager: reservations[selected].passager})} style={tw`rounded-full mr-2`}>
                                    <Image
                                        source={reservations[selected].passager.img ? {uri: baseUri + '/assets/avatars/' + reservations[selected].passager.img} : require('../../../assets/images/user-1.png')}
                                        style={[ tw`rounded-full border-2`, {width: 70, height: 70, borderColor: ColorsEncr.main}]}
                                    />
                                </TouchableOpacity>                                        
                                <Text style={[tw`text-sm text-center text-black`, {fontFamily: polices.times_new_roman}]} numberOfLines={2} ellipsizeMode='tail'>{reservations[selected].passager.nom.toUpperCase() + ' ' + reservations[selected].passager.prenom}</Text>
                            </View>

                            <View style={tw`flex-row mb-1`}>
                                <Icon type='material-community' name={'map-marker-outline'} size={18} color='green' style={tw`mr-1`} />
                                <Text style={[ tw`flex-1 text-gray-400 text-xs`, {fontFamily: polices.times_new_roman} ]}>{reservations[selected].adresse_depart}</Text>
                            </View>
                            <View style={tw`flex-row mb-2`}>
                                <Icon type='material-community' name={'map-marker-outline'} size={18} color={ColorsEncr.main} style={tw`mr-1`} />
                                <Text style={[ tw`flex-1 text-gray-400 text-xs`, {fontFamily: polices.times_new_roman} ]}>{reservations[selected].adresse_arrive}</Text>
                            </View>

                            <View style={[ tw`mb-2 flex-row items-center` ]}>
                                <Text style={[tw`text-black`, {fontFamily: polices.times_new_roman}]}>Prix: </Text>
                                <Text style={[tw`flex-1 text-black text-xs`, {fontFamily: polices.times_new_roman}]}>{getCurrency(reservations[selected].prix)} FCFA</Text>
                                <Pressable
                                    onPress={() => setVisible(state => ({...state, form: !visible.form}))}
                                    style={tw`p-2`}
                                >
                                    <Icon type="material-community" name="circle-edit-outline" color={visible.form ? 'blue' : ''} />
                                </Pressable>
                            </View>

                            <View style={[ tw`mb-2 flex-row items-center` ]}>
                                <Text style={[tw`text-black`, {fontFamily: polices.times_new_roman}]}>Passager(s): </Text>
                                <Text style={[tw`flex-1 text-black text-xs`, {fontFamily: polices.times_new_roman}]}>{reservations[selected].nb_place}</Text>
                            </View>

                            <View style={[ tw`mb-2 flex-row items-center` ]}>
                                <Text style={[tw`text-black`, {fontFamily: polices.times_new_roman}]}>Date: </Text>
                                <Text style={[tw`flex-1 text-black text-xs`, {fontFamily: polices.times_new_roman}]}>{reservations[selected].dat}</Text>
                            </View>

                            {visible.form && (
                                <View style={tw`mt-3`}>
                                    <InputForm
                                        label='Tarif'
                                        labelStyle={[ tw`text-lg mb-2` ]}
                                        containerStyle={tw``}
                                        placeholder='Entrez un montant'
                                        keyboardType={'numeric'}
                                        formColor='rgb(209, 213, 219)'
                                        error={errors.mnt}
                                        defaultValue={reservations[selected].prix}
                                        value={inputs.mnt}
                                        onChangeText={(text: string) => handleOnChange('mnt', text)}
                                        inputContainerStyle={[ tw`border rounded`, {height: 45} ]}
                                    />
                                    <Button onPress={onHandlePrice} mode='outlined' loading={loading} labelStyle={[tw`text-green-500`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman}]} style={[tw``, {borderColor: ColorsEncr.main}]}>
                                        Valider
                                    </Button>
                                </View>
                            )}

                        </View>
                        )}
                    </View>
                </View>
            )}

            <ScrollView
                refreshControl={
                    <RefreshControl
                        colors={['red', 'blue', 'green']}
                        refreshing={refresh} 
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={[ tw`items-center border-b border-t border-gray-200 px-3 py-2`, {} ]}>
                    <Image
                        source={path}
                        style={[ tw``, {width: 80, height: 80, borderColor: ColorsEncr.main}]}
                    />
                </View>

                {/* <View style={[ tw`flex-row border-b border-t border-gray-200 px-3 py-2`, {} ]}>
                    <TouchableOpacity onPress={() => navigation.navigate('DashMyAccount')} style={tw`rounded-full mr-2`}>
                        <Image
                            source={path}
                            style={[ tw`rounded-full border-2`, {width: 70, height: 70, borderColor: ColorsEncr.main}]}
                        />
                    </TouchableOpacity>
                    <View style={tw`flex-1 pt-1`}>
                        <Text style={[tw`text-black`, {fontFamily: polices.times_new_roman}]}>{ conducteur.nom.toUpperCase() + ' ' + conducteur.prenom } (vous)</Text>
                    </View>
                    <Rating
                        readonly
                        startingValue={rating}
                        ratingCount={5}
                        imageSize={15}
                        ratingColor={ColorsEncr.main}
                        style={[tw``, {marginTop: 7.5}]}
                    />
                </View> */}

                <View style={tw`border-b border-gray-200 px-3 py-4`}>
                    <View style={[ tw`flex-row items-center mb-3` ]}>
                        <Icon type='font-awesome-5' name='map-marker-alt' color='green' containerStyle={tw`mr-2 self-start`} />
                        <Text style={[ tw`flex-1 text-gray-400`, {fontFamily: polices.times_new_roman} ]}>{course.adresse_depart}</Text>
                    </View>
                    <View style={[ tw`flex-row items-center` ]}>
                        <Icon type='font-awesome-5' name='map-marker-alt' color={ColorsEncr.main} containerStyle={tw`mr-2 self-start`} />
                        <Text style={[ tw`flex-1 text-gray-400`, {fontFamily: polices.times_new_roman} ]}>{course.adresse_arrive}</Text>
                    </View>

                    <View style={[ tw`flex-row justify-between px-2 mt-5` ]}>
                        <View style={[ tw`flex-row items-center bg-orange-100 rounded-2xl py-1 px-3` ]}>
                            <Icon type='material-community' name='approximately-equal' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            <Icon type='font-awesome-5' name='car-alt' size={20} iconStyle={{ color: ColorsEncr.main }} containerStyle={[ tw`mr-1` ]} />
                            <Text style={[ tw`text-xs`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]}>{course.nb_km} km</Text>
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
                        <Icon type='font-awesome-5' name='calendar-alt' color={ColorsEncr.main} />
                        <Text style={[tw`text-black font-bold`, {fontFamily: polices.times_new_roman}]}>{ course.date_course}</Text>
                    </View>

                    <Divider orientation='vertical' />

                    <View style={tw`flex-1 justify-between items-center`}>
                        <Icon type='font-awesome-5' name='history' color={ColorsEncr.main} />
                        <Text style={[tw`text-black font-bold`, {fontFamily: polices.times_new_roman}]}>{getLocalTimeStr(course.heure_course)}</Text>
                    </View>
                </View>

                <View style={tw`flex-row justify-between border-b border-gray-200 px-3 py-4`}>

                    <View style={tw`flex-1 justify-between items-center`}>
                        <Text style={[tw`text-black font-bold`, {fontFamily: polices.times_new_roman}]}>{course.nb_place_restante} Place(s) disponible(s)</Text>
                        <Icon type='ant-design' name='user' color={ColorsEncr.main} />
                    </View>

                    <Divider orientation='vertical' />

                    <View style={tw`flex-1 justify-between items-center`}>
                        <Text style={[tw`text-black font-bold`, {fontFamily: polices.times_new_roman}]}>Prix</Text>
                        <Text style={[ tw`text-lg`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]}>{getCurrency(course.mnt)} XOF</Text>
                    </View>

                </View>

                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title textStyle={{ fontFamily: polices.times_new_roman }}>Passager</DataTable.Title>
                        <DataTable.Title textStyle={{ fontFamily: polices.times_new_roman }}>Départ</DataTable.Title>
                        <DataTable.Title textStyle={{ fontFamily: polices.times_new_roman }}>Arrivé</DataTable.Title>
                        <DataTable.Title numeric textStyle={{ fontFamily: polices.times_new_roman }}>Prix</DataTable.Title>
                        <DataTable.Title numeric textStyle={{ fontFamily: polices.times_new_roman }}>Date</DataTable.Title>
                    </DataTable.Header>
                    {endFetch
                    ?
                        reservations.length > 0
                        ?
                            reservations.map((item: any, index: number) => 
                                (
                                    <DataTable.Row key={index.toString()} onPress={() => {
                                        setSelected(index);
                                        setDialog(true);
                                    }}>
                                        <DataTable.Cell textStyle={{ fontFamily: polices.times_new_roman }}>{item.passager.nom}</DataTable.Cell>
                                        <DataTable.Cell textStyle={{ fontFamily: polices.times_new_roman }}>{item.adresse_depart}</DataTable.Cell>
                                        <DataTable.Cell textStyle={{ fontFamily: polices.times_new_roman }}>{item.adresse_arrive}</DataTable.Cell>
                                        <DataTable.Cell numeric textStyle={{ fontFamily: polices.times_new_roman }}>{item.prix}</DataTable.Cell>
                                        <DataTable.Cell numeric textStyle={{ fontFamily: polices.times_new_roman }}>{item.dat}</DataTable.Cell>
                                    </DataTable.Row>
                                )
                            )
                        :
                            <Text style={[tw`text-center text-gray-400 p-2`, {fontFamily: polices.times_new_roman}]}>Aucune réservation disponible</Text>
                    :
                        <View style={tw`p-2`}>
                            <ActivityIndicator color={'#c2c2c2'} />
                        </View>
                    }
                </DataTable>

                <View style={tw`mt-10 mb-5`}>
                    {course.etat_course == 0
                    ?
                        <>
                            <View style={[tw`mb-3`, {}]}>
                                <Text style={[tw`text-center font-black text-black`, {fontFamily: polices.times_new_roman}]}>Course en attente...</Text>
                                <View style={[tw`items-center`, {}]}>
                                    <Image resizeMode='contain' source={require('../../../assets/images/gifs/icons8-voiture.gif')} style={[tw``, {width: 200, height: 100}]} />
                                </View>
                            </View>
                            <View style={tw`flex-row flex-wrap justify-around`}>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => onCourse('start')}
                                    style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, {borderColor: ColorsEncr.main}]}>
                                    <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.times_new_roman}]}>Démarrer la course</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    onPress={() => navigation.navigate('DashItineraire', {course: course, reservations: reservations, category: 'covoiturage'})}
                                    style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, { borderColor: ColorsEncr.main }]}>
                                    <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.times_new_roman}]}>Voir la course</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={tw`px-7 mt-2`}>
                                <Button onPress={onHandleCanceledCourse} mode='contained' color='rgb(185, 28, 28)' contentStyle={tw`p-3`} labelStyle={{ fontFamily: polices.times_new_roman }}>
                                    Annuler
                                </Button>
                            </View>
                        </>
                    :
                        course.etat_course == 1
                        ?
                            <>
                                <Text style={[tw`text-center text-black`, {fontFamily: polices.times_new_roman}]}>Course en cours...</Text>
                                <View style={[tw`items-center`, {}]}>
                                    <Image resizeMode='contain' source={require('../../../assets/images/gifs/icons8-fiat-500.gif')} style={[tw``, {width: 200, height: 100}]} />
                                </View>
                                <View style={tw`flex-row flex-wrap justify-around mt-5`}>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => onCourse('end')}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, {borderColor: ColorsEncr.main}]}>
                                        <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.times_new_roman}]}>Course terminée</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => navigation.navigate('DashItineraire', {course: course, reservations: reservations, category: 'covoiturage'})}
                                        style={[tw`flex-row justify-center items-center border rounded-lg p-3 mb-2`, { borderColor: ColorsEncr.main }]}>
                                        <Text style={[tw`text-gray-500 text-base text-center`, {fontFamily: polices.times_new_roman}]}>Voir la course</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        : 
                        <>
                            <Text style={[tw`text-center font-black text-black`, {fontFamily: polices.times_new_roman}]}>Course Terminée</Text>
                            <View style={[tw`items-center`, {}]}>
                                <Image resizeMode='contain' source={require('../../../assets/images/icons8-taxi-stop-100.png')} style={[tw``, {width: 200, height: 100}]} />
                            </View>
                        </>
                            // <View style={tw`justify-around`}>
                            //     <Pressable
                            //         onPress={() => onCourse('start')}
                            //         style={[tw`flex-row justify-center items-center border rounded-lg p-3`, {borderColor: ColorsEncr.main}]}>
                            //         <Text style={[tw`ml-2 text-gray-500 text-base text-center`, {fontFamily: polices.times_new_roman}]}>Relancer la course</Text>
                            //     </Pressable>
                            // </View>
                    }
                </View>

            </ScrollView>
        </Base>
    )

}

export default DetailsNewCovoiturageView;