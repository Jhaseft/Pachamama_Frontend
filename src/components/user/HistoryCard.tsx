import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const HistoryCard = ({
    item,
    onPress,
    onDelete
}: {
    item: any,
    onPress: () => void,
    onDelete: () => void
}) => {


    const getVideoThumbnail = (url: string) => {
        if (!url) return "";

        return url
            .replace("/video/upload/", "/video/upload/so_1/")
            .replace(".mp4", ".jpg");
    };

    const isVideo = item.mediaType?.toUpperCase() === "VIDEO";


    const imageUri = isVideo
        ? getVideoThumbnail(item.mediaUrl)
        : item.mediaUrl;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-1 aspect-square m-0.5 bg-zinc-900 overflow-hidden"
        >
            <Image
                source={{ uri: imageUri }}
                resizeMode="cover"
                className={`w-full h-full ${item.isLocked ? 'opacity-100' : 'opacity-100'}`}
                onError={(e) => console.log("Image error:", e.nativeEvent)}
            />

            {item.mediaType === "VIDEO" && (
                <View className="absolute bottom-2 left-2">
                    <MaterialCommunityIcons
                        name="play-circle"
                        size={26}
                        color="white"
                    />
                </View>
            )}

            <TouchableOpacity
                onPress={onDelete}
                className="absolute top-2 right-2 z-10 bg-black/20 p-1.5 rounded-full"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialCommunityIcons name="delete" size={22} color="#ef4444" />
            </TouchableOpacity>

            {item.isLocked && (
                <View className="absolute inset-0 justify-center items-center">
                    <View className="bg-black/30 p-4 rounded-2xl">
                        <Text className="text-3xl">🔒</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );

};