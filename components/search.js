import { useState, useCallback, useMemo } from "react";
import { View, TextInput, StyleSheet, FlatList } from "react-native";
import { minlist } from "./prayerdata";
import Contributor from "./Contributor";

export default function Search(props) {
  // const Navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [subscriptions, setSubscriptions] = useState(props.listofsubscriptions);
  const [lom, setLom] = useState([...minlist, ...props.dbMins]);

  const updateSearch = (info) => {
    let lower = info.toLowerCase();
    setSearch(lower);
  };

  const updateSubscriptions = (id) => {
    if (subscriptions.includes(id)) {
      console.log("trying to remove subscription " + id);
      let lox = [...subscriptions];
      let index = lox.indexOf(id);
      lox.splice(index, 1);
      props.setlistofsubscriptions(lox);
      setSubscriptions(lox);
    } else {
      props.setlistofsubscriptions([...subscriptions, id]);
      setSubscriptions([...subscriptions, id]);

      console.log("adding subscription " + id);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return lom;
    const q = search.trim().toLowerCase();
    return lom.filter((item) => item.name.toLowerCase().includes(q));
  }, [search]);

  const renderItem = useCallback(
    ({ item }) => (
      <Contributor
        item={item}
        subscriptions={subscriptions}
        updateSubscriptions={updateSubscriptions}
      />
    ),
    [subscriptions, updateSubscriptions]
  );

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={search}
        placeholder="Search..."
        onChangeText={updateSearch}
        style={styles.searchBar}
      />
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, id) => id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    width: "90%",
    height: 44,
    backgroundColor: "white",
    boxShadow: "1px 1px 10px #efefefa4",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    marginVertical: 10,
  },
});
