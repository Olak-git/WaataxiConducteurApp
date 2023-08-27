import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Base from '../../../components/Base';
import Header from '../../../components/Header';
import tw from 'twrnc';
import { useDispatch, useSelector } from 'react-redux';
// @ts-ignore
import io from 'socket.io-client/dist/socket.io';
import { Button } from 'react-native-paper';
import { ActivityLoading } from '../../../components/ActivityLoading';

const SOCKET_URL = 'http://192.168.8.103:3000';
// const SOCKET_URL = 'https://www.server-socket.app.waataxi.com:3000';

// window.navigator.userAgent = 'react-native';

interface SocketViewProps {
    navigation: any
}
const SocketView: React.FC<SocketViewProps> = ({ navigation }) => {

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user.data);

    const reload = useSelector((state: any) => state.reload.value);

    const [connected, setConnected] = useState(false);

    // @ts-ignore
    const socket = io.connect(SOCKET_URL, {
        transports: ["polling", "websocket"],
        reconnectionAttempts: 15, //Nombre de fois qu'il doit réessayer de se connecter,
        connected: true
    });

    // const socket = io(SOCKET_URL, {
    //     transports: ["websocket", "polling"],
    //     // timeout: 10000
    // });

    // react native socket.io how to connect to local node server from device

    const onConnectSocket = () => {
        //Vérification si socket n'est pas à null
        if(socket) {
            // console.log(socket);
            //Ecoute de l'évènement
            socket.on('connect', () => {
                console.log('Socket-ID: ', socket.id);
                socket.emit('counter'); // Emission d'un message
        
                //Modification du status de connexion
                setConnected(true)
            });

            socket.on('connect_error', (reason: any) => {
                console.log('Error: ', reason);
                socket.connect();
            })

            socket.on("disconnect", (reason: any) => {
                if (reason === "io server disconnect") {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    socket.connect();
                }
            });

            socket.on('counter', (message: any) => {
                console.log(message);
            })

            socket.on('position', (message: any) => {
                const ml = JSON.parse(message)
                if(Object.keys(message).length > 0) {
                    console.log(ml);
                }
            })

            // socket.on('user connected', function () {
            //     console.log("A new user has connected!")
            //     setConnected(true)
            // });
        }
    }

    useEffect(() => {
        onConnectSocket();
    }, [])

    return (
        <Base>
            <Header navigation={navigation} headerTitle='Bilan' />
            <Button onPress={() => {
                        if(connected) {
                            socket.emit('position', JSON.stringify({x: 0.1245, y: -1.65655}))
                        }
            }}>Appuyer</Button>
        </Base>
    )
}

export default SocketView;