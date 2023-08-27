import React, { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, FlatList, Image, Pressable, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import Base from '../../../components/Base';
import Header, { HeaderTitle } from '../../../components/Header';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import { Icon } from '@rneui/base';
import SearchBar from '../../../components/SearchBar';
import { useDispatch, useSelector } from 'react-redux';
import { baseUri, fetchUri, getCurrency } from '../../../functions/functions';
import { ActivityLoading } from '../../../components/ActivityLoading';
import BottomButton from '../../../components/BottomButton';
import { WtCar1 } from '../../../assets';
import RenderItemCourseInstantane from '../../../components/RenderItemCourseInstantane';
import { setStopped } from '../../../feature/init.slice';
import { setStoreReservation } from '../../../feature/courses.slice';
import { RNSpinner } from '../../../components/RNSpinner';

const timer = require('react-native-timer')

const Body: React.FC<{spinner?: boolean, refreshing: boolean, onRefresh: ()=>void, endFetch: boolean, reservations: Array<any>, reservationEmptyText: string, renderItem: any, refList: any}> = ({spinner, refreshing, onRefresh, endFetch, reservations, reservationEmptyText, renderItem, refList}) => {
    const disponibilite = useSelector((state: any) => state.init.disponibilite);

    return (
        <>
            {!disponibilite && (
                <Text style={tw`text-center mb-4 text-red-600 font-bold underline px-3`}>Vous êtes hors service</Text>
            )}
            <FlatList
                refreshControl={
                    <RefreshControl
                        colors={['red', 'blue', 'green']}
                        refreshing={refreshing} 
                        onRefresh={onRefresh} />
                }
                ListHeaderComponent={spinner?<RNSpinner visible={!endFetch} />:undefined}
                removeClippedSubviews={true}
                initialNumToRender={reservations.length - 1}
                keyboardDismissMode='none'
                ListEmptyComponent={ 
                    <View>
                        <Text style={tw`text-gray-400`}>{ reservationEmptyText }</Text>
                    </View>
                }
                data={reservations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                ref={refList}
                contentContainerStyle={[ tw`px-4 pt-2 pb-10` ]}
            />
        </>
    )
}

interface ReservationsViewProps {
    navigation: any
}
const ReservationsView: React.FC<ReservationsViewProps> = ({ navigation }) => {

    const dispatch = useDispatch();

    const courses_reservations = useSelector((state: any) => state.courses.reservation);

    const user = useSelector((state: any) => state.user.data);

    const disponibilite = useSelector((state: any) => state.init.disponibilite);

    const reload = useSelector((state: any) => state.reload.value);
    const refresh = useSelector((state: any) => state.refresh.historique_reservations);

    const refList = useRef(null);

    const [visible, setVisible] = useState(false);
    const [reservations, setReservations] = useState<any>([...courses_reservations]);
    const [masterReservations, setMasterReservations] = useState<any>([...courses_reservations]);
    const [reservationEmptyText, setReservationEmptyText] = useState('Aucune réservation disponible dans votre historique');
    const [searchItem, setSearchItem] = useState('');
    const [endFetch, setEndFetch] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const [loading, setLoading] = useState(false);

    const getReservations = () => {
        if(!visible) {
            const formData = new FormData();
            formData.append('js', null);
            formData.append('token', user.slug);
            formData.append('reservations-course', null);
            fetch(fetchUri, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(async json => {
                setRefreshing(false);
                if(json.success) {
                    const newData = await json.reservations.filter(function (item: any) {
                        return item.conducteur ||  (!item.conducteur && disponibilite);
                        //  !(!item.conducteur && !disponibilite)
                    });
                    await setReservations([...newData]);
                    await setMasterReservations([...newData]);

                    dispatch(setStoreReservation([...newData]))
                } else {
                    const errors = json.errors;
                    console.log(errors);
                }
            })
            .catch(error => console.log(error))
            .finally(() => {
                setEndFetch(true);
            })
        }
    }

    const filterItemFunction = (text: string) => {
        // Check if searched text is not blank
        if (text) {
            setLoading(true)
            // Inserted text is not blank
            // Filter the masterDataSource and update FilteredDataSource
            const newData = masterReservations.filter(function (item: any) {
                // Applying filter for the inserted text in search bar
                // @ts-ignore
                const ctext = `${item.adresse_depart} ${item.adresse_arrive}`;
                const itemData = ctext.trim()
                                ? ctext.toUpperCase()
                                : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            setReservationEmptyText('Aucun résultat trouvé');
            setReservations(newData);
            setSearchItem(text);
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with masterDataSource
            setReservations(masterReservations);
            setSearchItem(text);
            setReservationEmptyText('Aucune discussion');
            setLoading(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        getReservations();
    }

    // @ts-ignore
    const renderItem = ({item, index}) => {
        return (
            <RenderItemCourseInstantane key={index.toString()} reservation navigation={navigation} routeName='DashDetailsReservation' item={item} />
        )      
    }

    const openTimer = () => {
        timer.setInterval('historique-reservations', getReservations, 5000)
    }
    const clearTimer = () => {
        if(timer.intervalExists('historique-reservations')) timer.clearInterval('historique-reservations')
    }
    const event1 = DeviceEventEmitter.addListener("event.reservations.opentimer", (eventData) => {
        openTimer();
    });
    const event2 = DeviceEventEmitter.addListener("event.reservations.cleartimer", (eventData) => {
        clearTimer();
    });

    const event3 = DeviceEventEmitter.addListener("event.cleartimer", (eventData) => {
        clearInterval(timer);
    });

    useEffect(() => {
        return () => {
            event1.remove()
            event2.remove()
            event3.remove()
        }
    }, [])

    useEffect(() => {
        openTimer();
        return () => {
            clearTimer();
        }
    }, [visible])

    useEffect(() => {
        getReservations();
    }, [refresh])

    useEffect(()=>{
        dispatch(setStopped(true))
        return () => {
            dispatch(setStopped(false))
        }
    }, [])
    
    return (
        <Base>
            <Header 
                navigation={navigation} 
                headerTitle='Réservations'
                contentLeft={
                    visible
                    ?
                        <Pressable onPress={() => setVisible(false)}>
                            <Icon
                                type='ant-design'
                                name='arrowleft'
                                size={30} />
                        </Pressable>
                    :
                        undefined
                } 
                content={
                    visible
                    ?
                        <SearchBar 
                            iconSearchColor='grey'
                            iconSearchSize={20}
                            loadingColor='grey'
                            containerStyle={[ tw`flex-1 px-3 rounded-lg border-0 bg-gray-200` ]}
                            inputContainerStyle={tw`border-b-0`}
                            placeholder='Rechercher'
                            value={searchItem}
                            showLoading={loading}
                            onChangeText={filterItemFunction}
                            onEndEditing={() => setLoading(false)}
                        />
                    :
                        <View style={tw`flex-1 flex-row items-center justify-between`}>
                            <HeaderTitle headerTitle='Réservations' />
                            <Pressable onPress={() => setVisible(true)}>
                                <Icon type="ant-design" name="search1" />
                            </Pressable>
                        </View>
                }
            />

            {courses_reservations.length != 0
                ?
                    <Body spinner refreshing={refreshing} onRefresh={onRefresh} endFetch={endFetch} reservations={reservations} reservationEmptyText={reservationEmptyText} renderItem={renderItem} refList={refList} />
                : endFetch
                    ?
                        <Body refreshing={refreshing} onRefresh={onRefresh} endFetch={endFetch} reservations={reservations} reservationEmptyText={reservationEmptyText} renderItem={renderItem} refList={refList} />
                    : 
                        <ActivityLoading />
            }
        </Base>
    )

}

export default ReservationsView;