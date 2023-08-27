import React from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import InputForm from '../../../../components/InputForm';
import tw from 'twrnc';
import { windowWidth } from '../../../../functions/functions';
import { ColorsEncr } from '../../../../assets/styles';
import { Icon } from '@rneui/themed';
import { otp_authentication } from '../../../../data/data';

interface ConducteurFormProps {
    inputs: any,
    handleOnChange: any,
    errors: any,
    handleError: any,
    avatar: any,
    setAvatar: any,
    handleFilePicker: any,
}

const ConducteurForm: React.FC<ConducteurFormProps> = ({ inputs,handleOnChange = () => {}, errors, handleError, avatar, setAvatar, handleFilePicker }) => {

    const {width, height} = useWindowDimensions();

    return (
        <View style={[ tw`px-10`, {width: width} ]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <InputForm
                    placeholder='Saisissez votre Nom'
                    value={inputs.nom}
                    error={errors.nom}
                    onChangeText={(text: any) => handleOnChange('nom', text)}
                    inputStyle={[ tw`py-0` ]}
                    inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                    containerStyle={tw`mt-5`}
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
                <View style={[tw`flex-row justify-between items-center my-3`]}>
                    <View style={tw`flex-1 mr-1`}>
                        <Text style={tw`text-gray-500 text-lg`}>Photo de profil</Text>
                        {avatar && (
                            <Text onPress={() => {
                                setAvatar(null)
                                handleOnChange('profil', {});
                                handleError('img', null);
                            }} style={[tw`text-center text-xs text-gray-400 border border-red-500 rounded-2xl p-1`, { width: 70 }]}>annuler</Text>
                        )}
                        {errors.profil && (
                            <Text style={tw`text-orange-700 text-sm`}>{errors.profil}</Text>
                        )}
                    </View>
                    <Pressable
                        onPress={() => handleFilePicker('profil')}
                        style={[tw`border border-gray-300 justify-center items-center`, { height: 120, width: 120 }]}
                    >
                        {avatar
                            ?
                            <Image source={avatar}
                                style={{ height: 100, width: 100 }} />
                            :
                            <Icon type='ant-design' name='user' size={40} reverse />
                        }
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

export default ConducteurForm;