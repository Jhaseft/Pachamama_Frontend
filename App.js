import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TouchableHighlight,
  Pressable,
} from "react-native";
import icon from "./assets/icon.png";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Pressable
        onPress={() => {

        }}
        style={{
          backgroundColor: "#fff",
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: "#000", fontSize: 16 }}>Press Me</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
});
