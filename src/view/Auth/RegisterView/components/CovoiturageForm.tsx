import React from 'react';
import { Text, Pressable, View, ScrollView, useWindowDimensions, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Icon } from '@rneui/base';
import tw from 'twrnc';
import InputForm from '../../../../components/InputForm';
import { ColorsEncr } from '../../../../assets/styles';
import { otp_authentication, polices } from '../../../../data/data';

interface CovoiturageFormProps {
    inputs: any,
    handleOnChange: any,
    errors: any,
    handleError: any,
    avatar: any,
    setAvatar: any,
    handleFilePicker: any,
    getFileName: any
}

const CovoiturageForm: React.FC<CovoiturageFormProps> = ({ inputs, handleOnChange = () => {}, errors, handleError, avatar, setAvatar, handleFilePicker = () => {}, getFileName = () => {} }) => {

    const {width, height} = useWindowDimensions();

    const getErrors = (e1: string|null, e2: string|null) => {
        let err = null;
        if(e1)
            err = e1;
        if(err && e2) 
            err += '\n' + e2;
        else if(e2)
            err = e2;
        return err;
    }

    return (
        
        <View style={[ tw`px-10`, {width: width} ]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[ tw`text-slate-400 text-xs text-center mb-2 mt-5`, {fontFamily: polices.times_new_roman} ]}>Si vous souhaitez faire uniquement du covoiturage, vous êtes au bon endroit.</Text>
                <InputForm
                    placeholder='Saisissez votre Nom'
                    value={inputs.nom}
                    error={errors.nom}
                    onChangeText={(text: any) => handleOnChange('nom', text)}
                    inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                    inputStyle={[ tw`py-0` ]} 
                />
                <InputForm
                    placeholder='Saisissez votre Prénom'
                    value={inputs.prenom}
                    error={errors.prenom}
                    onChangeText={(text: any) => handleOnChange('prenom', text)}
                    inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                    inputStyle={[ tw`py-0` ]} 
                />
                <InputForm
                    placeholder='Entrez votre e-mail'
                    value={inputs.email}
                    error={errors.email}
                    keyboardType='email-address'
                    onChangeText={(text: any) => handleOnChange('email', text)}
                    inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                    inputStyle={[ tw`py-0` ]}
                    // helper='Optionnel *'
                    helperStyle={tw`text-orange-500`}
                />
                {!otp_authentication && (
                    <>
                        <InputForm
                            placeholder='Saisissez votre mot de passe'
                            error={errors.password}
                            onChangeText={(text: any) => handleOnChange('password', text)}
                            password
                            inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                            inputStyle={[ tw`py-0` ]} 
                        />
                        <InputForm
                            placeholder='Confirmez le mot de passe'
                            error={errors.confirmation}
                            onChangeText={(text: any) => handleOnChange('confirmation', text)}
                            password
                            inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                            inputStyle={[ tw`py-0` ]} 
                        />
                    </>
                )}
                <Text style={[tw`text-black font-medium text-lg mt-2`, {fontFamily: polices.times_new_roman}]}>Document d'identification</Text>
                <Text style={[tw`text-slate-400 mb-5`, {fontFamily: polices.times_new_roman}]}>Veuillez joindre les documents d'identification</Text>
                <InputForm
                    label='Permis de conduire'
                    labelStyle={[tw`uppercase`]}
                    placeholder="Entrez le N° d'identification"
                    rightContent={
                        <Pressable onPress={() => handleFilePicker('file_permis')}>
                            <Icon
                                type='ant-design'
                                name='pluscircle'
                                color={Object.keys(inputs.file_permis).length > 0 ? 'black' : 'silver'}/>
                        </Pressable>
                    }
                    helper={getFileName('file_permis')}
                    helperStyle={[tw`text-gray-500`]}
                    value={inputs.permis}
                    error={getErrors(errors.permis, errors.file_permis)}
                    onChangeText={(text: any) => handleOnChange('permis', text)}
                    inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                    inputStyle={[ tw`py-0` ]} 
                />
                <InputForm
                    label='cip'
                    labelStyle={[tw`uppercase`]}
                    placeholder="N° d'identification personnelle"
                    rightContent={
                        <Pressable onPress={() => handleFilePicker('file_cip')}>
                            <Icon
                                type='ant-design'
                                name='pluscircle'
                                color={Object.keys(inputs.file_cip).length > 0 ? 'black' : 'silver'}/>
                        </Pressable>
                    }
                    helper={getFileName('file_cip')}
                    helperStyle={[tw`text-gray-500`]}
                    value={inputs.cip}
                    error={getErrors(errors.cip, errors.file_cip)}
                    onChangeText={(text: any) => handleOnChange('cip', text)}
                    inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                    inputStyle={[ tw`py-0` ]} 
                />
                <InputForm
                    label='Carte grise'
                    labelStyle={[tw`uppercase`]}
                    placeholder="N° d'immatriculation"
                    rightContent={
                        <Pressable onPress={() => handleFilePicker('file_carte_grise')}>
                            <Icon
                                type='ant-design'
                                name='pluscircle'
                                color={Object.keys(inputs.file_carte_grise).length > 0 ? 'black' : 'silver'}/>
                        </Pressable>
                    }
                    helper={getFileName('file_carte_grise')}
                    helperStyle={[tw`text-gray-500`]}
                    value={inputs.carte_grise}
                    error={getErrors(errors.carte_grise, errors.file_carte_grise)}
                    onChangeText={(text: any) => handleOnChange('carte_grise', text)}
                    inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                    inputStyle={[ tw`py-0` ]} 
                />
                    <View style={[tw`flex-row justify-between items-center my-3`]}>
                        <View style={tw`flex-1 mr-1`}>
                            <Text style={[tw`text-gray-500 text-lg`, {fontFamily: polices.times_new_roman}]}>Photo de profil</Text>
                            {avatar && (
                                <Text onPress={() => {
                                    setAvatar(null)
                                    handleOnChange('profil', {});
                                    handleError('img', null);
                                }} style={[tw`text-center text-xs text-gray-400 border border-red-500 rounded-2xl p-1`, {width: 70, fontFamily: polices.times_new_roman}]}>annuler</Text>
                            )}
                            {errors.profil && (
                                <Text style={[tw`text-orange-700 text-sm`, {fontFamily: polices.times_new_roman}]}>{errors.profil}</Text>
                            )}
                        </View>
                        <Pressable
                            onPress={() => handleFilePicker('profil')}
                            style={[tw`border border-gray-300 justify-center items-center`, {height: 120, width: 120}]}
                        >
                            {avatar
                            ?
                                <Image source={avatar}
                                    style={{height: 100, width: 100}} />
                            :
                                <Icon type='ant-design' name='user' size={40} reverse />
                            }
                        </Pressable>
                    </View>
            </ScrollView>
        </View>
    )
}

export default CovoiturageForm;