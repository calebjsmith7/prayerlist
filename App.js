import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import PrayerItem from './components/PrayerItem';
import logo from './images/pl-logo-blk.png';
import { data } from './components/prayerdata';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';



const Stack = createStackNavigator();




const App = () => {
const [loading, setloading] = React.useState(true);
const [topdata, settopdata] = React.useState([]);

 
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
      console.log('retrieving... ' + JSON.stringify(renewedfocus));
      settopdata(renewedfocus);
      setloading(false);
    } else null;
  }
  getMultiple();


  





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
      <Home updata={topdata}/>
      <SafeAreaView style={{ height: '10%', backgroundColor: '#FBFAFA' }} />
    </NavigationContainer>
  )
}
};





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
