import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Button,
  ScrollView,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/Ionicons";
import { Swipeable } from "react-native-gesture-handler";
import { Divider } from "react-native-elements";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { Picker } from "react-native-woodpicker";

import * as Notifications from "expo-notifications";

export default function Home(props) {
  const [pn, setPn] = React.useState(props.updata);
  const [store, showstore] = React.useState(-1);
  const [frequency, setfrequency] = React.useState();
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(async (n) => {
      const data = n?.request?.content?.data || {};
      const uid = data?.uid;
      const freq = data?.freq;
      const hour = data?.hour;
      const minute = data?.minute;
      if (!uid || !freq) return;

      const base = new Date();
      if (typeof hour === "number" && typeof minute === "number") {
        base.setHours(hour, minute, 0, 0);
      }

      const when = nextFireDate(freq, base);
      if (!when) return;

      try {
        const prev = n.request.content;

        // Minimal, type-safe content (no subtitle/badge/sound unless valid)
        const content = {
          title:
            typeof prev?.title === "string" ? prev.title : "Prayer Reminder:",
          body: typeof prev?.body === "string" ? prev.body : "Time to pray!",
          data: { ...prev?.data },
        };

        const nextId = await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: "date", date: when },
        });

        await AsyncStorage.setItem(
          `notif:${uid}`,
          JSON.stringify({ oneShotId: nextId })
        );
        console.log("next notification created!");
      } catch (e) {
        console.log("Reschedule error:", e);
      }
    });

    return () => sub.remove();
  }, []);

  const dayfreq = [
    { label: "Frequency", value: null },
    { label: "Hourly", value: "HOURLY" },
    { label: "Daily", value: "DAILY" },
    { label: "Weekly", value: "WEEKLY" },
  ];
  console.log(uuid.v4());
  useEffect(() => {
    setPn(props.updata || []);
  }, [props.updata]);

  // helpers for storage keys
  const prayerKey = (uid) => `prayer:${uid}`;
  const notifKey = (uid) => `notif:${uid}`;

  const ensurePermissionOrPrompt = async () => {
    const perms = await Notifications.getPermissionsAsync();
    console.log("Perms (pre):", perms);
    if (perms.status === "granted") return true;

    if (perms.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      console.log("Perms (post):", req);
      return req.status === "granted";
    }

    // Hard-denied in Settings
    Alert.alert(
      "Enable Notifications",
      "Allow notifications for Expo Go (or your app) in iOS Settings → Notifications.",
      [
        { text: "Open Settings", onPress: () => Linking.openSettings?.() },
        { text: "Cancel", style: "cancel" },
      ]
    );
    return false;
  };

  const cancelExistingSchedule = async (uid) => {
    const raw = await AsyncStorage.getItem(notifKey(uid));
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const ids = [];
      if (typeof parsed === "string") ids.push(parsed); // legacy single id string
      if (parsed?.firstId) ids.push(parsed.firstId); // legacy two-id shape
      if (parsed?.repeatId) ids.push(parsed.repeatId);
      if (parsed?.oneShotId) ids.push(parsed.oneShotId);
      for (const id of ids) {
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
        } catch {}
      }
    } catch {
      // raw might be a plain string id
      try {
        await Notifications.cancelScheduledNotificationAsync(raw);
      } catch {}
    } finally {
      await AsyncStorage.removeItem(notifKey(uid));
    }
  };

  // clear function. only for dev
  const quickClear = async () => {
    const clearAll = async () => {
      try {
        await AsyncStorage.clear();
      } catch (e) {
        // clear error
      }
      console.log("Done clearing.");
    };
    clearAll();
  };

  // title logging to array
  const logtitle = (text, index) => {
    const middlepn = [...pn];
    const middlevar = { ...middlepn[index] };
    middlevar.prayertext = text;
    middlevar.order = index;
    middlepn.splice(index, 1, middlevar);
    setPn(middlepn);
    //async below
    console.log(JSON.stringify(middlevar));
    const setStringValue = async () => {
      try {
        await // persist prayer object (do NOT overwrite with expo id)
        AsyncStorage.setItem(
          prayerKey(middlevar.uniqueid),
          JSON.stringify(middlevar)
        ).catch((e) => console.log("setStringValue error", e));
      } catch (e) {
        console.log("error setStringValue to AsyncStorage error is " + e);
      }
      console.log("Done.");
    };
    setStringValue();

    // onCreateTriggerNotification(index);
  };
  // days logging to array
  const logdays = (days, index) => {
    const middlepn = [...pn];
    const middlevar = { ...middlepn[index] };
    middlevar.days = days;
    middlevar.order = index;
    middlepn.splice(index, 1, middlevar);
    setPn(middlepn);

    //async below
    console.log(JSON.stringify(middlevar));
    const setStringValue = async () => {
      try {
        await // persist prayer object (do NOT overwrite with expo id)
        AsyncStorage.setItem(
          prayerKey(middlevar.uniqueid),
          JSON.stringify(middlevar)
        ).catch((e) => console.log("setStringValue error", e));
      } catch (e) {
        console.log("error setStringValue to AsyncStorage error is " + e);
      }
      console.log("Done.");
    };
    setStringValue();

    // onCreateTriggerNotification(index);
  };
  // time logging to array
  const logtime = (time, index) => {
    const middlepn = [...pn];
    const middlevar = { ...middlepn[index] };
    let middletime = new Date(time.nativeEvent.timestamp);
    console.log("middle time is type " + typeof middletime);
    console.log(Date.parse(middletime));
    middlevar.time = middletime;
    middlevar.order = index;
    middlepn.splice(index, 1, middlevar);
    setPn(middlepn);

    //async below
    console.log(JSON.stringify(middlevar));
    const setStringValue = async () => {
      try {
        // persist prayer object (do NOT overwrite with expo id)
        await AsyncStorage.setItem(
          prayerKey(middlevar.uniqueid),
          JSON.stringify(middlevar)
        ).catch((e) => console.log("setStringValue error", e));
      } catch (e) {
        console.log("error setStringValue to AsyncStorage error is " + e);
      }
      console.log("Done.");
    };
    setStringValue();

    // onCreateTriggerNotification(index);
  };

  // prayer object

  function PrayerTemplate(prayertext, days, time, uniqueid, order) {
    this.prayertext = prayertext;
    this.days = days;
    this.time = time;
    this.uniqueid = uniqueid;
    this.order = order;
  }

  // delete a prayer item from state
  const deleteitem = async (index) => {
    const uid = pn[index].uniqueid;

    await cancelExistingSchedule(uid);
    const newList = pn.filter((_, i) => i !== index);
    setPn(newList);
    props.setUpdata(newList);
    await AsyncStorage.removeItem(prayerKey(uid));
  };

  // add prayer item to state
  const additem = () => {
    if (pn.length > 0) {
      if (pn[pn.length - 1].prayertext != null) {
        setPn([
          ...pn,
          new PrayerTemplate(
            null,
            null,
            new Date(),
            uuid.v4(),
            pn[pn.length - 1].order + 1
          ),
        ]);
      }
    } else {
      setPn([new PrayerTemplate(null, null, new Date(), uuid.v4(), 0)]);
    }
  };

  // Notifications functions

  const nextFireDate = (freq, baseDate /* Date with user’s chosen hh:mm */) => {
    const now = new Date();
    const hour = baseDate.getHours();
    const minute = baseDate.getMinutes();

    if (freq === "HOURLY") {
      const d = new Date(now);
      d.setSeconds(0, 0);
      d.setMinutes(minute, 0, 0);
      if (d <= now) d.setHours(d.getHours() + 1);
      return d;
    }

    if (freq === "DAILY") {
      const d = new Date(now);
      d.setSeconds(0, 0);
      d.setHours(hour, minute, 0, 0);
      if (d <= now) d.setDate(d.getDate() + 1);
      return d;
    }

    if (freq === "WEEKLY") {
      const targetDow = baseDate.getDay(); // 0..6
      const d = new Date(now);
      d.setSeconds(0, 0);
      d.setHours(hour, minute, 0, 0);
      const diff = (targetDow - d.getDay() + 7) % 7;
      if (diff === 0 && d <= now) d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + diff);
      return d;
    }

    return null;
  };

  const scheduleNotificationForItem = async (item) => {
    // 1) cancel any previous job we tracked
    await cancelExistingSchedule(item.uniqueid);
    if (!item?.time || !item?.days?.value) return;

    // 2) compute the next absolute date (always future)
    const when = nextFireDate(item.days.value, item.time);
    if (!when) return;

    try {
      // 3) one-shot with identifying data for self-reschedule
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Prayer Reminder:",
          body: item.prayertext || "Time to pray!",
          data: {
            uid: item.uniqueid,
            freq: item.days.value,
            hour: item.time.getHours(),
            minute: item.time.getMinutes(),
          },
        },
        trigger: { type: "date", date: when }, // <-- absolute Date, not a repeating calendar spec
      });

      await AsyncStorage.setItem(
        `notif:${item.uniqueid}`,
        JSON.stringify({ oneShotId: id })
      );
      console.log(
        `✅ Notification scheduled successfully with ID: ${id} for ${when.toISOString()}`
      );
      // (optional) small delay before introspecting (iOS sometimes races)
      await new Promise((r) => setTimeout(r, 150));
      const all = await Notifications.getAllScheduledNotificationsAsync();
      console.log("Scheduled jobs:", JSON.stringify(all, null, 2));
    } catch (e) {
      console.log("SCHEDULE ERROR:", e);
    }
  };

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
          alignItems: "center",

          justifyContent: "center",
          backgroundColor: "red",
          width: "25%",
          marginLeft: "5%",
          paddingLeft: "10%",
        }}
        onPress={() => {
          deleteitem(info);
        }}
      >
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Icon name={"trash-outline"} size={30} color={"white"} />
        </Animated.View>
      </RectButton>
    );
  };

  // home component return map of pn which is state array of prayer objects
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: pn.length * 25 }}
        temp={pn}
        style={{ flex: 1 }}
      >
        {pn.map((item, id) => {
          id == -1 ? console.log("id being assigned negative one") : null;

          return (
            <Swipeable
              useNativeAnimations
              renderRightActions={(dragX) => renderRightActions(dragX, id)}
              key={pn[id].uniqueid}
            >
              <View style={styles.container}>
                <View style={styles.subcontainer}>
                  <TextInput
                    style={styles.textbox}
                    placeholder="Prayer Topic"
                    defaultValue={pn[id].prayertext}
                    onChangeText={(text) => logtitle(text, id)}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      showstore(id);
                    }}
                    style={{ position: "absolute", right: 20 }}
                  >
                    <Icon
                      name="notifications-outline"
                      color={"#047a9eff"}
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
                <Divider style={{ marginTop: 5 }} />

                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#f6f5f5",
                    top: 0,
                    display: store == id ? "flex" : "none",
                  }}
                >
                  <View
                    style={{
                      paddingRight: "20%",
                      paddingLeft: "3%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                  >
                    <Picker
                      item={pn[id].days}
                      items={dayfreq}
                      onItemChange={(value) => {
                        logdays(value, id);
                        setfrequency(value);
                      }}
                      title="Frequency"
                      placeholder="Frequency"
                      isNullable={false}
                      containerStyle={{
                        alignSelf: "center",
                        backgroundColor: "#e7e6e7",
                        padding: ".6%",
                        paddingLeft: 10,
                        paddingRight: 10,
                        borderRadius: 5,
                      }}
                      textInputStyle={{ fontSize: 19, color: "#177bfe" }}
                    />
                    <Text style={{ alignSelf: "center", fontSize: 19 }}>
                      at
                    </Text>
                    <DateTimePicker
                      value={pn[id].time}
                      mode={"time"}
                      is24Hour={false}
                      display="default"
                      onChange={(event, date) => {
                        if (event?.type === "dismissed") return;
                        if (!date) return;
                        logtime(
                          { nativeEvent: { timestamp: date.getTime() } },
                          id
                        );
                      }}
                      style={styles.datePicker}
                    />
                    <TouchableOpacity
                      onPress={async () => {
                        // close drawer
                        showstore(-1);

                        // persist the currently edited item
                        const item = pn[id];
                        await AsyncStorage.setItem(
                          prayerKey(item.uniqueid),
                          JSON.stringify(item)
                        );

                        // (re)schedule once
                        await scheduleNotificationForItem(item);
                        const all =
                          await Notifications.getAllScheduledNotificationsAsync();
                        console.log(
                          "Scheduled jobs:",
                          JSON.stringify(all, null, 2)
                        );
                        // bubble up new list
                        props.setUpdata(pn);
                      }}
                      style={{ position: "absolute", right: 20 }}
                    >
                      <Icon
                        name={"checkmark-circle-outline"}
                        color={"#1e2427"}
                        size={35}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Swipeable>
          );
        })}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignSelf: "center",
            justifyContent: "space-evenly",
            width: Dimensions.get("window").width,
          }}
        >
          <TouchableOpacity
            style={{ alignSelf: "center", marginTop: "5%", marginBottom: "5%" }}
            onPress={() => additem()}
          >
            <Icon name="add-circle-outline" color={"#047a9eff"} size={45} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 55,
    marginBottom: "auto",
    borderBottomColor: "#fbfafa",
    borderBottomWidth: 1,
  },
  subcontainer: {
    padding: "3%",
    marginRight: "2%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textbox: {
    fontSize: 18,
    marginLeft: "3%",
    width: "80%",
  },
  datePicker: {
    width: 100,
    height: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
});
