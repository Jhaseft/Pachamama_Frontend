import { View, Text, Image } from "react-native";

type Role = "anfitriona" | "cliente";

type Props = {
  title: string;
  role: Role;
};

export default function HeaderTitle({ title, role }: Props) {



  return (
    <View className="flex-1 flex-row items-center bg-black px-2.5">
      {role === 'cliente' ? (
        <>
          <View>
            <Image
              source={require("../../assets/BlackandWhiteXLetterDigital.jpg")}
              className="w-[100px] h-[100px]"
              resizeMode="contain"
            />
          </View>

          <View className="flex-1 items-center">
            <Text className="text-[30px] font-black italic text-white">
              {title}
            </Text>
          </View>
        </>
      ) : (
        <>

          <View className="flex-1 items-center">
            <Text className="text-[30px] font-black italic text-white">
              {title}
            </Text>
          </View>

          <View>
            <Image
              source={require("../../assets/BlackandWhiteXLetterDigital.jpg")}
              className="w-[100px] h-[100px]"
              resizeMode="contain"
            />
          </View>
        </>
      )}


    </View>
  );
}