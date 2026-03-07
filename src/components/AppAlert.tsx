import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

interface Props {
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}

export default function AppAlert({ visible, title, message, type = "success", onClose }: Props) {
    const color = type === "success" ? "bg-green-600" : "bg-red-600";

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View className="flex-1 justify-center items-center bg-black/60">

                <View className="bg-black p-6 rounded-2xl w-[85%] border border-gray-500">
                    <View className={`${color} px-4 py-2 rounded-xl mb-3`}>
                        <Text className="text-white text-center font-bold text-lg">{title}</Text>
                    </View>

                    <Text className="text-white mb-4">{message}</Text>

                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-red-700 py-3 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold">Aceptar</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};