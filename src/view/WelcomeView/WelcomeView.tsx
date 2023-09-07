import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'twrnc';
import Base from '../../components/Base';
import { ColorsEncr } from '../../assets/styles';
import { setWelcome } from '../../feature/init.slice';
import { polices } from '../../data/data';

interface WelcomeViewProps {
   navigation: any,
   route: any 
}

const WelcomeView: React.FC<WelcomeViewProps> = (props) => {

    const {navigation, route} = props;

    const dispatch = useDispatch();

    const init = useSelector((state: any) => state.init);

    const {welcome: hasGreet} = init;

    const dispatchNavigation = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {name: 'Presentation'}
                ]
            })
        )
    }

    const onHandle = async () => {
        await dispatch(setWelcome(true))
    }

    useEffect(() => {
        if(hasGreet) {
            dispatchNavigation();
        } else {
            setTimeout(() => {
                onHandle();
            }, 3000);
        }
    }, [hasGreet])

    return (
        <Base backgroundColor={ColorsEncr.main}>
            <View style={[ tw`flex-1 justify-center items-center` ]}>
                {/* <Icone width={100} height={100} /> */}
                <Image source={require('../../assets/images/icone-waa.jpg')} style={[ tw``, {width: 100, height: 100} ]} />

                {/* <Image source={require('../../assets/images/icone-wa.png')} style={[ tw``, {width: 110, height: 110} ]} /> */}

                <View style={[ tw`absolute justify-between pt-20 pb-10 left-0 top-0`, {width: '100%', height: '100%'} ]}>
                    
                    <View style={[ tw`` ]}>
                        <Text style={[ tw`text-lg uppercase text-black text-center`, {fontFamily: polices.times_new_roman} ]}>bienvenue</Text>
                        <Text style={[ tw`font-medium text-lg uppercase text-black text-center`, {fontFamily: polices.times_new_roman} ]}>sur Waataxi</Text>
                    </View>
                    
                    {/* <Text style={[ tw`font-black text-center text-black uppercase`, {fontFamily: polices.times_new_roman} ]}>V1.2.3</Text> */}
                </View>
            </View>
        </Base>
    )
}

export default WelcomeView;