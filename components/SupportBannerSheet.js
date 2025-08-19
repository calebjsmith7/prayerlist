import { useEffect, useMemo, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Prefer Expo's icon package in Expo apps:
import { Ionicons } from "@expo/vector-icons";

const TAB_BAR_HEIGHT = 30;
const PEEK_VISIBLE = 1; // <— tiny “minimized” sliver above the tab bar
const BANNER_VISIBLE = 30;

export default function SupportBannerSheet() {
  const sheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  const bottomInset = TAB_BAR_HEIGHT + insets.bottom;
  const peekSnap = 30; // index 0 = minimized
  const bannerSnap = bottomInset + BANNER_VISIBLE; // index 1 = banner
  const expanded = 360;
  const snapPoints = useMemo(
    () => [peekSnap, bannerSnap, expanded],
    [peekSnap, bannerSnap]
  );
  useEffect(() => {
    // open to the banner by default
    const id = requestAnimationFrame(() => sheetRef.current?.snapToIndex(1));
    return () => cancelAnimationFrame(id);
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={2}
        disappearsOnIndex={1}
        pressBehavior="collapse"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1} // we'll snap to 0 in useEffect
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      bottomInset={bottomInset}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#fff" }}
      handleIndicatorStyle={{ opacity: 0.35 }}
      onChange={(i) => __DEV__ && console.log("SupportBannerSheet index:", i)}
    >
      <BottomSheetView style={{ paddingHorizontal: 16, paddingVertical: 5 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons
              name="heart"
              size={22}
              color="#e11d48"
              style={{ marginRight: 12 }}
            />
            <View style={{ flexShrink: 1 }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>
                Support this app
              </Text>
              <Text style={{ color: "#555", marginTop: 2 }}>
                Tips help keep PrayerList alive & ad-free.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL("https://buymeacoffee.com/YOUR_ID")}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: "#047a9eff",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Tip $3</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
