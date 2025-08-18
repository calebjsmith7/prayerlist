import React, { useEffect, useMemo, useCallback, useState, memo } from "react";
import {
  View,
  Text,
  SectionList,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native";
import FlagIcon from "react-native-ico-flags";
import { Divider } from "react-native-elements";
import defaultImage from "../images/defaultimage.png";
import { data as staticData } from "./prayerdata";
import { db } from "../services/MinistryListDatabaseService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BlurView } from "expo-blur";
const { width: W, height: H } = Dimensions.get("window");
const AVATAR_W = W / 9;
const AVATAR_H = H / 19;
const THUMB_W = W / 5.5;
const THUMB_H = H / 5.5;
const BOTTOM_SPACER = 56;

// ---------- time helpers ----------
const MS_DAY = 24 * 60 * 60 * 1000;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const startOfTomorrow = () => startOfToday() + MS_DAY;
const startOfWeekWindow = () => startOfToday() - 7 * MS_DAY;
// New: clamp helper used by normalizeLocal
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();

const toMillis = (t) => {
  if (!t) return null;
  if (t && typeof t.toDate === "function") return t.toDate().getTime(); // Firestore Timestamp
  if (typeof t === "number") return t;
  const d = new Date(t);
  const ms = d.getTime();
  return isNaN(ms) ? null : ms;
};

/**
 * For local “monthly day” items (e.g., day: 3), pick the most recent
 * occurrence <= today (wrap to last month if the day is still ahead).
 * Returns milliseconds at noon for that date.
 */
const normalizeLocal = (s, i) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  // prefer explicit day; otherwise derive from its old time; else default to 1
  const derivedDay = (() => {
    if (Number.isInteger(s.day)) return s.day;
    const d = new Date(s.time);
    return Number.isFinite(d.getTime()) ? d.getDate() : 1;
  })();

  // clamp for this month (handles Feb, etc.)
  const day = Math.min(derivedDay, daysIn(y, m));

  // build this-month date at noon
  let dt = new Date(y, m, day, 12, 0, 0, 0);

  // if in the future, shift to previous month and clamp again
  if (dt.getTime() > now.getTime()) {
    const pm = m - 1;
    const adjY = pm < 0 ? y - 1 : y;
    const adjM = (pm + 12) % 12;
    const clampedDay = Math.min(day, daysIn(adjY, adjM));
    dt = new Date(adjY, adjM, clampedDay, 12, 0, 0, 0);
  }

  return { _localKey: `local-${i}`, ...s, time: dt.getTime() };
};

const mostRecentOccurrenceForDay = (day) => {
  if (day == null) return null;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const todayDay = now.getDate();

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const clamp = (year, month, d) => Math.min(d, daysInMonth(year, month));

  let year = y;
  let month = m;

  // If the target day is still ahead this month, we want LAST month’s occurrence.
  if (day > todayDay) {
    month = m - 1;
    if (month < 0) {
      month = 11;
      year = y - 1;
    }
  }

  const dom = clamp(year, month, day);
  // Noon local time to avoid DST/edge issues; still classifies as "today" correctly.
  return new Date(year, month, dom, 12, 0, 0, 0).getTime();
};
// ---------- row (memo) ----------
const PrayerRequest = memo(function PrayerRequest({ item }) {
  const flagName = item.flag || item.logo;
  const showFlag = !!item.country && !!flagName;

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          {showFlag ? (
            <FlagIcon name={flagName} height={THUMB_H} width={THUMB_W} />
          ) : (
            <Image
              source={item.url ? { uri: item.url } : defaultImage}
              style={{ height: THUMB_H, width: THUMB_W }}
            />
          )}
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.body}>{item.text}</Text>
        </View>
      </View>
      <Divider style={styles.divider} />
    </View>
  );
});

