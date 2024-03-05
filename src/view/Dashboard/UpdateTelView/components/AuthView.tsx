import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView, Platform } from 'react-native';
import tw from 'twrnc';
import { ColorsEncr } from '../../../../assets/styles';
import { useDispatch, useSelector } from 'react-redux';
import { api_ref, apiv3, fetchUri } from '../../../../functions/functions';
import InputForm from '../../../../components/InputForm';
import { Button } from 'react-native-paper';
import { account, polices } from '../../../../data/data';
import { signin } from '../../../../services/races';
import { getErrorResponse } from '../../../../functions/helperFunction';

interface AuthViewProps {
    setConfirm: any,
    errors: any,
    handleError: any,
    inputs: any,
    handleOnChange: any,
}
const AuthView:React.FC<AuthViewProps> = ({ setConfirm, errors, handleError, inputs, handleOnChange }) => {

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const [disable, setDisable] = useState(false);

    const [loading, setLoading] = useState(false);

    const auth = () => {
        let valide = true;
        if(!inputs.password) {
            handleError('password', 'Mot de passe obligatoire.');
            valide = false;
        } else {
            handleError('password', null);
        }
        if(valide) {
            setLoading(true);
            setDisable(true);
            const formData = new FormData();
            formData.append('js', null);
            formData.append('signin[account]', account);
            formData.append('signin[password]', inputs.password);
            formData.append('signin[tel]', user.tel);

            fetch(apiv3 ? api_ref + '/signin.php' : fetchUri, {
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
                // setLoading(false);
                // setDisable(false);
                if(json.success) {
                    const user = json.user;
                    if(user) {
                        setConfirm(true);
                    } else {
                        // registerScreen();
                    }
                } else {
                    const errors = json.errors;
                    console.log('Errors: ', errors);
                    for(let k in errors) {
                        handleError(k, errors[k]);
                    }
                }
            })
            .catch(error => {
                console.log(error)
                getErrorResponse(error)
            })
            .finally(() => {
                setLoading(false);
                setDisable(false);
            })
        }
    }

    return (
            <ScrollView nestedScrollEnabled={true} style={[ tw`` ]}>
                <View style={[ tw`px-10` ]}>
                    <View style={[ tw`items-center my-10` ]}>
                        <Text style={[tw`text-black uppercase`, {fontSize: 45, fontFamily: Platform.OS == 'android' ? 'ShadowsIntoLight-Regular' : 'PatrickHand-Regular'}]}>waa<Text style={{color: ColorsEncr.main}}>taxi</Text></Text>
                    </View>
                    <Text style={[ tw`text-center px-5 text-black font-normal text-base mb-5`, {fontFamily: polices.times_new_roman} ]}>Veuillez confirmer votre mot de passe.</Text>
                    
                    <View style={[ tw`bg-white px-3` ]}>
    
                        <InputForm
                            containerStyle={[ tw`mb-10 mt-2` ]}
                            placeholder='Entrez votre mot de passe'
                            value={inputs.password}
                            error={errors.password}
                            onChangeText={(text: any) => handleOnChange('password', text)}
                            password
                            inputContainerStyle={[{ height: 40, borderBottomWidth: 1, borderBottomColor: ColorsEncr.main_sm }]}
                            inputStyle={[ tw`py-0` ]}
                        />

                        <Button
                            onPress={auth}
                            loading={loading}
                            disabled={disable}
                            color={ColorsEncr.main}
                            mode='contained'
                            contentStyle={[tw`p-2`]}
                            style={tw``}
                            labelStyle={{ fontFamily: polices.times_new_roman }}
                        >Valider</Button>

                    </View>
                </View>

            </ScrollView>
    )
}

const styles = StyleSheet.create({
    borderStyleBase: {
        width: 30,
        height: 45
    },

    borderStyleHighLighted: {
        borderColor: "#03DAC6",
    },

    underlineStyleBase: {
        width: 30,
        height: 45,
        borderWidth: 0,
        borderBottomWidth: 1,
        color: ColorsEncr.main_sm
    },

    underlineStyleHighLighted: {
        // borderColor: "#03DAC6",
        borderColor: ColorsEncr.main_sm,
    },
});

export default AuthView;