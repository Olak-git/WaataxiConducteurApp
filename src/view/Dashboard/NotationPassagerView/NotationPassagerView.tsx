import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Base from '../../../components/Base';
import Header from '../../../components/Header';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import { Divider, Icon } from '@rneui/base';
import InputForm from '../../../components/InputForm';
import TextareaForm from '../../../components/TextareaForm';
import { Rating } from 'react-native-ratings';
import { useDispatch, useSelector } from 'react-redux';
import { baseUri, fetchUri } from '../../../functions/functions';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import { ActivityLoading } from '../../../components/ActivityLoading';
import { setReload } from '../../../feature/reload.slice';
import { RNPModal } from '../../../components/RNPModal';
import { ImageSource } from 'react-native-vector-icons/Icon';
import ImageView from 'react-native-image-viewing';
import { polices } from '../../../data/data';

const SectionData: React.FC<{
    iconType?: string,
    iconName: string,
    iconSize?: number,
    text: string
}> = ({iconType = 'font-awesome-5', iconName, iconSize = 20, text}) => {
    return (
        <View style={tw`flex-row mb-3 pb-2 border-b border-gray-200`}>
            <Icon type={iconType} name={iconName} size={iconSize} />
            <Text style={[tw`text-black ml-2`, {fontFamily: polices.times_new_roman}]}>{text}</Text>
        </View>  
    )
}

interface NotationPassagerViewProps {
    navigation: any,
    route?: any
}
const NotationPassagerView: React.FC<NotationPassagerViewProps> = ({ navigation, route }) => {

    const user = useSelector((state: any) => state.user.data);

    const { passager } = route.params;
    const src = passager.img ? {uri: baseUri + '/assets/avatars/' + passager.img} : require('../../../assets/images/user-1.png');

    const [incr, setIncr] = useState(0);
    const [visible, setVisible] = useState(false);
    const [show, setShow] = useState(false);
    const [rating, setRating] = useState({
        total: 0,
        unit: 0
    });
    const reload = useSelector((state: any) => state.reload.value);
    const [endFetch, setEndFetch] = useState(false);

    const [visiblePaperModal, setVisiblePaperModal] = useState(false);

    const showModal = () => setVisiblePaperModal(true);
    const hideModal = () => setVisiblePaperModal(false);

    const ratingCompleted = (rate: number) => {
        setRating((state) => ({...state, unit: rate}));
        // console.log("Rating is: " + rate)
    }

    const onHandle = () => {
        setShow(true);
        const formData = new FormData();
        formData.append('js', null);
        formData.append('rating', null);
        formData.append('account', 'conducteur');
        formData.append('token', user.slug);
        formData.append('to', passager.slug);
        formData.append('score', rating.unit);
        fetch(fetchUri, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(json => {
            setShow(false);
            if(json.success) {
                setVisible(false);
                let v = incr + 1;
                setIncr(v);
            } else {
                const errors = json.errors;
                console.log(errors);
            }
        })
        .catch(error => {
            setShow(false);
            console.log(error);
        })
    }

    const getDataUser = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('data-user', passager.slug);
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
            console.log('Yooki: ', passager)
            if(json.success) {
                setRating(state => ({...state, total: json.scores, unit: json.score}));
            } else {
                const errors = json.errors;
                console.log(errors);
            }
            setEndFetch(true);
        })
        .catch(error => {
            console.log('Error: ', error)
            console.log(error);
        })
    }

    useEffect(() => {
        getDataUser();
    }, [incr])
    
    return (
        <Base>
            <ModalValidationForm showModal={show} />
            <ImageView 
                images={[src]} 
                imageIndex={0} 
                visible={visiblePaperModal}
                animationType='slide'
                // presentationStyle='fullScreen'
                doubleTapToZoomEnabled
                onRequestClose={function (): void {
                    hideModal()
                    // throw new Error('Function not implemented.');
                }}
                keyExtractor={(imageSrc: ImageSource, index: number) => index.toString()}
            />
            {/* <RNPModal showModal={visiblePaperModal} onClose={hideModal}>
                <View style={[tw`rounded-lg p-3 bg-white`, {width: 300, height: 400}]}>
                <Image
                    resizeMode='stretch'
                    source={src}
                    style={[tw``, {height: '100%', width: '100%'}]} />
                </View>
            </RNPModal> */}
            
            <Header navigation={navigation} headerTitle='' />

            {endFetch
            ?
                <>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={[ tw`mt-5 mb-3 px-10 flex-row` ]}>
                        
                        <View style={tw`items-center`}>
                            <Pressable
                                    onPress={showModal}
                                    style={[tw`rounded-full mb-2`]}
                                    disabled={passager.img ? false : true}
                                >
                                <Image
                                    source={src}
                                    style={[tw`rounded-full`, {height: 100, width: 100}]} />
                            </Pressable>
                            <Rating
                                readonly
                                startingValue={rating.total}
                                ratingCount={5}
                                imageSize={18}
                                ratingColor={ColorsEncr.main}
                            />
                        </View>

                        <View style={[tw`flex-1 ml-3 border-gray-300 pl-3`, {borderLeftWidth: 0.5}]}>
                            <SectionData iconName='mobile-alt' text={passager.tel} />
                            <SectionData iconType='font-awesome' iconName='user-o' text={passager.nom + ' ' + passager.prenom} />
                            <SectionData iconType='entypo' iconName='email' text={passager.email} />
                            <SectionData iconName='globe-africa' text={passager.pays} />
                        </View>

                    </View>

                    <View style={tw`items-center`}>
                        <Rating
                            startingValue={rating.unit}
                            ratingCount={5}
                            jumpValue={.5}
                            imageSize={30}
                            ratingColor={ColorsEncr.main}
                            onFinishRating={ratingCompleted}
                            style={[tw`border border-slate-300 rounded-full py-3 px-10`]}
                        />
                    </View>

                    <View style={tw`px-10 mt-10`}>
                        <Pressable
                            onPress={onHandle}
                            style={[tw`rounded-lg border border-orange-600 py-2 px-3`, {borderColor: ColorsEncr.main, minWidth: 100}]}>
                            <Text style={[tw`text-center text-lg`, {color: ColorsEncr.main, fontFamily: polices.times_new_roman}]}>VALIDER</Text>
                        </Pressable>
                    </View>

                </ScrollView>
                </>
            :
                <ActivityLoading />
            }
        </Base>
    )

}

export default NotationPassagerView;