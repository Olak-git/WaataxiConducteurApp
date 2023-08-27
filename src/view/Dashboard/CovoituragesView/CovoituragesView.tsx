import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
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
import RenderItemCourseCovoiturage from '../../../components/RenderItemCourseCovoiturage';
import { setStopped } from '../../../feature/init.slice';
import { setStoreCovoiturage } from '../../../feature/courses.slice';
import { RNSpinner } from '../../../components/RNSpinner';
import { useNavigation } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';


const Body: React.FC<{spinner?: boolean, refreshing: boolean, onRefresh: ()=>void, endFetch: boolean, covoiturages: Array<any>, covoiturageEmptyText: string, renderItem: any, refList: any}> = ({spinner, refreshing, onRefresh, endFetch, covoiturages, covoiturageEmptyText, renderItem, refList}) => {
    const navigation = useNavigation();

    return (
        <>
            <FlatList
                refreshControl={
                    <RefreshControl
                        colors={['red', 'blue', 'green']}
                        refreshing={refreshing} 
                        onRefresh={onRefresh} />
                }
                ListHeaderComponent={spinner?<RNSpinner visible={!endFetch} />:undefined}
                removeClippedSubviews={true}
                initialNumToRender={covoiturages.length - 1}
                keyboardDismissMode='none'
                ListEmptyComponent={ 
                    <View>
                        <Text style={tw`text-gray-400`}>{ covoiturageEmptyText }</Text>
                    </View>
                }
                data={covoiturages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                ref={refList}
                contentContainerStyle={[ tw`px-4 pt-2 pb-10` ]}
            />
            
            {/* {course.nb_place_restante > 0 && ( */}
                <BottomButton reverse title='Programmer un nouveau voyage' navigation={navigation} route='DashCreateLocationCovoiturage' titleStyle={{ fontFamily: 'MontserratAlternates-SemiBold' }} />
            {/* )} */}
        </>
    )
}

interface CovoituragesViewProps {
    navigation: any
}
const CovoituragesView: React.FC<CovoituragesViewProps> = ({ navigation }) => {

    const dispatch = useDispatch();

    const courses_covoiturages = useSelector((state: any) => state.courses.covoiturage);

    const user = useSelector((state: any) => state.user.data);

    // const reload = useSelector((state: any) => state.reload.value);
    const refresh = useSelector((state: any) => state.refresh.historique_covoiturages);

    const refList = useRef(null);

    const [visible, setVisible] = useState(false);
    const [covoiturages, setCovoiturages] = useState<any>([...courses_covoiturages]);
    const [masterCovoiturages, setMasterCovoiturages] = useState<any>([...courses_covoiturages]);
    const [covoiturageEmptyText, setCovoiturageEmptyText] = useState('Aucune course disponible dans votre historique');
    const [searchItem, setSearchItem] = useState('');
    const [endFetch, setEndFetch] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const [loading, setLoading] = useState(false);

    const getCovoiturages = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('covoiturages', null);
        formData.append('token', user.slug);
        console.log(formData)
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
                const _courses = [...json.covoiturages]
                let newCourses = [];
                if(json.use_filter) {
                    newCourses = _courses.filter(function (item: any) {
                        return item.etat_course != -1
                    });
                } else {
                    newCourses = [..._courses];
                }
                await setMasterCovoiturages([...newCourses]);
                await setCovoiturages([...newCourses]);

                dispatch(setStoreCovoiturage([...newCourses]))

                setEndFetch(true);
            } else {
                const errors = json.errors;
                console.log(errors);
            }
        })
        .catch(error => console.log(error))
    }

    const filterItemFunction = (text: string) => {
        // Check if searched text is not blank
        if (text) {
            setLoading(true)
            // Inserted text is not blank
            // Filter the masterDataSource and update FilteredDataSource
            const newData = masterCovoiturages.filter(function (item: any) {
                // Applying filter for the inserted text in search bar
                // @ts-ignore
                const ctext = `${item.adresse_depart} ${item.adresse_arrive}`;
                const itemData = ctext.trim()
                                ? ctext.toUpperCase()
                                : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            setCovoiturageEmptyText('Aucun résultat trouvé');
            setCovoiturages(newData);
            setSearchItem(text);
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with masterDataSource
            setCovoiturages(masterCovoiturages);
            setSearchItem(text);
            setCovoiturageEmptyText('Aucune discussion');
            setLoading(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        getCovoiturages();
    }

    // @ts-ignore
    const renderItem = ({item, index}) => {
        return (
            <RenderItemCourseCovoiturage key={index.toString()} navigation={navigation} item={item} />
        )
    }

    useEffect(() => {
        getCovoiturages();
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
                headerTitle='Covoiturages'
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
                            <HeaderTitle headerTitle='Covoiturages' />
                            <Pressable onPress={() => setVisible(true)}>
                                <Icon type="ant-design" name="search1" />
                            </Pressable>
                        </View>
                }
            />

            {courses_covoiturages.length != 0
                ?
                    <Body spinner refreshing={refreshing} onRefresh={onRefresh} endFetch={endFetch} covoiturages={covoiturages} covoiturageEmptyText={covoiturageEmptyText} renderItem={renderItem} refList={refList} />
                : endFetch
                    ?
                        <Body refreshing={refreshing} onRefresh={onRefresh} endFetch={endFetch} covoiturages={covoiturages} covoiturageEmptyText={covoiturageEmptyText} renderItem={renderItem} refList={refList} />
                    : 
                        <ActivityLoading />
            }
        </Base>
    )

}

export default CovoituragesView;