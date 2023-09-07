import React, { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter, FlatList, Image, Pressable, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import Base from '../../../components/Base';
import Header, { HeaderTitle } from '../../../components/Header';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
import { baseUri, fetchUri, getCurrency } from '../../../functions/functions';
import { Icon } from '@rneui/themed';
import SearchBar from '../../../components/SearchBar';
import { ActivityLoading } from '../../../components/ActivityLoading';
import RenderItemCourseInstantane from '../../../components/RenderItemCourseInstantane';
import { setStopped } from '../../../feature/init.slice';
import { RNSpinner } from '../../../components/RNSpinner';
import { clearStoreCourses, setCourseConfiguration, setStoreCourseInstantanee } from '../../../feature/courses.slice';
import { polices } from '../../../data/data';
import { characters_exists } from '../../../functions/helperFunction';

const timer = require('react-native-timer');

const Body: React.FC<{spinner?: boolean, courses: Array<any>, endFetch: boolean, refreshing: boolean, onRefresh: ()=>void, courseEmptyText: string, renderItem: any, setRefList: (a:any)=>void}> = ({spinner, courses, endFetch, refreshing, onRefresh, courseEmptyText, renderItem, setRefList}) => {
    const disponibilite = useSelector((state: any) => state.init.disponibilite);

    return (
        <>
            {!disponibilite && (
                <Text style={[tw`text-center mb-4 text-red-600 font-bold underline px-3`, {fontFamily: polices.times_new_roman}]}>Vous êtes hors service</Text>
            )}
            <FlatList 
                removeClippedSubviews={true}
                initialNumToRender={courses.length - 1}
                keyboardDismissMode='none'
                ListHeaderComponent={spinner?<RNSpinner visible={!endFetch} />:undefined}
                refreshControl={
                    <RefreshControl
                        colors={['red', 'blue', 'green']}
                        refreshing={refreshing} 
                        onRefresh={onRefresh} />
                }
                ListEmptyComponent={ 
                    <View>
                        <Text style={[tw`text-gray-400`, {fontFamily: polices.times_new_roman}]}>{courseEmptyText}</Text>
                    </View>
                }
                data={courses}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                ref={(ref) => {
                    // @ts-ignore
                    setRefList(ref)
                }}
                contentContainerStyle={[ tw`px-4 pt-2` ]}
            />
        </>
    )
}
interface CoursesDisposViewProps {
    navigation: any
}
const CoursesDisposView: React.FC<CoursesDisposViewProps> = ({ navigation }) => {

    const courses_instantanees = useSelector((state: any) => state.courses.instantanee);
    const courses_configuration = useSelector((state: any) => state.courses.configuration);

    const user = useSelector((state: any) => state.user.data);

    const dispatch = useDispatch();

    const disponibilite = useSelector((state: any) => state.init.disponibilite);

    // const reload = useSelector((state: any) => state.reload.value);
    const refresh = useSelector((state: any) => state.refresh.historique_courses);

    const [refList, setRefList] = useState(null);

    const [visible, setVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [courseEmptyText, setCourseEmptyText] = useState('Aucune course disponible pour le moment.');
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [endFetch, setEndFetch] = useState(false);

    const [masterCourses, setMasterCourses] = useState<any>([...courses_instantanees]);
    const [courses, setCourses] = useState<any>([...courses_instantanees]);
    const [configuration, setConfiguration] = useState<any>(courses_configuration);

    const getCourses = () => {
        if(!visible) {
            // console.log('Holla Refresh');
            const formData = new FormData();
            formData.append('js', null);
            formData.append('token', user.slug);
            formData.append('courses-dispo', null);

            // console.log('formData: ', formData)

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
                    // console.log('Courses: ', json.courses, ', length: ', json.courses.length)
                    const newData = await json.courses.filter(function (item: any) {
                        return item.conducteur || (!item.conducteur && disponibilite);
                        //  !(!item.conducteur && !disponibilite)
                    });
                    // console.log('newData: ', newData)
                    await setCourses([...newData]);
                    await setMasterCourses([...newData]);
                    await setConfiguration(json.configuration);

                    dispatch(setStoreCourseInstantanee([...newData]))
                    dispatch(setCourseConfiguration(json.configuration))

                    setEndFetch(true);
                } else {
                    const errors = json.errors;
                    console.log(errors);
                }
            })
            .catch(error => {
                console.log(error)
                setRefreshing(false);
            })
        } else {
            console.log('Rater');
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        getCourses();
    }

    const filter = (text: string) => {
        // Check if searched text is not blank
        if (text) {
            setLoading(true)
            // Inserted text is not blank
            // Filter the masterDataSource and update FilteredDataSource
            const newData = masterCourses.filter(function (item: any) {
                // Applying filter for the inserted text in search bar
                // @ts-ignore
                const ctext = `${item.passager.nom} ${item.passager.prenom} ${item.adresse_depart} ${item.adresse_arrive}`;
                const itemData = ctext.trim()
                                ? ctext.toUpperCase()
                                : ''.toUpperCase();
                const textData = text.toUpperCase();
                
                return characters_exists(textData, itemData)
                // return itemData.indexOf(textData) > -1;
            });
            setCourseEmptyText(`Aucun résultat trouvé pour "${text}"`);
            setCourses(newData);
            setSearch(text);
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with masterDataSource
            setCourseEmptyText('Aucune course disponible pour le moment.');
            setCourses(masterCourses);
            setSearch('');
            setLoading(false);
        }
    }

    // @ts-ignore
    const renderItem = ({item, index}) => {
        let disabled = false;
        let mnt = (configuration.commission_course * item.prix) / 100;
        if(parseFloat(user.portefeuille) < mnt) {
            disabled = true;
        }
        return (
            <RenderItemCourseInstantane key={index.toString()} disabled={disabled} navigation={navigation} routeName='DashDetailsCourse' item={item} />
        )
    }

    const openTimer = () => {
        timer.setInterval('refresh-courses-i', getCourses, 5000)
    }
    const clearTimer = () => {
        if(timer.intervalExists('refresh-courses-i')) timer.clearInterval('refresh-courses-i')
    }
    const event1 = DeviceEventEmitter.addListener("event.historiquecoursesinstantanees.opentimer", (eventData) => {
        openTimer();
    });
    const event2 = DeviceEventEmitter.addListener("event.historiquecoursesinstantanees.cleartimer", (eventData) => {
        clearTimer();
    });

    const event3 = DeviceEventEmitter.addListener("event.cleartimer", (eventData) => {
        clearInterval(timer);
    });

    useEffect(() => {
        // DeviceEventEmitter.emit("event.home.cleartimer")

        return () => {
            // DeviceEventEmitter.emit("event.home.opentimer")

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
        getCourses();
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
                headerTitle='Courses Disponibles'
                contentLeft={
                    visible
                    ?
                        <Pressable onPress={() => {
                            setVisible(false)
                            setSearch('');
                        }}>
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
                            value={search}
                            showLoading={loading}
                            onChangeText={filter}
                            onEndEditing={() => setLoading(false)}
                        />
                    :
                        <View style={tw`flex-1 flex-row items-center justify-between`}>
                            <HeaderTitle headerTitle='Courses Disponibles' />
                            <Pressable onPress={() => setVisible(true)}>
                                <Icon type="ant-design" name="search1" />
                            </Pressable>
                        </View>
                }
            />

            {courses_instantanees.length != 0 && courses_configuration != null
                ?
                    <Body spinner refreshing={refreshing} onRefresh={onRefresh} endFetch={endFetch} courses={courses} courseEmptyText={courseEmptyText} renderItem={renderItem} setRefList={setRefList} />
                : endFetch
                    ?
                        <Body refreshing={refreshing} onRefresh={onRefresh} endFetch={endFetch} courses={courses} courseEmptyText={courseEmptyText} renderItem={renderItem} setRefList={setRefList} />
                    : 
                        <ActivityLoading />
            }
        </Base>
    )

}

export default CoursesDisposView;