import { Pressable, Text } from "react-native";

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  className = "",
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`bg-red-600 rounded-full py-4 items-center ${
        disabled ? "opacity-50" : "opacity-100"
      } ${className}`}
    >
      <Text className="text-white text-base font-semibold">{title}</Text>
    </Pressable>
  );
}