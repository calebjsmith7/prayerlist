import { View, Text, TouchableOpacity, Dimensions, Image } from "react-native";
import { Divider } from "react-native-elements";
import { memo } from "react";
import FlagIcon from "react-native-ico-flags";
import Icon from "react-native-vector-icons/Ionicons";
import defaultImage from "../images/defaultimage.png";

const Contributor = ({ item, subscriptions, updateSubscriptions }) => {
  return (
    <>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          marginLeft: "8%",
          marginTop: "3%",
        }}
      >
        <View
          style={{
            borderRadius:
              Math.round(
                Dimensions.get("window").width + Dimensions.get("window").height
              ) / 2,
            backgroundColor: "#1e2427",
            width: Dimensions.get("window").width / 9,
            height: Dimensions.get("window").height / 19,
            alignContent: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {item?.flag ? (
            <FlagIcon
              name={item.flag}
              height={Dimensions.get("window").height / 5.5}
              width={Dimensions.get("window").width / 5.5}
            />
          ) : (
            <Image
              source={item?.url ? { uri: item.url } : defaultImage}
              style={{
                height: Dimensions.get("window").height / 5.5,
                width: Dimensions.get("window").width / 5.5,
              }}
            />
          )}
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: "auto",
            marginLeft: "6%",
            width: Dimensions.get("window").width * 0.65,
          }}
        >
          <Text style={{ fontWeight: "600", fontSize: 16 }}>{item?.name}</Text>
        </View>
        <TouchableOpacity
          style={{
            position: "absolute",
            right: "7%",
            top: 0,
            bottom: 0,
            justifyContent: "center",
          }}
          onPress={() => {
            updateSubscriptions(item.id);
          }}
        >
          <Icon
            name={!subscriptions?.includes(item.id) ? "add" : "checkmark"}
            color="black"
            size={30}
          />
        </TouchableOpacity>
      </View>
      <Divider
        style={{
          borderColor: "#fbfafa",
          borderWidth: 1,
          marginTop: "3%",
        }}
      />
    </>
  );
};

export default memo(Contributor);
