import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from "react-native";

import { Divider } from "react-native-elements";

import { ScrollView } from "react-native-gesture-handler";

export default More = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <Text
          style={{
            color: "#1e2427",
            fontSize: 30,
            marginTop: "7%",
            marginLeft: "5%",
          }}
        >
          Love this app?
        </Text>
        <Text
          style={{
            color: "#1e2427",
            fontSize: 21,
            marginTop: "4%",
            marginLeft: "5%",
            marginRight: "5%",
          }}
        >
          Leave us a review! If you have any comments, questions, or concerns,
          email our support!
        </Text>
        <TouchableOpacity
          style={{ marginLeft: "5%", marginTop: "5%" }}
          onPress={() => {
            Linking.openURL(
              "https://apps.apple.com/us/app/prayer-list-a-prayer-app/id1614678041"
            );
          }}
        >
          <Text style={{ color: "#1e2427", fontSize: 21 }}>
            * Leave a Review
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: "5%", marginTop: "5%" }}
          onPress={() => {
            Linking.openURL(
              "https://sites.google.com/view/worship-pads-pro-privacypolicy/support"
            );
          }}
        >
          <Text style={{ color: "#1e2427", fontSize: 21 }}>* Tech Support</Text>
        </TouchableOpacity>
        <Divider orientation="horizontal" style={{ marginTop: "5%" }} />
        <TouchableOpacity
          style={{ marginLeft: "5%", marginTop: "5%" }}
          onPress={() => {
            Linking.openURL(
              "https://apps.apple.com/us/app/prayer-list-a-prayer-app/id1614678041"
            );
          }}
        >
          <Text style={{ color: "#1e2427", fontSize: 21 }}>
            * Share this app with a friend!
          </Text>
        </TouchableOpacity>
        <Divider orientation="horizontal" style={{ marginTop: "4%" }} />
        <TouchableOpacity
          style={{ marginLeft: "5%", marginTop: "5%", paddingBottom: "20%" }}
          onPress={() => {
            Linking.openURL(
              "https://apps.apple.com/us/app/prayer-list-for-ministries/id1614678377"
            );
          }}
        >
          <Text style={{ color: "#1e2427", fontSize: 21 }}>
            * Create a Ministry Page
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f2f2",
  },
  resources: {
    height: Dimensions.get("window").height,
  },
});
