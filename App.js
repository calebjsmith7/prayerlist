import "react-native-gesture-handler";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  AppState,
  Alert,
  Linking,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./components/Home";
import Community from "./components/community";
import Search from "./components/search";
import More from "./components/more";
import PrayerItem from "./components/PrayerItem";
import logo from "./images/pl-logo-blk.png";
import { data } from "./components/prayerdata";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MinistryListDatabaseService from "./services/MinistryListDatabaseService";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

// notifications setup for expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowList: true,
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const prepare = async () => {
  // 1) iOS permissions: check first, then request if we can
  if (Platform.OS === "ios") {
    let perms = await Notifications.getPermissionsAsync();
    let finalStatus = perms.status;

    if (finalStatus !== "granted" && perms.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          // allowAnnouncements: false, // opt-in if you use Siri announcements
          // allowCriticalAlerts: false, // needs entitlement
        },
      });
      finalStatus = req.status;
    }

    if (finalStatus !== "granted") {
      console.log("iOS notification permission denied");
      // if we can't ask again, offer to open Settings
      if (!perms.canAskAgain) {
        Alert.alert(
          "Enable Notifications",
          "To receive reminders, please allow notifications in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings?.() },
          ]
        );
      }
      // bail early (you can still proceed; scheduling will silently fail to alert)
    }
  }

  // 2) Android notification channel (Android only)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      // sound: 'default', // add if you ship a custom sound
    });
  }
};

const App = () => {
  const [loading, setloading] = useState(true);
  const [topdata, settopdata] = useState([]);
  const [subscriptiondata, setsubscriptiondata] = useState([]);
  const [dbMinistries, setDbMinistries] = useState([]);
  const [dbPrayers, setDbPrayers] = useState([]);

  // hide splash
  // right below your existing useState hooks
  /*useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [loading]);*/

  // func to set topdata from child

  const setTheTopData = (val) => {
    settopdata(val);
  };

  // prepare notification service
  useEffect(() => {
    prepare();
  }, []);

  // fetch to get local data
  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      if (!loading) return;

      try {
        // Parallel fetch: keys, subscription blob, ministries
        const [allKeys, subsRaw, minList] = await Promise.all([
          AsyncStorage.getAllKeys(),
          AsyncStorage.getItem("subscriptionid"),
          MinistryListDatabaseService("listofministries"),
        ]);

        if (isMounted) setDbMinistries(minList ?? []);

        // If you also want to fetch prayers from the DB, uncomment:
        // const prayerList = await MinistryListDatabaseService("maincollection");
        // if (isMounted) setDbPrayers(prayerList ?? []);

        // Only our prayer objects
        const prayerKeys = (allKeys ?? []).filter((k) =>
          k.startsWith("prayer:")
        );
        const pairs = prayerKeys.length
          ? await AsyncStorage.multiGet(prayerKeys)
          : [];

        // Parse + normalize
        const renewed = [];
        for (const [, v] of pairs) {
          if (!v) continue;
          try {
            const obj = JSON.parse(v);
            if (obj?.time) {
              const t = new Date(obj.time);
              if (!Number.isNaN(+t)) obj.time = t;
            }
            renewed.push(obj);
          } catch {
            // ignore bad JSON
          }
        }

        // Sort by order (lowest first)
        renewed.sort(
          (a, b) =>
            (typeof a?.order === "number" ? a.order : 0) -
            (typeof b?.order === "number" ? b.order : 0)
        );

        // Subscriptions
        if (subsRaw) {
          try {
            const subs = JSON.parse(subsRaw);
            if (isMounted) setsubscriptiondata(subs?.subscriptions ?? []);
          } catch (e) {
            console.log("Bad subscription JSON", e);
          }
        }

        if (isMounted) settopdata(renewed);
      } catch (e) {
        console.log("getMultiple error", e);
      } finally {
        if (isMounted) setloading(false);
      }
    };

    fetchAll();
    return () => {
      isMounted = false;
    };
  }, [loading]);

  // child subscribe function

  const updatesubscriptions = (info) => {
    setsubscriptiondata(info);
    const setSubValue = async () => {
      try {
        await AsyncStorage.setItem(
          "subscriptionid",
          JSON.stringify({ subscriptions: info })
        );
      } catch (e) {
        console.log("error setStringValue to AsyncStorage error is " + e);
      }

      console.log("Done.");
    };
    setSubValue();
    console.log("success");
  };

  // tab  nav

  function MyTabs() {
    return (
      <>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            tabBarStyle: { backgroundColor: "#fbfafa" },
            tabBarBadgeStyle: { color: "#047a9eff" },
            headerShown: false,
            tabBarActiveTintColor: "#047a9eff",
            tabBarInactiveTintColor: "#808080",
          }}
        >
          <Tab.Screen
            name="Home"
            options={{
              tabBarLabel: "Home",
              tabBarIcon: ({ focused }) => (
                <Icon
                  name={focused ? "home" : "home-outline"}
                  color={focused ? "#047a9eff" : "#808080"}
                  size={30}
                />
              ),
            }}
          >
            {() => <Home updata={topdata} setUpdata={setTheTopData} />}
          </Tab.Screen>
          <Tab.Screen
            name="Community"
            options={{
              tabBarLabel: "Community",
              tabBarIcon: ({ focused }) => (
                <Icon
                  name={focused ? "people-circle" : "people-circle-outline"}
                  color={focused ? "#047a9eff" : "#808080"}
                  size={30}
                />
              ),
            }}
          >
            {() => (
              <Community
                listofsubscriptions={subscriptiondata}
                prayers={dbPrayers}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Search"
            options={{
              tabBarLabel: "Search",
              tabBarIcon: ({ focused }) => (
                <Icon
                  name={focused ? "search-circle" : "search-circle-outline"}
                  color={focused ? "#047a9eff" : "#808080"}
                  size={30}
                />
              ),
            }}
          >
            {() => (
              <Search
                setlistofsubscriptions={updatesubscriptions}
                listofsubscriptions={subscriptiondata}
                dbMins={dbMinistries}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="More"
            component={More}
            options={{
              tabBarLabel: "More",
              tabBarIcon: ({ focused }) => (
                <Icon
                  name={focused ? "layers" : "layers-outline"}
                  color={focused ? "#047a9eff" : "#808080"}
                  size={30}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </>
    );
  }

  // conditional return

  return loading ? null : (
    <NavigationContainer>
      <SafeAreaView style={{ backgroundColor: "#FBFAFA" }}>
        <Image source={logo} style={styles.header} />
      </SafeAreaView>
      <MyTabs />
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FBFAFA",
    color: "#1e2427",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    height: 100,
    width: 340,
    marginTop: 7,
    marginBottom: 7,
    resizeMode: "contain",
    marginLeft: "auto",
    marginRight: "auto",
  },
});

export default App;
