import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    TextInput
} from "react-native";

interface Props {
    visible: boolean;
    selectedMedia: any;
    credits: string;
    uploading: boolean;
    onChangeCredits: (value: string) => void;
    onClose: () => void;
    onPublish: () => void;
}

export default function  CreateHistoryModal({
    visible,
    selectedMedia,
    credits,
    uploading,
    onChangeCredits,
    onClose,
    onPublish
}: Props) {
    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/80 px-6">
                <View className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden">

                    {/* Header */}
                    <View className="bg-zinc-800 p-4 border-b border-zinc-700">
                        <Text className="text-white text-center font-bold">
                            Crear nueva publicación
                        </Text>
                    </View>

                    <View className="p-4 items-center">

                        {/* Preview */}
                        {selectedMedia && (
                            <View className="w-full h-64 bg-black rounded-xl overflow-hidden border border-zinc-700">
                                <Image
                                    source={{ uri: selectedMedia.uri }}
                                    className="w-full h-full"
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        {/* Credits input */}
                        <View className="flex-row items-center bg-red-600 rounded-lg mt-6 px-4 py-3 w-full border border-white/20">
                            <Text className="text-white font-bold flex-1">
                                Créditos:
                            </Text>

                            <TextInput
                                className="text-white font-bold text-right flex-1 p-0"
                                keyboardType="numeric"
                                value={credits}
                                onChangeText={onChangeCredits}
                                placeholder="0"
                                placeholderTextColor="#ffcccc"
                            />
                        </View>

                        {/* Buttons */}
                        <View className="flex-row justify-between w-full mt-8 gap-4">

                            <TouchableOpacity
                                onPress={onClose}
                                className="flex-1 bg-red-600 py-3 rounded-lg border border-white/20 items-center"
                            >
                                <Text className="text-white font-bold">
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onPublish}
                                disabled={uploading}
                                className="flex-1 bg-red-600 py-3 rounded-lg border border-white/20 items-center"
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-bold">
                                        Publicar
                                    </Text>
                                )}
                            </TouchableOpacity>

                        </View>
                    </View>

                </View>
            </View>
        </Modal>
    );
};