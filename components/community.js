import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text, ScrollView, Dimensions, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FlagIcon from 'react-native-ico-flags';
import { data } from './prayerdata';
import uuid from 'react-native-uuid';
import { BackgroundImage } from 'react-native-elements/dist/config';
import { Divider } from 'react-native-elements';
import ima from '../images/pl-logo-blk.png';

export default function Community(props){
    const Navigation = useNavigation();
    const [subscriptionslist, setsubscriptionslist] = React.useState(props.listofsubscriptions);
   // let subscriptions = [...props.listofsubscriptions];
    let bigarrayofprayers = [];
    console.log('list of subscriptions from community page is ' + subscriptionslist);

    prayerfunc = () => {
       let results = data.filter(({ uid }) => subscriptionslist.includes(uid));
        console.log('prayerfunc filter results equal to ' + results);

       results.sort(function(a,b){
           if(Date.parse(a.date) == Date.parse(b.date))
           return 0;
           if(Date.parse(a.date) < Date.parse(b.date))
           return 1;
           if(Date.parse(a.date) > Date.parse(b.date))
           return -1;
       })
       bigarrayofprayers = results;
    }
    prayerfunc();




    return (
        <ScrollView style={{flex: 1}}>
            { subscriptionslist.length != 0 ?
                <View style={{width: Dimensions.get('window').width, height: 'auto', paddingTop: '4%', paddingBottom: '2%', justifyContent: 'center', }}><Text style={{fontSize: 18, alignSelf: 'center', textDecorationLine: 'underline'}}>Today</Text></View>
                :
                <View style={{height: Dimensions.get('window').height}}><Text style={{fontSize: 20, padding: '12%', fontWeight: '600', borderColor: 'grey', borderWidth: 1, textAlign: 'center', color:"#1e2427"}}>Subscribe to a Prayer List by using the search feature below.</Text></View>
            }
            
            { 
            
            bigarrayofprayers.map((item) => {
                let today = new Date();
                let todaysday = today.getDate();
                let oneweekago = today;
                let weekInMilliseconds = 7 * 24 * 60 * 1000;
                oneweekago.setTime(today.getTime() - weekInMilliseconds);
        
                    
                            return(
                                 new Date(item.date).getDate() == todaysday ?
                                <View key={uuid.v4()}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', marginLeft: '8%', marginTop: '3%' }}>
                                        <View style={{ borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2, backgroundColor: '#f00', width: Dimensions.get('window').width / 9, height: Dimensions.get('window').height / 19, alignContent: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <FlagIcon name={item.logo} height={Dimensions.get('window').height / 5.5} width={Dimensions.get('window').width / 5.5} />
                                        </View>
                                        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', marginLeft: '6%', width: Dimensions.get('window').width *.65, marginRight: '15%' }}>
                                            <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.ministry}</Text>
                                            <Text style={{flexWrap: 'wrap'}}>{item.title}</Text>
                                        </View>
            
                                    </View>
                                    <Divider style={{ borderColor: '#fbfafa', borderWidth: 1, marginTop: '3%' }} />
                                </View>
                                :
                                null
                            );}
                       
                    )
 
            }
            {
                subscriptionslist.length != 0 ?
                <View style={{width: Dimensions.get('window').width, height: 'auto', paddingTop: '4%', paddingBottom: '2%', justifyContent: 'center', }}><Text style={{fontSize: 18, alignSelf: 'center', textDecorationLine: 'underline'}}>This Week</Text></View>
                :
                null
            }
            

            { 
            
            bigarrayofprayers.map((item) => {
                let today = new Date();
                let todaysday = today.getDate();
                let oneweekago = null;
                let weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
                let todaytime = today.getTime();
                
                oneweekago = new Date(todaytime - weekInMilliseconds);
               
                    
                            return(
                                  item.day >= oneweekago.getDate() && item.day < todaysday?
                                <View key={uuid.v4()}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', marginLeft: '8%', marginTop: '3%' }}>
                                        <View style={{ borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2, backgroundColor: '#f00', width: Dimensions.get('window').width / 9, height: Dimensions.get('window').height / 19, alignContent: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <FlagIcon name={item.logo} height={Dimensions.get('window').height / 5.5} width={Dimensions.get('window').width / 5.5} />
                                        </View>
                                        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', marginLeft: '6%', width: Dimensions.get('window').width *.65, marginRight: '15%' }}>
                                            <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.ministry}</Text>
                                            <Text style={{flexWrap: 'wrap'}}>{item.title}</Text>
                                        </View>
            
                                    </View>
                                    <Divider style={{ borderColor: '#fbfafa', borderWidth: 1, marginTop: '3%' }} />
                                </View>
                                :
                                null
                            );}
                       
                    )
 
            }
 
        </ScrollView>

     );
}
