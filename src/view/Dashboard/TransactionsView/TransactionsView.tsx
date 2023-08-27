import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, Icon } from '@rneui/base';
import Base from '../../../components/Base';
import Header, { HeaderTitle } from '../../../components/Header';
import tw from 'twrnc';
import { ColorsEncr } from '../../../assets/styles';
import { baseUri, fetchUri, getCurrency, toast } from '../../../functions/functions';
import { Rating } from 'react-native-ratings';
import Spinner from 'react-native-spinkit';
import { getErrorsToString, getLocalTimeStr } from '../../../functions/helperFunction';
import BottomButton from '../../../components/BottomButton';
import { DataTable, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityLoading } from '../../../components/ActivityLoading';
import InputForm from '../../../components/InputForm';
import { ModalValidationForm } from '../../../components/ModalValidationForm';
import FlashMessage from '../../../components/FlashMessage';
import { setReload } from '../../../feature/reload.slice';
import SearchBar from '../../../components/SearchBar';

interface RowProps {
    iconType: string,
    iconName: string,
    iconSize?: number,
    textStyle?: any,
    text: string,
    _text?: React.ReactElement
}
const Row: React.FC<RowProps> = ({ iconType, iconName, iconSize = 30, textStyle = [], text, _text }) => {
    return (
        <View style={[ tw`flex-row items-center mb-3` ]}>
            <View style={[ tw``, {width: 50} ]}>
                <Icon
                    type={iconType}
                    name={iconName}
                    color='#666'
                    size={iconSize} />
            </View>
            <Text style={[ tw`text-gray-600 font-semibold text-lg mx-2` ]}>:</Text>
            <View style={[ tw`flex-1` ]}>
                <Text style={[ tw`text-black font-medium text-lg`, ...textStyle ]}>{ text }{_text}</Text>
            </View>
        </View>
    )
}

interface TransactionsViewProps {
    navigation: any
}
const TransactionsView: React.FC<TransactionsViewProps> = ({navigation}) => {

    const dispatch = useDispatch();

    const [transactions, setTransactions] = useState<any>([]);
    const [master, setMaster] = useState<any>([]);
    const [emptyText, setEmptyText] = useState('Aucune transaction effectuée');
    const [searchItem, setSearchItem] = useState('');
    const [loading, setLoading] = useState(false);

    const user = useSelector((state: any) => state.user.data);

    const reload = useSelector((state: any) => state.reload.value);

    const [endFetch, setEndFetch] = useState(false);

    const [refresh, setRefresh] = useState(false);

    const [visible, setVisible] = useState(false);

    const getTransactions = () => {
        const formData = new FormData();
        formData.append('js', null);
        formData.append('transactions', null);
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
            setRefresh(false);
            if(json.success) {
                console.log('Transactions: ', json.transactions);
                setTransactions([...json.transactions]);
                setMaster([...json.transactions]);
            } else {
                const errors = json.errors;
                console.log(errors);
                toast('DANGER', getErrorsToString(errors), false);
            }
            setEndFetch(true);
        })
        .catch(error => {
            setRefresh(false);
            console.log(error);
        })
    }

    const filterItem = (text: string) => {
        // Check if searched text is not blank
        if (text) {
            setLoading(true)
            // Inserted text is not blank
            // Filter the masterDataSource and update FilteredDataSource
            const newData = master.filter(function (item: any) {
                // Applying filter for the inserted text in search bar
                // @ts-ignore
                const ctext = `${item.dat} ${item.montant}`;
                const itemData = ctext.trim()
                                ? ctext.toUpperCase()
                                : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            setEmptyText('Aucun résultat trouvé');
            setTransactions(newData);
            setSearchItem(text);
        } else {
            // Inserted text is blank
            // Update FilteredDataSource with masterDataSource
            setTransactions(master);
            setSearchItem(text);
            setEmptyText('Aucune discussion');
            setLoading(false);
        }
    }

    // const onCourse = (action: string) => {
    //     setVisible(state => ({...state, modal: true}));
    //     const formData = new FormData();
    //     formData.append('js', null);
    //     formData.append('upd-state-covoiturage', action);
    //     formData.append('token', user.slug);
    //     formData.append('course', course.slug);
    //     fetch(fetchUri, {
    //         method: 'POST',
    //         body: formData,
    //         headers: {
    //             'Accept': 'application/json'
    //         }
    //     })
    //     .then(response => response.json())
    //     .then(json => {
    //         setVisible(state => ({...state, modal: false}));
    //         if(json.success) {
    //             setCourse((state: any) => ({...state, ...json.course}));
    //             dispatch(setReload(''));
    //         } else {
    //             const errors = json.errors;
    //             console.log(errors);
    //         }
    //     })
    //     .catch(error => {
    //         setVisible(state => ({...state, modal: false}));
    //         console.log(error)
    //     })
    // }

    const onRefresh = () => {
        setRefresh(true);
        getTransactions();
    }

    useEffect(() => {
        getTransactions();
    }, [])

    useEffect(() => {
        // getDataUser();
    }, [reload])
    
    return (
        <Base>
            <Header
                navigation={navigation} 
                headerTitle='Transactions'
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
                            onChangeText={filterItem}
                            onEndEditing={() => setLoading(false)}
                        />
                    :
                        <View style={tw`flex-1 flex-row items-center justify-between`}>
                            <HeaderTitle headerTitle='Transactions' />
                            <Pressable onPress={() => setVisible(true)}>
                                <Icon type="ant-design" name="search1" />
                            </Pressable>
                        </View>
                }
            />
            
            <ScrollView
                refreshControl={
                    <RefreshControl
                        colors={['red', 'blue', 'green']}
                        refreshing={refresh} 
                        onRefresh={onRefresh}
                    />
                }
            >
                <Text style={tw`px-4 font-bold`}>Retrait</Text>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title>Date</DataTable.Title>
                        <DataTable.Title>Montant</DataTable.Title>
                        <DataTable.Title>Statut</DataTable.Title>
                    </DataTable.Header>
                    {endFetch
                    ?
                        transactions.length > 0
                        ?
                            transactions.map((item: any, index: number) => 
                                (
                                    <DataTable.Row key={index.toString()}
                                        // onPress={() => {
                                        //     setSelected(index);
                                        //     setDialog(true);
                                        // }}
                                    >
                                        <DataTable.Cell>{item.dat}</DataTable.Cell>
                                        <DataTable.Cell>{item.montant}</DataTable.Cell>
                                        <DataTable.Cell>{item.valide == 0 ? 'Transaction en cours' : 'Terminée'}</DataTable.Cell>
                                    </DataTable.Row>
                                )
                            )
                        :
                            <Text style={tw`text-center text-gray-400 p-2`}>{emptyText}</Text>
                    :
                        <View style={tw`p-2`}>
                            <ActivityIndicator color={'#c2c2c2'} />
                        </View>
                    }
                </DataTable>

            </ScrollView>
        </Base>
    )

}

export default TransactionsView;