import { Text } from "react-native";
import Screen from "../../components/Screen";

export default function HomeAdmin() {
  return (
    <Screen pad={false} className="items-center justify-center">
      <Text className="text-white text-2xl font-semibold">Home Admin</Text>
      <Text className="text-white/60 mt-2">Llegaste OK</Text>
    </Screen>
  );
}