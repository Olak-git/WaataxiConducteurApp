import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { ColorsEncr } from '../assets/styles';
import { baseUri, getCurrency } from '../functions/functions';
import { getLocalDate, getLocalTime, getLocalTimeStr } from '../functions/helperFunction';
import { Icon } from '@rneui/themed';
import tw from 'twrnc';
import { Avatar } from 'react-native-paper';

interface RenderItemCourseCovoiturageProps {
    item: any,
    navigation: any,
}
const RenderItemCourseCovoiturage: React.FC<RenderItemCourseCovoiturageProps> = ({item, navigation}) => {
    // const path = item.conducteur.img ? {uri: baseUri + '/assets/avatars/' + item.conducteur.img} : require('../assets/images/user-1.png');
    const path = require('../assets/images/icons8-cab-100.png');

    const [color, setColor] = useState('');
    const [etat, setEtat] = useState('');
    const _disabled = item.etat_course == -1

    const setValues = () => {
        if(item.etat_course == 0) {
            setColor('text-gray-500 italic');
            setEtat('En attente');
        } else if(item.etat_course == 1) {
            setColor('text-sky-600 font-semibold');
            setEtat('Course en cours');
        } else if(item.etat_course == 10) {
            setColor('text-blue-600 font-bold');
            setEtat('Terminée');
        } else {
            setColor('text-red-600 font-bold');
            setEtat('Annulée par WaaTaxi');
        }
    }

    useEffect(()=>{
        setValues()
    }, [item])

    return (
        <TouchableOpacity
            disabled={_disabled}
            onPress={() => navigation.navigate('DashDetailsCovoiturage', {course: item, valide: false})}
            style={[ tw`flex-row mb-3` ]}
        >
            {/* <Image source={path} style={[ tw`rounded-full`, {height: 60, width: 60} ]} /> */}
            <Avatar.Image size={60} source={path} style={{backgroundColor: '#f2f2f2'}} />
            <View style={[ tw`flex-1 flex-row items-center justify-between ml-3` ]}>
                <View style={[ tw`flex-1` ]}>
                    {/* <Text style={[ tw`text-black text-base font-medium`, {} ]} numberOfLines={1} ellipsizeMode='tail'>{ item.conducteur.nom + ' ' + item.conducteur.prenom }</Text> */}
                    <View style={[ tw`` ]}>
                        <View style={tw`flex-row mb-1`}>
                            <Icon type='font-awesome' name='circle-thin' size={15} color='gray' containerStyle={[tw``, {width: 20}]} />
                            <Text style={[ tw`flex-1 text-gray-400 text-xs`, {} ]} numberOfLines={1} ellipsizeMode='tail'>{ item.adresse_depart }</Text>
                        </View>
                        <View style={tw`flex-row`}>
                            <Icon type='material-community' name={'map-marker-outline'} size={18} color='#ff2222' containerStyle={[tw``, {width: 20}]} />
                            <Text style={[ tw`flex-1 text-gray-400 text-xs`, {} ]} numberOfLines={1} ellipsizeMode='tail'>{ item.adresse_arrive }</Text>
                        </View>
                    </View>
                    <Text style={[ tw`text-sm pl-1`, {color: ColorsEncr.main} ]} numberOfLines={1} ellipsizeMode='tail'>{getLocalDate(item.date_course)} {getLocalTimeStr(item.heure_course)}</Text>
                    <Text style={[ tw`${color} pl-1` ]} numberOfLines={1} ellipsizeMode='tail'>{etat}</Text>
                </View>
                <Text style={[ tw`font-bold text-base text-green-600 ml-3 self-start` ]}>{getCurrency(item.mnt)} F</Text>
            </View>
        </TouchableOpacity>
    )
}

export default RenderItemCourseCovoiturage;