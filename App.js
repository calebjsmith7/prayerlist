import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './components/Home';
import Community from './components/community';
import Search from './components/search';
import More from './components/more';
import PrayerItem from './components/PrayerItem';
import logo from './images/pl-logo-blk.png';
import { data } from './components/prayerdata';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';



const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();



const App = () => {
const [loading, setloading] = React.useState(true);
const [topdata, settopdata] = React.useState([]);
const [subscriptiondata, setsubscriptiondata] = React.useState([]);
// fetch to get local data
 
getMultiple = async () => {
  if(loading){
      let keylist = [];
      let renewedfocus = [];
      
      let values
      try {
        keylist = await AsyncStorage.getAllKeys();
        if(keylist != null){

          values = await AsyncStorage.multiGet(keylist);
          for (each in values) {
            let lox = JSON.parse(values[each][1]);
            let unixlox = Date.parse(lox.time);
            lox.time = new Date(unixlox);
            console.log(lox);
            //added below
            if(renewedfocus[0] == null || renewedfocus[0].order <= lox.order){
              renewedfocus.splice(1,0,lox);
            } else {
              renewedfocus.splice(0,0,lox);
            }
          }
        }
      }
      catch (e) {
        console.log(e)
      }
      
      settopdata(renewedfocus);
      setloading(false);
    } else null;
  }
  getMultiple();

// child function

const updatesubscriptions = (info)=>{
  console.log('updatesubscriptions function called on app.js with ' + info);
  setsubscriptiondata(info);
  console.log('success');
}



  
// tab  nav

function MyTabs() {
  return (
    <Tab.Navigator initialRouteName={Home} screenOptions={{tabBarStyle: { backgroundColor: '#fbfafa' }, tabBarBadgeStyle: { color: '#1e2427' }, headerShown: false, tabBarActiveTintColor: '#1e2427', tabBarInactiveTintColor: 'grey'}}>
      <Tab.Screen name="Home" options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused}) => (
            <Icon name={focused ? "home" : "home-outline"} color="grey" size={30}/>
          ),
      }}>{()=><Home updata={topdata}/>}</Tab.Screen>
      <Tab.Screen name="Community" options={{
          tabBarLabel: 'Community',
          tabBarIcon: ({focused}) => (
            <Icon name={focused ? "people-circle" : "people-circle-outline"} color="grey" size={30}/>
          ),
      }}>{()=><Community listofsubscriptions={subscriptiondata}/>}</Tab.Screen>
      <Tab.Screen name="Search" options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({focused}) => (
            <Icon name={focused ? "search-circle" : "search-circle-outline"} color="grey" size={30}/>
          ),
      }}>{()=><Search setlistofsubscriptions={updatesubscriptions} listofsubscriptions={subscriptiondata}/>}</Tab.Screen>
      <Tab.Screen name="More" component={More} options={{
          tabBarLabel: 'More',
          tabBarIcon: ({focused}) => (
            <Icon name={focused ? "layers" : "layers-outline"} color="grey" size={30}/>
          ),
      }}/>
    </Tab.Navigator>
  );
}


// conditional return

if(loading){
  return(
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <Text style={{ color: "#000000", fontSize: 27 }}>Loading</Text>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
  )
} else {
  return(
    <NavigationContainer >
      <SafeAreaView style={{ backgroundColor: "#FBFAFA" }}>
        <View style={styles.container}>
          <Image source={logo} style={styles.header} />
        </View>
      </SafeAreaView>
      <MyTabs/>
      
    </NavigationContainer>
  )
}
};


function MyStack() {
  return(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyTabs" component={MyTabs} />
      
    </Stack.Navigator>
  );
}







const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FBFAFA',
    color: '#1e2427',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    height: 100,
    width: 340,
    marginTop: 7,
    marginBottom: 7,
    resizeMode: 'contain'
  },
});

export default App;
