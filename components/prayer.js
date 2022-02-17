import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Divider } from "react-native-elements";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/Ionicons';
import Settings from '../components/settings.js';






export default function Prayer(props){

    let local = "";
    const [prayer, setPrayer] = React.useState();
    const [store, showstore] = React.useState(false);
    const [flag, setflag] = React.useState(false);

    const localfunc = (text, days, time) => {
        if(text != null){
            props.logit(props.theindex, text, null, null);
            setPrayer(text);
        } else if(days != null){
            props.logit(props.theindex, null, days, null);
        } else if(time != null){
            props.logit(props.theindex, null, null, time);
        } else{
            console.log('big issue here with prayer.localfunc');
        }
        setflag(true);
    }
    
    return(
        
        <View style={styles.container}>
            <View style={styles.subcontainer}>
            <TextInput 
                style={styles.textbox}
                placeholder="Prayer Topic"
             
               defaultValue={props.ptitleval}
            
                onChangeText={(text)=>localfunc(text)}
               
            />
            <TouchableOpacity onPress={()=>{showstore(true);}}><Icon name="notifications-outline" color={'#1e2427'} size={30}/></TouchableOpacity>
            </View>
            <Divider/>
            <Settings thestore={store} theshowstore={showstore} settingsup={localfunc} pcdayval={props.pdayval} pctimeval={props.ptimeval} ind={props.theindex} pnlist1={props.pnlist}/>
        
        </View>
       
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 55,
        marginBottom: 'auto'
    },
    subcontainer: {
        padding: '3%',
        marginRight: '2%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textbox: {
        fontSize: 21,
        marginLeft: '3%'
    }
})