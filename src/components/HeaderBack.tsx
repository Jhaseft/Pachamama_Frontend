import { Pressable, Text } from "react-native";
import { Link } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

interface Props {
  href: string;
  title: string;
}

export default function HeaderBack({ href, title }: Props) {
  return (
    <Link asChild href={href}>
      <Pressable className="flex-row items-center mb-3">
        <AntDesign name="arrow-left" size={22} color="white" />
        <Text className="text-white text-2xl font-black ml-2">
          {title}
        </Text>
      </Pressable>
    </Link>
  );
}