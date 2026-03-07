import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function SearchInput({
    value,
    onChangeText,
    placeholder = "Buscar...",
}: SearchInputProps) {
    return (
        <View className="flex-row items-center bg-[#A11213] rounded-full px-4 py-1 mb-6">
            <Ionicons name="search" size={24} color="black" />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#333"
                className="flex-1 ml-2 text-black font-medium text-[15px]"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
};