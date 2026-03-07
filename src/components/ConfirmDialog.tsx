import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

interface Props {
    visible: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function ConfirmDialog({
    visible,
    title,
    message,
    onCancel,
    onConfirm
}: Props) {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View className="flex-1 justify-center items-center bg-black/60">

                <View className="bg-black border border-gray-500 p-6 rounded-2xl w-[85%]">

                    <Text className="text-red-500 text-[20px]  text-center font-bold mb-2">
                        {title}
                    </Text>

                    <Text className="text-gray-300 text-center text-[16px] mb-6">
                        {message}
                    </Text>

                    <View className="flex-row justify-center gap-4">

                        <TouchableOpacity
                            onPress={onCancel}
                            className="px-4 py-2 rounded-lg bg-gray-700"
                        >
                            <Text className="text-white text-[16px] font-semibold">Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            className="px-4 py-2 rounded-lg bg-red-600"
                        >
                            <Text className="text-white text-[16px] font-semibold">Eliminar</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </View>
        </Modal>
    );
};