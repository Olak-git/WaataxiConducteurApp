import { Icon } from '@rneui/base';
import { Badge } from 'react-native-paper'
import React from 'react';
import { TouchableOpacity, View, Text, StyleProp, ViewStyle } from 'react-native';
import { ColorsEncr } from '../../../../assets/styles';
import tw from 'twrnc';
import { polices } from '../../../../data/data';

interface ButtonMenuProps {
    navigation?: any,
    route?: string,
    iconName: string,
    caption: string,
    containerStyle?: StyleProp<ViewStyle>,
    disabled?: boolean,
    badge?: boolean,
    count_new_courses?: number
}
const ButtonMenu: React.FC<ButtonMenuProps> = ({ navigation, route, iconName, caption, containerStyle, disabled, badge, count_new_courses }) => {
    return (
        <TouchableOpacity
            onPress={() => navigation?.navigate(route)}
            disabled={disabled}
            style={[ tw`relative flex-1 justify-center items-center ${disabled ? 'bg-gray-100' : 'bg-orange-100'} py-5 px-3`, {height: '100%'}, containerStyle ]}>
            <View style={[ tw`` ]}>
                <Icon
                    type='font-awesome-5'
                    name={iconName}
                    color={disabled ? 'grey' : ColorsEncr.main}
                    size={60} 
                />
                {badge && (
                    <Badge style={[tw`absolute`]}>{count_new_courses}</Badge>
                )}
                <Text style={[ tw`text-center text-black mt-2 text-lg`, {fontFamily: 'YanoneKaffeesatz-Regular'}, {fontFamily: polices.times_new_roman} ]}>{ caption }</Text>
            </View>
            {/* <Badge style={[tw`absolute`, {top: -5, right: -5}]}>4</Badge> */}
        </TouchableOpacity>
    )
}

export default ButtonMenu;