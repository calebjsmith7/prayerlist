import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, ScrollView, Dimensions, Image } from 'react-native';
import FlagIcon from 'react-native-ico-flags';
import { data } from './prayerdata';
import uuid from 'react-native-uuid';
import { Divider } from 'react-native-elements';
import defaultImage from '../images/defaultimage.png';

export default function Community(props){
    const [subscriptionslist, setsubscriptionslist] = React.useState(props.listofsubscriptions);
   // let subscriptions = [...props.listofsubscriptions];
    let bigarrayofprayers = [];

    prayerfunc = () => {
        let dataIncludingDbPrayers = [...data, ...props.prayers];

       let results = dataIncludingDbPrayers.filter(({ ministryId }) => subscriptionslist.includes(ministryId));
        
       results.sort(function(a,b){
           if(Date.parse(a.time) == Date.parse(b.time))
           return 0;
           if(Date.parse(a.time) < Date.parse(b.time))
           return 1;
           if(Date.parse(a.time) > Date.parse(b.time))
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
                let todaysmonth = today.getMonth();
                let todaysyear = today.getFullYear();
                let oneweekago = today;
                let weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
                oneweekago.setTime(today.getTime() - weekInMilliseconds);
        
                    
                            return(
                                 (item.day && new Date(item.time).getDate() == todaysday)||(new Date(item.time).getDate() == todaysday && new Date(item.time).getMonth() == todaysmonth && new Date(item.time).getFullYear() == todaysyear) ?
                                <View key={uuid.v4()}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', marginLeft: '8%', marginTop: '3%' }}>
                                        <View style={{ borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2, backgroundColor: '#f00', width: Dimensions.get('window').width / 9, height: Dimensions.get('window').height / 19, alignContent: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {item.country ? <FlagIcon name={item.logo} height={Dimensions.get('window').height / 5.5} width={Dimensions.get('window').width / 5.5} /> 
                                            : <Image source={item.url ? {uri: item.url} : defaultImage} style={{height: Dimensions.get('window').height /5.5, width: Dimensions.get('window').width /5.5}}/> }
                                            
                                        </View>
                                        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', marginLeft: '6%', width: Dimensions.get('window').width *.65, marginRight: '15%' }}>
                                            <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
                                            <Text style={{flexWrap: 'wrap'}}>{item.text}</Text>
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
                let yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0);
                yesterday.setMinutes(1);
                let todaysday = today.getDate();
                let oneweekago = null;
                let weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
                let todaytime = today.getTime();
                
                oneweekago = new Date(todaytime - weekInMilliseconds);
              
                    
                            return(
                               (item.day && item.day >= oneweekago.getDate() && item.day < todaysday) || (new Date(item.time).getDate() >= oneweekago.getDate() && new Date(item.time).getDate() < yesterday.getDate()) ?
                                <View key={uuid.v4()}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', marginLeft: '8%', marginTop: '3%' }}>
                                        <View style={{ borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2, backgroundColor: '#1e2427', width: Dimensions.get('window').width / 9, height: Dimensions.get('window').height / 19, alignContent: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {item.country ? <FlagIcon name={item.logo} height={Dimensions.get('window').height / 5.5} width={Dimensions.get('window').width / 5.5} /> 
                                            : <Image source={item.url ? {uri: item.url} : defaultImage} style={{height: Dimensions.get('window').height /5.5, width: Dimensions.get('window').width /5.5}}/> }
                                        </View>
                                        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', marginLeft: '6%', width: Dimensions.get('window').width *.65, marginRight: '15%' }}>
                                            <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
                                            <Text style={{flexWrap: 'wrap'}}>{item.text}</Text>
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
