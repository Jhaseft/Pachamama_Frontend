import { Pressable, Text } from "react-native";

type Props = {
  onPress: () => void;
};

export default function RechargeHeaderButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-secondary border border-primary-purple rounded-full px-4 py-[6px] mr-1 active:opacity-80"
    >
      <Text className="text-white text-[13px] font-extrabold">Recargar</Text>
    </Pressable>
  );
}
