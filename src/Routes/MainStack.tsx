import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import Drawer from './Drawer';
import AuthView from '../view/Auth/AuthView/AuthView';
import RegisterView from '../view/Auth/RegisterView/RegisterView';
import BilanView from '../view/Dashboard/BilanView/BilanView';
import CoursesDisposView from '../view/Dashboard/CoursesDisposView/CoursesDisposView';
import CovoituragePlusInfosView from '../view/Dashboard/CovoituragePlusInfosView/CovoituragePlusInfosView';
import CovoituragesView from '../view/Dashboard/CovoituragesView/CovoituragesView';
import DetailsCourseView from '../view/Dashboard/DetailsCourseDispoView/DetailsCourseView';
import DetailsNewCovoiturageView from '../view/Dashboard/DetailsCovoiturageView/DetailsNewCovoiturageView';
import DetailsNotificationView from '../view/Dashboard/DetailsNotificationView/DetailsNotificationView';
import DetailsReservationView from '../view/Dashboard/DetailsReservationView/DetailsReservationView';
import EditMyAccountView from '../view/Dashboard/EditMyAccountView/EditMyAccountView';
import FinitionView from '../view/Dashboard/FinitionView/FinitionView';
import FoundLocationView from '../view/Dashboard/FoundLocationView/FoundLocationView';
import HistoriqueCoursesView from '../view/Dashboard/HistoriqueCoursesView/HistoriqueCoursesView';
import ItineraireView from '../view/Dashboard/ItineraireView/ItineraireView';
import LocationCovoiturageView from '../view/Dashboard/LocationCovoiturageView/LocationCovoiturageView';
import NotationPassagerView from '../view/Dashboard/NotationPassagerView/NotationPassagerView';
import NotificationsView from '../view/Dashboard/NotificationsView/NotificationsView';
import ProfilPassagerView from '../view/Dashboard/ProfilPassagerView/ProfilPassagerView';
import ReservationsView from '../view/Dashboard/ReservationsView/ReservationsView';
import TransactionsView from '../view/Dashboard/TransactionsView/TransactionsView';
import UpdatePasswordView from '../view/Dashboard/UpdatePasswordView/UpdatePasswordView';
import UpdateTelView from '../view/Dashboard/UpdateTelView/UpdateTelView';
import PresentationView from '../view/PresentationView/PresentationView';
import WelcomeView from '../view/WelcomeView/WelcomeView';

import NetInfo from "@react-native-community/netinfo";
import ResetPasswordView from '../view/Auth/ResetPasswordView/ResetPasswordView';

const Stack = createNativeStackNavigator();

const MainStack = () => {
    const init = useSelector((state: any) => state.init);
    const { presentation, welcome } = init;
    const user = useSelector((state: any) => state.user.data);


  const [connectionStatus, setConnectionStatus] = React.useState(false);
  const [connectionType, setConnectionType] = React.useState(null);
  
   const handleNetworkChange = (state: any) => {
    setConnectionStatus(state.isConnected);
    setConnectionType(state.type);
  };

  useEffect(() => {
    const netInfoSubscription = NetInfo.addEventListener(handleNetworkChange);
    return () => {
      netInfoSubscription && netInfoSubscription();
    };
  }, []);

  useEffect(() => {
    console.log('connectionStatus: ', connectionStatus);
    console.log('connectionType: ', connectionType);
  }, [connectionStatus, connectionType])

    return (
        <Stack.Navigator 
            initialRouteName={ 'Welcome' }
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}>

            {!welcome && (
                <Stack.Group>
                    <Stack.Screen name='Welcome' component={WelcomeView} />
                </Stack.Group>
            )}

            {!presentation && (
                <Stack.Group>
                    <Stack.Screen name='Presentation' component={PresentationView}
                        options={{
                            animation: 'fade_from_bottom'
                        }}
                    />
                </Stack.Group>
            )}

            {Object.keys(user).length == 0
                ?
                <Stack.Group>
                    <Stack.Screen name='Auth' component={AuthView} />
                    <Stack.Screen name='Register' component={RegisterView} />
                    <Stack.Screen name='ResetPassword' component={ResetPasswordView} />
                </Stack.Group>
                :
                <Stack.Group>
                    <Stack.Screen name='Drawer' component={Drawer} />

                    <Stack.Screen name='DashEditMyAccount' component={EditMyAccountView} />
                    <Stack.Screen name='DashUpdateTel' component={UpdateTelView} />
                    <Stack.Screen name='DashUpdatePassword' component={UpdatePasswordView} />

                    <Stack.Screen name='DashHistoriqueCourses' component={HistoriqueCoursesView} />
                    <Stack.Screen name='DashCoursesDispos' component={CoursesDisposView} />
                    <Stack.Screen name='DashDetailsCourse' component={DetailsCourseView} />
                    <Stack.Screen name='DashProfilPassager' component={ProfilPassagerView} />

                    <Stack.Screen name='DashReservations' component={ReservationsView} />
                    <Stack.Screen name='DashDetailsReservation' component={DetailsReservationView} />

                    <Stack.Screen name='DashCreateLocationCovoiturage' component={LocationCovoiturageView} />
                    <Stack.Screen name='DashCreateCovoiturage' component={CovoituragePlusInfosView} />
                    <Stack.Screen name='DashCovoiturages' component={CovoituragesView} />
                    <Stack.Screen name='DashDetailsCovoiturage' component={DetailsNewCovoiturageView} />

                    <Stack.Screen name='DashNotifications' component={NotificationsView} />
                    <Stack.Screen name='DashDetailsNotification' component={DetailsNotificationView} />

                    <Stack.Screen name='DashItineraire' component={ItineraireView} />

                    <Stack.Screen name='DashFinition' component={FinitionView}
                        options={{
                            animation: 'fade_from_bottom'
                        }}
                    />

                    <Stack.Screen name='DashNotationPassager' component={NotationPassagerView}
                        options={{
                            animation: 'flip'
                        }}
                    />

                    <Stack.Screen name='DashFoundLocation' component={FoundLocationView} />

                    <Stack.Screen name='DashBilan' component={BilanView} />

                    <Stack.Screen name='DashTransactions' component={TransactionsView} />

                </Stack.Group>
            }
        
        </Stack.Navigator>
    )
}

export default MainStack