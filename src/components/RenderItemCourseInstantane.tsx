import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { ColorsEncr } from '../assets/styles';
import { baseUri, getCurrency } from '../functions/functions';
import { getLocalDate, getLocalTime } from '../functions/helperFunction';
import { Icon } from '@rneui/themed';
import tw from 'twrnc';
import { Divider } from '@rneui/base';
import { Avatar } from 'react-native-paper';
import { polices } from '../data/data';

interface RenderItemCourseInstantaneProps {
    item: any,
    navigation: any,
    routeName: string,
    disabled?: boolean,
    onHandle?: any,
    reservation?: boolean
}

const RenderItemCourseInstantane: React.FC<RenderItemCourseInstantaneProps> = ({item, disabled, navigation, routeName, onHandle=()=>{}, reservation}) => {
    const path = item.passager.img ? {uri: baseUri + '/assets/avatars/' + item.passager.img} : require('../assets/images/user-1.png');

    const [color, setColor] = useState('');
    const [etat, setEtat] = useState('');

    const onPress = () => {
        onHandle();
        navigation.navigate(routeName, {course: item})
    }

    const setValues = () => {
        if(item.etat_course == 0) {
            setColor('text-gray-500 italic');
            setEtat('En attente');
        } else if(item.etat_course == 1) {
            setColor('text-sky-600 font-semibold');
            setEtat('Validé');
        } else if(item.etat_course == 10) {
            setColor('text-blue-600 font-bold');
            setEtat('En cours');
        } else {
            setColor('text-emerald-700 font-black');
            setEtat('Terminée');
        }
    }

    useEffect(()=>{
        setValues()
    }, [item])

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[ tw`flex-row mb-3` ]}>
            <View style={[ tw`flex-1 flex-row` ]}>
                {/* <Image source={path} style={[ tw`rounded-full`, {height: 60, width: 60} ]} /> */}
                <Avatar.Image size={60} source={path} style={{backgroundColor: '#f2f2f2'}} />
                <View style={[ tw`flex-1 flex-row items-start justify-between ml-3` ]}>
                    <View style={[ tw`flex-1 border border-white` ]}>
                        <Text style={[ tw`text-black text-base font-medium`, {fontFamily:'Itim-Regular'}, {fontFamily: polices.times_new_roman} ]} numberOfLines={1} ellipsizeMode='tail'>{ item.passager.nom + ' ' + item.passager.prenom }</Text>
                        <View style={[ tw`` ]}>
                            <View style={tw`flex-row mb-1`}>
                                <Icon type='font-awesome' name='circle-thin' size={15} color='gray' containerStyle={[tw``, {width: 20}]} />
                                <Text style={[ tw`flex-1 text-gray-400 text-xs`, {fontFamily: polices.times_new_roman} ]} numberOfLines={1} ellipsizeMode='tail'>{ item.adresse_depart }</Text>
                            </View>
                            <View style={tw`flex-row`}>
                                <Icon type='material-community' name={'map-marker-outline'} size={18} color='#ff2222' containerStyle={[tw``, {width: 20}]} />
                                <Text style={[ tw`flex-1 text-gray-400 text-xs`, {fontFamily: polices.times_new_roman} ]} numberOfLines={1} ellipsizeMode='tail'>{ item.adresse_arrive }</Text>
                            </View>
                        </View>
                        <Text style={[ tw`text-sm pl-1`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman} ]} numberOfLines={1} ellipsizeMode='tail'>{reservation?getLocalDate(item.date_depart):getLocalDate(item.dat)} {reservation?item.heure_depart.slice(0, 5):getLocalTime(item.dat)}</Text>
                        <Text style={[ tw`text-sm pl-1 ${color}`, {fontFamily: polices.times_new_roman} ]} numberOfLines={1} ellipsizeMode='tail'>{etat}</Text>
                    </View>
                    <View style={[ tw`ml-3` ]}>
                        <Text style={[ tw`font-medium text-base text-gray-400`, {fontFamily: polices.times_new_roman} ]}>{ getCurrency(item.prix) } F</Text>
                        {disabled && (
                            <Icon type="material-community" name="key-chain" />
                        )}
                    </View>
                </View>
            </View>
            {disabled && (
                <View style={[ tw`mt-2` ]}>
                    <Divider />
                    <Text style={[ tw`my-2 text-red-600 text-xs`, {fontFamily: polices.times_new_roman} ]}>Votre solde est insuffisant pour accepter cette course. Veuillez recharger votre portefeuille.</Text>
                    <Divider />
                </View>
            )}
        </TouchableOpacity>
    )
}

export default RenderItemCourseInstantane;

