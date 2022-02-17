import React from "react";

import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    TextInput,
    ScrollView
} from "react-native";

import Icon from 'react-native-vector-icons/Ionicons';
// import DateTimePicker from '@react-native-community/datetimepicker';
//import DateTimePickerModal from "react-native-modal-datetime-picker";
import DatePicker from 'react-native-datepicker';
import { PureNativeButton } from "react-native-gesture-handler/lib/typescript/components/GestureButtons";

export default Settings = (props) => {
    const [date, setDate] = React.useState(props.pctimeval);
    const [days, setDays] = React.useState();

    

    const onChange = (event, value) => {
      //  console.log(value);
        settingsprefunc(null, value);
      
       // setDate(value);
    };

    

    const settingsprefunc = (days, time) => {
        if (days != null) {
            props.settingsup(null, days, null);


        } else if (time != null) {
            props.settingsup(null, null, time);
           // setDate(time);
        } else {
            console.log('issue with settings.settingsprefunc');
        }


    }

    return (
        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'lightblue', top: 0, display: props.thestore ? 'flex' : 'none' }}>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 'auto', marginBottom: 'auto' }}>
                <Text style={{ alignSelf: 'center', fontSize: 17 }}>Every</Text>
                <TextInput
                    style={{ backgroundColor: 'white', width: '10%', fontSize: 20, textAlign: 'center' }}
                    onChangeText={(e) => { e <= 365 && !e.includes('.') && (e > 0 || e == "") ? settingsprefunc(e) : console.log('error setting bpm') }}
                    defaultValue={props.pcdayval}
                    keyboardType='numeric'
                    keyboardAppearance='default'
                    maxLength={3}
                    returnKeyType='done'
                />
                <Text style={{ alignSelf: 'center', fontSize: 17 }}>Days at</Text>
                        <DatePicker
                            style={{width: 100}}
                            date={props.pnlist1[props.ind].time}
                            mode="time"
                            placeholder="select time"
                            showIcon= {false}
                            format="h:mm a"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            is24Hour="false"
                            useNativeDriver='true'
                            onDateChange={onChange}
                        />
                <TouchableOpacity onPress={() => { props.theshowstore(false); }}><Icon name={'checkmark-circle-outline'} color={'black'} size={35} /></TouchableOpacity>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    datePicker: {
        width: 100,
        height: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
})