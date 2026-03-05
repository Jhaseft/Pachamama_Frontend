import { Text } from "react-native";
import Screen from "../../components/Screen";

export default function HomeClient() {
  return (
    <Screen pad={false} className="items-center justify-center">
      <Text className="text-white text-2xl font-semibold">Home Cliente</Text>
      <Text className="text-white/60 mt-2">Llegaste OK</Text>
    </Screen>
  );
}