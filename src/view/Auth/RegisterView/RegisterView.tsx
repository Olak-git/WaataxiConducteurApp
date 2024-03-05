import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Base from '../../../components/Base';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import { api_ref, apiv3, baseUri, fetchUri, format_size, validateEmail, validatePassword, windowHeight } from '../../../functions/functions';
import FilePicker, { types } from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import InputForm from '../../../components/InputForm';
import { Icon } from '@rneui/base';
import ConducteurForm from './components/ConducteurForm';
import CovoiturageForm from './components/CovoiturageForm';
import { useDispatch, useSelector } from 'react-redux';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import { clone, getErrorResponse, storagePermission } from '../../../functions/helperFunction';
import { setUser } from '../../../feature/user.slice';
import { otp_authentication, polices } from '../../../data/data';
import { setDisponibiliteCourse, setDisponibiliteReservation, setStopped, setWithPortefeuille } from '../../../feature/init.slice';
import { signup } from '../../../services/races';

interface RegisterViewProps {
    navigation: any,
    route: any
}
const RegisterView:React.FC<RegisterViewProps> = ({ navigation, route }) => {

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const {width} = useWindowDimensions();

    const {tel: telephone, country, countryCode} = route.params;

    const scrollRef = useRef(null);

    const [mode, setMode] = useState(0);

    const [inputs, setInputs] = useState({
        nom: '',
        prenom: '',
        email: '',
        profil: {},
        business: 1,
        password: '',
        confirmation: '',
        // Covoiturage
        permis: '',
        file_permis: {},
        cip: '',
        file_cip: {},
        carte_grise: '',
        file_carte_grise: {}
    })

    const [errors, setErrors] = useState({
        nom: null,
        prenom: null,
        email: null,
        profil: null,
        password: null,
        confirmation: null,
        cov_nom: null,
        cov_prenom: null,
        permis: null,
        file_permis: null,
        cip: null,
        file_cip: null,
        carte_grise: null,
        file_carte_grise: null
    });

    const [visible, setVisible] = useState(false);

    const [avatar, setAvatar] = useState<any>(null);

    const goDashboard = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {name: 'Drawer'}
                ]
            })
        )
    }

    const goBack = () => {
        if(navigation.canGoBack()) {
            navigation.goBack()
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [
                        {name: 'Auth'}
                    ]
                })
            )
        }
    }

    const handleOnChange = (input: string, text: any) => {
        setInputs(prevState => ({ ...prevState, [input]: text }))
    }

    const handleError = (input: string, text: any) => {
        setErrors(prevState => ({...prevState, [input]: text}))
    }

    const getFileName = (type: string) => {
        // @ts-ignore
        if(inputs[type] && inputs[type].name) {
            // @ts-ignore
            return inputs[type].name + ' (' + format_size(inputs[type].size) + ')';
        }
        return 
    }

    const onSelectImage = (file: string) => {
        if(Platform.OS == 'android') {
            handleFilePicker(file)
        } else {
            openLaunchGalery(file)
        }
    }

    const openLaunchGalery = async (file: string) => {
        const granted = await storagePermission();
        if(granted) {
            try {
                const result = await launchImageLibrary({mediaType: 'photo', selectionLimit: 1})
                if(result.assets) {
                    const $file = result.assets[0];
                    console.log('$file: ', $file)
                    if(file == 'profil') setAvatar({uri: $file.uri});
                    handleOnChange(file, {
                        'fileCopyUri': null,
                        'name': $file.fileName,
                        'size': $file.fileSize,
                        'type': $file.type,
                        'uri': $file.uri
                    })
                }
                if(result.didCancel) {
                    console.log('Canceled')
                }
                if(result.errorCode) {
                    console.log('Error Code ', result.errorCode, ', ', result.errorMessage)
                }
            } catch(e) {
                console.log('Error: ', e)
            }
        }
    }

    const handleFilePicker = async (file: string) => {
        const permissionStorage = await storagePermission();
        if(permissionStorage) {
            try {
                const response = await FilePicker.pick({
                    presentationStyle: 'pageSheet',
                    type: [types.images],
                    transitionStyle: 'coverVertical',
                })
                FilePicker.isCancel((err: any) => {
                    console.log(err);
                })
                if(file == 'profil')
                    setAvatar({uri: response[0].uri})
                // @ts-ignore
                // console.log(response[0].name + '(' + format_size(response[0].size) + ')');
                handleOnChange(file, response[0])

            } catch(e) {
                console.log(e)
            }
        }
    }

    // const onHandle = () => {
    //     navigation.navigate('DashHome');
    // }

    const onHandle = () => {
        let valide = true;
        handleError('profil', null);
        if(!inputs.nom) {
            handleError('nom', 'est requis.');
            valide = false;
        } else if(!inputs.nom.trim()) {
            handleError('nom', 'ne peut pas être en blanc.');
            valide = false;
        } else {
            handleError('nom', null);
        }

        if(!inputs.prenom) {
            handleError('prenom', 'est requis.');
            valide = false;
        } else if(!inputs.prenom.trim()) {
            handleError('prenom', 'ne peut pas être en blanc.');
            valide = false;
        } else {
            handleError('prenom', null);
        }

        if(!otp_authentication) {
            if(!inputs.password) {
                handleError('password', 'est requis.');
                valide = false;
            } else if(!validatePassword(inputs.password)) {
                handleError('password', 'Doit contenir les caractères a-z, A-Z, 0-9 et caractères spéciaux(+,=,@,...)');
                valide = false;
            } else {
                handleError('password', null);
            }
    
            if(!inputs.confirmation) {
                handleError('confirmation', 'est requis.');
                valide = false;
            } else if(inputs.password && inputs.confirmation !== inputs.password) {
                handleError('confirmation', 'Non conforme.');
                valide = false;
            } else {
                handleError('confirmation', null);
            }
        }

        if(!inputs.email) {
            handleError('email', 'est requis.');
            valide = false;
        } else if(!validateEmail(inputs.email)) {
            handleError('email', 'email non valide.');
            valide = false;
        } else {
            handleError('email', null);
        }
        /* if(inputs.email && !validateEmail(inputs.email)) {
            handleError('email', 'email non valide.');
            valide = false;
        } else {
            handleError('email', null);
        } */

        if(!inputs.business) {
            if(!inputs.permis) {
                handleError('permis', 'est requis.');
                valide = false;
            } else if(!inputs.permis.trim()) {
                handleError('permis', 'ne peut pas être en blanc.');
                valide = false;
            } else {
                handleError('permis', null);
            }

            if(Object.keys(inputs.file_permis).length == 0) {
                handleError('file_permis', 'File est requis.');
                valide = false;
            } else {
                handleError('file_permis', null);
            }

            if(!inputs.cip) {
                handleError('cip', 'est requis.');
                valide = false;
            } else if(!inputs.cip.trim()) {
                handleError('cip', 'ne peut pas être en blanc.');
                valide = false;
            } else {
                handleError('cip', null);
            }

            if(Object.keys(inputs.file_cip).length == 0) {
                handleError('file_cip', 'File est requis.');
                valide = false;
            } else {
                handleError('file_cip', null);
            }

            if(!inputs.carte_grise) {
                handleError('carte_grise', 'est requis.');
                valide = false;
            } else if(!inputs.carte_grise.trim()) {
                handleError('carte_grise', 'ne peut pas être en blanc.');
                valide = false;
            } else {
                handleError('carte_grise', null);
            }

            if(Object.keys(inputs.file_carte_grise).length == 0) {
                handleError('file_carte_grise', 'File est requis.');
                valide = false;
            } else {
                handleError('file_carte_grise', null);
            }
        }

        if(valide) {
            Keyboard.dismiss();
            setVisible(true);
            const formData = new FormData();
            formData.append('js', null);
            formData.append('signup[business]', inputs.business);
            formData.append('signup[nom]', inputs.nom);
            formData.append('signup[prenom]', inputs.prenom);
            formData.append('signup[email]', inputs.email);
            formData.append('signup[country]', country);
            formData.append('signup[country_code]', countryCode);
            if(!otp_authentication) {
                formData.append('signup[password]', inputs.password);
            }
            formData.append('signup[otp_authentication]', otp_authentication);
            formData.append('signup[tel]', telephone);

            if(!inputs.business) {
                formData.append('signup[num_permis]', inputs.permis);
                formData.append('permis', inputs.file_permis);
                formData.append('signup[num_cni]', inputs.cip);
                formData.append('cni', inputs.file_cip);
                formData.append('signup[num_carte_grise]', inputs.carte_grise);
                formData.append('carte_grise', inputs.file_carte_grise);
            }

            if(Object.keys(inputs.profil).length > 0) {
                formData.append('img', inputs.profil);
            }
            console.log('FormData:', formData);

            fetch(apiv3 ? api_ref + '/signup.php' : fetchUri, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'multipart/form-data'
                }
            })
            .then(response => response.json())
            .then(json => {
                console.log(json)
                setVisible(false);
                if(json.success) {
                    let image = json.user.img;
                    const data = clone(json.user);
                    if(data.img) {
                        data.img = `${baseUri}/assets/avatars/${image}`;
                    }
                    dispatch(setStopped(false))
                    if(json.with_portefeuille) {
                        dispatch(setWithPortefeuille(json.with_portefeuille))
                    }
                    dispatch(setDisponibiliteCourse(json.disponibilite_course));
                    dispatch(setDisponibiliteReservation(json.disponibilite_reservation));
                    dispatch(setUser({...data}));
                } else {
                    const errors = json.errors;
                    console.log('Errors: ', errors);
                    for(let k in errors) {
                        handleError(k, errors[k]);
                    }
                }
            })
            .catch(error => {
                setVisible(false);
                console.log(error)
                getErrorResponse(error)
            })
            .finally(() => {
                setVisible(false);
            })
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0) {
            goDashboard();
        }
    }, [user])

    useEffect(() => {
        console.log('Tel: ', telephone)
    }, [telephone])

    return (
        <Base>
            <ModalValidationForm showModal={visible} />
            <View style={[ tw`items-center mt-1 mb-4` ]}>
                <Text style={[tw`text-black uppercase`, {fontSize: 45, fontFamily: Platform.OS == 'android' ? 'ShadowsIntoLight-Regular' : 'PatrickHand-Regular'}]}>waa<Text style={{color: ColorsEncr.main}}>taxi</Text></Text>
            </View>
            <Text style={[ tw`text-center text-lg text-black mb-5`, {fontFamily: polices.times_new_roman} ]}>Veuillez renseigner votre compte</Text>
            
            <View style={[ tw`px-5` ]}>
                <View style={[ tw`flex-row ${mode == 0 ? 'border-t' : 'border-b'}`, {backgroundColor: ColorsEncr.main_sm, borderColor: ColorsEncr.main_sm} ]}>
                    <Pressable
                        onPress={() => {
                            setMode(0);
                            handleOnChange('business', 1);
                            // @ts-ignore
                            scrollRef?.current?.scrollTo({x: 0, y: 0, animated: true})
                        }}
                        style={[ tw`flex-1 p-2 ${mode == 1 ? 'rounded-br-full' : ''}`, {backgroundColor: mode == 0 ? ColorsEncr.main_sm : 'rgb(248, 250, 252)'} ]}>
                        <Text style={[ tw`font-semibold text-base text-center`, {color: mode == 0 ? '#FFFFFF' : '#000000', fontFamily: polices.times_new_roman} ]}>Conducteur</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            setMode(1);
                            handleOnChange('business', 0);
                            // @ts-ignore
                            scrollRef?.current?.scrollTo({x: width, y: 0, animated: true})
                            // scrollRef?.current?.scrollToEnd({animated: true})
                        }}
                        style={[ tw`flex-1 p-2 ${mode == 0 ? 'rounded-tl-full' : ''}`, {backgroundColor: mode == 1 ? ColorsEncr.main_sm : 'rgb(248, 250, 252)'} ]}>
                        <Text style={[ tw`font-semibold text-base text-center`, {color: mode == 1 ? '#FFFFFF' : '#000000', fontFamily: polices.times_new_roman} ]}>Covoitureur</Text>
                    </Pressable>
                </View>
            </View>

            <View style={[ tw`flex-1`, {elevation: 0} ]}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    style={[ tw`` ]}

                    onLayout={(event) => {
                        // console.log('Event: ', event)
                    }}
                >
                    <ConducteurForm inputs={inputs} handleOnChange={handleOnChange} errors={errors} handleError={handleError} avatar={avatar} setAvatar={setAvatar} handleFilePicker={onSelectImage} />
                    <CovoiturageForm inputs={inputs} handleOnChange={handleOnChange} errors={errors} handleError={handleError} avatar={avatar} setAvatar={setAvatar} handleFilePicker={onSelectImage} getFileName={getFileName} />
                </ScrollView>
            </View>

            <View style={tw`flex-row px-5 mb-2`}>
                <TouchableOpacity onPress={goBack} style={tw``}>
                    <Text style={[tw`text-gray-600`, {fontFamily: polices.times_new_roman}]}>Autre numéro de téléphone ?</Text>
                </TouchableOpacity>
            </View>
            <View style={[ tw`justify-center px-5`, {height: 70} ]}>
                <TouchableOpacity
                    onPress={onHandle}
                    style={[ tw`justify-center items-center rounded py-4 px-5`, {backgroundColor: ColorsEncr.main, height: 60} ]}
                >
                    <Text style={[ tw`uppercase text-center font-medium text-black`, {fontFamily: polices.times_new_roman} ]}>finaliser mon compte</Text>
                </TouchableOpacity>
            </View>
        </Base>
    )
}

export default RegisterView;