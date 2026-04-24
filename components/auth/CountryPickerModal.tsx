import { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COUNTRIES_LATAM, type CountryLatam } from "../../src/constants/countriesLatam";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelect: (country: CountryLatam) => void;
};

export default function CountryPickerModal({ visible, onClose, onSelect }: Props) {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (!visible) setQuery("");
    }, [visible]);

    const filtered = COUNTRIES_LATAM.filter((c) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            c.name.toLowerCase().includes(q) ||
            c.dialCode.startsWith(q.replace("+", ""))
        );
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View className="flex-1 bg-black/60">
                <Pressable className="flex-1" onPress={onClose} />
                <View className="bg-neutral-900 border border-white/10 rounded-t-2xl p-4 max-h-[80%]">
                    <Text className="text-white text-lg font-bold mb-3">
                        Selecciona un país
                    </Text>

                    <View className="flex-row items-center bg-white/10 rounded-xl px-3 mb-3 h-10">
                        <Ionicons name="search" size={16} color="rgba(255,255,255,0.5)" />
                        <TextInput
                            className="flex-1 text-white ml-2"
                            placeholder="Buscar país o código..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={query}
                            onChangeText={setQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery("")}>
                                <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
                            </Pressable>
                        )}
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.code}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: insets.bottom + 10 }}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                                className="flex-row items-center justify-between py-3 border-b border-white/10"
                            >
                                <Text className="text-white">{item.name}</Text>
                                <Text className="text-white/70">+{item.dialCode}</Text>
                            </Pressable>
                        )}
                        ListEmptyComponent={
                            <Text className="text-white/50 text-center mt-6">
                                Sin resultados
                            </Text>
                        }
                    />
                </View>
            </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
