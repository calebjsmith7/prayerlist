import { useEffect, useMemo, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTipJar } from "./iap/useTipJar";

const TAB_BAR_HEIGHT = 30;
const BANNER_VISIBLE = 30;
const ACCENT = "#047a9eff";

export default function SupportBannerSheet() {
  // Toggle mock to true for screenshots; false for real IAPs
  const { ready, busy, priceById, buy } = useTipJar({ mock: false });

  const sheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  const bottomInset = TAB_BAR_HEIGHT + insets.bottom;
  const peekSnap = 30; // minimized sliver (adjust if needed)
  const bannerSnap = bottomInset + BANNER_VISIBLE; // visible banner
  const expanded = 360;

  const snapPoints = useMemo(
    () => [peekSnap, bannerSnap, expanded],
    [peekSnap, bannerSnap]
  );

  useEffect(() => {
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

  const TipPill = ({ sku, fallbackPrice, size = "md" }) => {
    const label = priceById[sku] || fallbackPrice;
    const isDisabled = !ready || busy;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Tip ${label}`}
        disabled={isDisabled}
        onPress={() => buy(sku)}
        style={{
          paddingVertical: size === "lg" ? 12 : 10,
          paddingHorizontal: size === "lg" ? 16 : 14,
          borderRadius: 999,
          backgroundColor: ACCENT,
          alignItems: "center",
          justifyContent: "center",
          flex: size === "lg" ? 0 : 1,
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Tip {label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      bottomInset={bottomInset}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#fff" }}
      handleIndicatorStyle={{ opacity: 0.35 }}
      onChange={(i) => __DEV__ && console.log("SupportBannerSheet index:", i)}
    >
      <BottomSheetView style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {/* Header row with primary CTA */}
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
              size={30}
              color="#e11d48"
              style={{ marginRight: 14 }}
            />
            <View style={{ flexShrink: 1, width: "70%" }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>
                Support this app
              </Text>
              <Text style={{ color: "#555", marginTop: 2 }}>
                Tips help keep PrayerList alive & ad-free.
              </Text>
            </View>
          </View>

          {/* Primary tip (medium/large pill) */}
          <TipPill sku="tip_099" fallbackPrice="$0.99" size="lg" />
        </View>
        {/*   
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontSize: 12,
              color: "#777",
              marginBottom: 6,
              fontWeight: "600",
              letterSpacing: 0.3,
            }}
          >
            Other amounts
          </Text>

          <View style={{ flexDirection: "row" }}>
            <TipPill sku="tip_099" fallbackPrice="$0.99" />
            <View style={{ width: 10 }} />
            <TipPill sku="tip_499" fallbackPrice="$4.99" />
          </View>
        </View>
         */}
        {/* Busy indicator (optional, subtle) */}
        {busy ? (
          <View
            style={{
              position: "absolute",
              right: 16,
              top: 12,
              width: 22,
              height: 22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="small" />
          </View>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
}
