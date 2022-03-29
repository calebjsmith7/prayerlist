import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text, Dimensions, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SearchBar } from 'react-native-elements';
import { minlist } from './prayerdata';
import uuid from 'react-native-uuid';
import FlagIcon from 'react-native-ico-flags';
import { Divider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import defaultImage from '../images/defaultimage.png';

export default function Search(props){
    const Navigation = useNavigation();
    const [search, setSearch] = React.useState("");
    const [subscriptions, setSubscriptions] = React.useState(props.listofsubscriptions);
    const [lom, setLom] = React.useState([...minlist, ...props.dbMins]);


    

    const updateSearch = (info) => {
        let lower = info.toLowerCase();
        setSearch(lower);
    }

    const updateSubscriptions = (id) => {
       if(subscriptions.includes(id)){
           console.log('trying to remove subscription ' + id);
           let lox = [...subscriptions];
           let index = lox.indexOf(id);
           lox.splice(index, 1, );
           props.setlistofsubscriptions(lox);
           setSubscriptions(lox);
           
       } else {
        props.setlistofsubscriptions([...subscriptions, id]);
        setSubscriptions([...subscriptions, id]);
        
        console.log('adding subscription ' + id);
       }
    }

     return(
        <View>
            <SearchBar
                placeholder="Search..."
                onChangeText={updateSearch}
                value={search}
                platform="ios"
            />
            <ScrollView>
           {lom.map((item)=>{
               let minmatch = item.name.toLowerCase();
              
               
               return(
              minmatch.match(search) ?
               
                       <View key={uuid.v4()}>
                           <View style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', marginLeft: '8%', marginTop: '3%' }}>
                               <View style={{ borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2, backgroundColor: '#1e2427', width: Dimensions.get('window').width / 9, height: Dimensions.get('window').height / 19, alignContent: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                              {item.flag ? <FlagIcon name={item.flag} height={Dimensions.get('window').height / 5.5} width={Dimensions.get('window').width / 5.5} /> :
                              <Image source={item.url ? {uri: item.url} : defaultImage} style={{height: Dimensions.get('window').height /5.5, width: Dimensions.get('window').width /5.5}}/> }  
                                           
                               </View>
                               <View style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', marginLeft: '6%', width: Dimensions.get('window').width * .65 }}>
                                   <Text style={{ fontWeight: '600', fontSize: 16 }}>{item.name}</Text>
                               </View>
                               <TouchableOpacity style={{position: 'absolute', right: '7%', top: 0, bottom: 0, justifyContent: 'center'}} onPress={()=>{ updateSubscriptions(item.id)}}>
                                   <Icon name={!subscriptions.includes(item.id) ? "add" : "checkmark"} color="black" size={30}/>
                                </TouchableOpacity> 
                              

                           </View>
                           <Divider style={{ borderColor: '#fbfafa', borderWidth: 1, marginTop: '3%' }} />
                       </View>

                    :
                    null
               );
           })}
            </ScrollView>
        </View>

     );
}
