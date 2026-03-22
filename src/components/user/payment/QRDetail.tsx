import { View, Image } from "react-native";

export const QRDetail = ({ qrUrl }: { qrUrl: string }) => (
    <View className="items-center justify-center my-4">
        <View className="bg-white p-4 rounded-[40px] w-64 h-64 items-center justify-center">
            <Image
                source={{ uri: qrUrl }}
                className="w-full h-full"
                resizeMode="contain"
            />
        </View>
    </View>
);