// ---------- main ----------
export default function Community(props) {
  const subscriptions = props?.listofsubscriptions || [];
  const [allPrayers, setAllPrayers] = useState([]);

  // Fetch remote (Firestore) then merge with local static
  useEffect(() => {
    let mounted = true;

    const chunk = (arr, size) => {
      const out = [];
      for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
      return out;
    };

    const fetchForIds = async (ids) => {
      const groups = chunk(ids, 10); // Firestore 'in' supports up to 10 values
      const rows = [];
      for (const subset of groups) {
        const q = query(
          collection(db, "maincollection"),
          where("ministryId", "in", subset)
        );
        const snap = await getDocs(q);
        snap.forEach((doc) => {
          const raw = doc.data() || {};
          rows.push({
            id: doc.id,
            ...raw,
            time: toMillis(raw.time), // keep numeric ms if present
          });
        });
      }
      return rows;
    };

    const load = async () => {
      if (!subscriptions.length) {
        if (mounted) setAllPrayers([]);
        return;
      }

      try {
        // remote
        const remote = await fetchForIds(subscriptions);

        // get today's date
        let today = new Date();
        // local/static (each may have `day` and/or `time`)
        const local = (staticData || []).map(normalizeLocal);

        // merge → filter to subscribed → compute display time
        const merged = [...local, ...remote]
          .filter((p) => subscriptions.includes(p.ministryId))
          .map((p) => ({ ...p, _time: toMillis(p.time) }))
          .filter((p) => p._time != null)
          .sort((a, b) => b._time - a._time); // newest first

        if (mounted) setAllPrayers(merged);
      } catch (e) {
        console.log("Error fetching prayers:", e);
        if (mounted) setAllPrayers([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [subscriptions]);

  // Build sections: Today (>= startOfToday), This Week (last 7 days, < today)
  const sections = useMemo(() => {
    if (!subscriptions.length) return [];

    const todayStart = startOfToday();
    const tomorrowStart = startOfTomorrow();
    const weekStart = startOfWeekWindow();

    const today = [];
    const week = [];

    for (const item of allPrayers) {
      const t = item._time;
      if (t == null) continue;

      if (t >= todayStart && t < tomorrowStart) {
        today.push(item);
      } else if (t >= weekStart && t < todayStart) {
        week.push(item);
      }
    }

    const out = [];
    if (today.length) out.push({ title: "Today", data: today });
    if (week.length) out.push({ title: "This Week", data: week });

    // Optional: if nothing recent, show an "Earlier" bucket (comment out if you don't want it)
    if (!out.length && allPrayers.length) {
      out.push({ title: "Earlier", data: allPrayers.slice(0, 20) });
    }
    // Debug (safe):
    console.log("Today:", today.length, "This Week:", week.length);
    return out;
  }, [allPrayers, subscriptions]);

  // renderers (memoized)
  const renderItem = useCallback(
    ({ item }) => <PrayerRequest item={item} />,
    []
  );
  const renderSectionHeader = useCallback(
    ({ section }) => (
      <>
        <BlurView intensity={10} style={styles.headerWrap}>
          <Text style={styles.headerText}>{section.title}</Text>
        </BlurView>
      </>
    ),
    []
  );
  const keyExtractor = useCallback(
    (item, index) =>
      String(item.id ?? item.uniqueid ?? item._localKey ?? item._time ?? index),
    []
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          {subscriptions.length
            ? "No recent prayers."
            : "Subscribe to a Prayer List by using the search feature below."}
        </Text>
      </View>
    ),
    [subscriptions.length]
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      ListEmptyComponent={ListEmpty}
      contentContainerStyle={{ paddingBottom: BOTTOM_SPACER }}
      stickySectionHeadersEnabled
      // perf tuning
      initialNumToRender={10}
      maxToRenderPerBatch={12}
      windowSize={10}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
    />
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignContent: "center",
    marginLeft: "8%",
    marginTop: "3%",
  },
  avatarWrap: {
    borderRadius: Math.round(W + H) / 2,
    backgroundColor: "#1e2427",
    width: AVATAR_W,
    height: AVATAR_H,
    justifyContent: "center",
    overflow: "hidden",
  },
  textWrap: {
    flexDirection: "column",
    marginTop: "auto",
    marginBottom: "auto",
    marginLeft: "6%",
    width: W * 0.65,
    marginRight: "15%",
  },
  title: { fontWeight: "600", fontSize: 16 },
  body: { flexWrap: "wrap" },

  divider: {
    borderColor: "#fbfafa",
    borderWidth: 1,
    marginTop: "3%",
  },

  headerWrap: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    backgroundColor: "#fbfafa90",
    minHeight: 44,
    paddingVertical: 20,
    textAlign: "center",
    justifyContent: "center",
  },

  headerText: {
    fontSize: 18,
    alignSelf: "center",
    fontWeight: "600",
    textTransform: "uppercase",
    width: "100%",
    textAlign: "center",
  },

  emptyWrap: { height: H, justifyContent: "center" },
  emptyText: {
    fontSize: 20,
    padding: "12%",
    fontWeight: "600",
    borderColor: "grey",
    borderWidth: 1,
    textAlign: "center",
    color: "#1e2427",
  },
});
