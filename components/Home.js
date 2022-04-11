import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Dimensions, Animated } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';

import Icon from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { Divider } from "react-native-elements";

import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Picker } from 'react-native-woodpicker';
import notifee, { TriggerType, IOSAuthorizationStatus, RepeatFrequency } from '@notifee/react-native';




export default function Home(props) {


    const navigation = useNavigation();
    const [pn, setPn] = React.useState(props.updata);
    const [store, showstore] = React.useState(-1);
    const [frequency, setfrequency] = React.useState();

    const dayfreq = [
        { label: "Frequency", value: null },
        { label: "Hourly", value: 'HOURLY' },
        { label: "Daily", value: 'DAILY' },
        { label: "Weekly", value: 'WEEKLY' }
    ];

    // user authorization function for push notifications. happens once
    const authoriz = async () => {
        const settings = await notifee.requestPermission();
        if (settings.authorizationStatus === IOSAuthorizationStatus.DENIED) {
            console.log('User denied permissions request');
        } else if (settings.authorizationStatus === IOSAuthorizationStatus.AUTHORIZED) {
            console.log('User granted permissions request');
        } else if (settings.authorizationStatus === IOSAuthorizationStatus.PROVISIONAL) {
            console.log('User provisionally granted permissions request');
        }
    }
    authoriz();

    // clear function. only for dev
    quickClear = async () => {
        clearAll = async () => {
            try {
                await AsyncStorage.clear()
            } catch (e) {
                // clear error
            }
            console.log('Done clearing.')
        }
        clearAll();
    }


    // title logging to array
    const logtitle = (text, index) => {

        let middlepn = pn;
        let middlevar = pn[index];
        middlevar.prayertext = text;
        middlevar.order = index;
        middlepn.splice(index, 1, middlevar);
        setPn(middlepn);
        //async below
        console.log(JSON.stringify(middlevar));
        const setStringValue = async () => {
            try {
                await AsyncStorage.setItem(middlevar.uniqueid, JSON.stringify(middlevar))
            } catch (e) {
                console.log('error setStringValue to AsyncStorage error is ' + e);
            }
            console.log('Done.');
        }
        setStringValue();

        onCreateTriggerNotification(index);

    }
    // days logging to array
    const logdays = (days, index) => {
        let middlepn = pn;
        let middlevar = pn[index];
        middlevar.days = days;
        middlevar.order = index;
        middlepn.splice(index, 1, middlevar);
        setPn(middlepn);
        //async below
        console.log(JSON.stringify(middlevar));
        const setStringValue = async () => {
            try {
                await AsyncStorage.setItem(middlevar.uniqueid, JSON.stringify(middlevar))
            } catch (e) {
                console.log('error setStringValue to AsyncStorage error is ' + e);
            }
            console.log('Done.');
        }
        setStringValue();

        onCreateTriggerNotification(index);
    }
    // time logging to array
    const logtime = (time, index) => {
        let middlepn = pn;
        let middlevar = pn[index];
        let middletime = new Date(time.nativeEvent.timestamp);
        console.log('middle time is type ' + typeof middletime);
        console.log(Date.parse(middletime));
        middlevar.time = middletime;
        middlevar.order = index;
        middlepn.splice(index, 1, middlevar);
        setPn(middlepn);
        //async below
        console.log(JSON.stringify(middlevar));
        const setStringValue = async () => {
            try {
                await AsyncStorage.setItem(middlevar.uniqueid, JSON.stringify(middlevar))
            } catch (e) {
                console.log('error setStringValue to AsyncStorage error is ' + e);
            }
            console.log('Done.');
        }
        setStringValue();

        onCreateTriggerNotification(index);
    }


    // prayer object

    function PrayerTemplate(prayertext, days, time, uniqueid, order) {
        this.prayertext = prayertext;
        this.days = days;
        this.time = time;
        this.uniqueid = uniqueid;
        this.order = order;
    }


    // delete a prayer item from state
    const deleteitem = (info) => {
        let uid = pn[info].uniqueid;
        let newlist = [...pn];
        newlist.splice(info, 1);
        setPn(newlist);
        // remove from local storage
        removeValue = async () => {
            try {
                await AsyncStorage.removeItem(uid)
            } catch (e) {
                console.log(e);
            }
            console.log('Done removing ' + info)
        }
        removeValue();
        // remove push notification
        notifee.cancelNotification(uid);
    }

    // add prayer item to state
    const additem = () => {
        if (pn.length > 0) {
            if(pn[pn.length -1].prayertext != null){
                setPn([...pn, new PrayerTemplate(null, null, new Date(1598051730000), uuid.v4(), pn[pn.length - 1].order + 1)]);
            }
        } else {
            setPn([new PrayerTemplate(null, null, new Date(1598051730000), uuid.v4(), 0)]);
        }
    }


    // Notifications functions


    const onCreateTriggerNotification = async (index) => {
        const date = new Date(Date.now());
        let tomorrow = new Date();
        let prayertime = pn[index].time;
        const prayerfreq = pn[index].days;
        prayertime.setSeconds(0);
        tomorrow.setDate(date.getDate() + 1);

        // if statement here to determine if time selected is in the future or past. if past, then set date to tomorrow. consumes either time or hour and minutes
        if (prayertime.getTime() <= date.getTime()) {
            tomorrow.setHours(prayertime.getHours());
            tomorrow.setMinutes(prayertime.getMinutes());
            prayertime = tomorrow;
            console.log('will be pushed tomorrow');
        } else {
            console.log('will be pushed later today');
        }


        // Create a time-based trigger
        const trigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: prayertime.getTime(),
            repeatFrequency: pn[index].days.value == 'WEEKLY' ? RepeatFrequency.WEEKLY : pn[index].days.value == 'DAILY' ? RepeatFrequency.DAILY : pn[index].days.value == 'HOURLY' ? RepeatFrequency.HOURLY : null
        };

        try {
            if (pn[index].days.value != null) {
                await notifee.createTriggerNotification(
                    {
                        id: pn[index].uniqueid,
                        title: 'Prayer Notification:',
                        body: pn[index].prayertext,
                        android: {
                            channelId: 'default',
                        },
                    },
                    trigger,
                );
            } else {
                notifee.cancelNotification(pn[index].uniqueid);
                console.log('frequency set to null. will not set trigger');
            }
        } catch (e) {
            console.log(e);
        }
    }





    // end notification functions



    // handles motion for swipeable to delete 
    const renderRightActions = (dragX, info) => {

        // swipeable function for animation
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });

        // returns for swipeable
        return (
            <RectButton
                style={{
                    alignItems: 'center',

                    justifyContent: 'center',
                    backgroundColor: 'red',
                    width: '25%',
                    marginLeft: '5%',
                    paddingLeft: '10%'
                }}
                onPress={() => { deleteitem(info); }}
            >
                <Animated.View style={{ transform: [{ translateX: trans }] }} >
                    <Icon name={"trash-outline"} size={30} color={'white'} />
                </Animated.View>
            </RectButton>
        );
    }



    // home component return map of pn which is state array of prayer objects
    return (

        <ScrollView temp={pn}>
            {pn.map(item => {
                let id = pn.indexOf(item);
                id == -1 ? console.log('id being assigned negative one') : null;

                return (
                    <Swipeable useNativeAnimations renderRightActions={(dragX) => renderRightActions(dragX, id)} key={pn[id].uniqueid}>
                        <View style={styles.container}>
                            <View style={styles.subcontainer}>
                                <TextInput
                                    style={styles.textbox}
                                    placeholder="Prayer Topic"
                                    defaultValue={pn[id].prayertext}
                                    onChangeText={(text) => logtitle(text, id)}
                                />
                                <TouchableOpacity onPress={() => { showstore(id); }} style={{ position: 'absolute', right: 20,  }}><Icon name="notifications-outline" color={'#1e2427'} size={30} /></TouchableOpacity>
                            </View>
                            <Divider style={{marginTop: 5}}/>

                            <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#f6f5f5', top: 0, display: store == id ? 'flex' : 'none' }}>
                                <View style={{ paddingRight: '20%', paddingLeft: '3%', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 'auto', marginBottom: 'auto' }}>
                                    <Picker
                                        item={pn[id].days}
                                        items={dayfreq}
                                        onItemChange={(value) => { logdays(value, id); setfrequency(value); }}
                                        tile="Frequency"
                                        placeholder='Frequency'
                                        isNullable={false}
                                        containerStyle={{ alignSelf: 'center', backgroundColor: '#e7e6e7', padding: '.6%', paddingLeft: 10, paddingRight: 10, borderRadius: 5 }}
                                        textInputStyle={{ fontSize: 19, color: '#177bfe' }}
                                    />
                                    <Text style={{ alignSelf: 'center', fontSize: 19 }}>at</Text>
                                    <DateTimePicker
                                        value={pn[id].time}
                                        mode={"time"}
                                        is24Hour={false}
                                        display="default"
                                        onChange={(selectedValue) => logtime(selectedValue, id)}
                                        style={styles.datePicker}
                                    />
                                    <TouchableOpacity onPress={() => { showstore(-1); }} style={{ position: 'absolute', right: 20 }}><Icon name={'checkmark-circle-outline'} color={'#1e2427'} size={35} /></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Swipeable>

                );
            })}
            <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-evenly', width: Dimensions.get('window').width }}>
                <TouchableOpacity style={{ alignSelf: 'center', marginTop: '5%', marginBottom: '5%' }} onPress={() => additem()}><Icon name="add-circle-outline" color={'#1e2427'} size={45} /></TouchableOpacity>
            </View>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 55,
        marginBottom: 'auto',
        borderBottomColor: '#fbfafa',
        borderBottomWidth: 1,
        
    },
    subcontainer: {
        padding: '3%',
        marginRight: '2%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
    },
    textbox: {
        fontSize: 18,
        marginLeft: '3%',
        width: '80%',
        
    },
    datePicker: {
        width: 100,
        height: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
})

