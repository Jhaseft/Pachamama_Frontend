import React from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ProfileHeader = ({ profile }: any) => (
    <View className="w-full">

        <ImageBackground source={{ uri: profile.cover }} className="h-52 w-full rounded-xl  justify-end items-end p-4">
            <TouchableOpacity className="bg-zinc-800/80 p-1.5 rounded-full border border-zinc-600">
                <MaterialCommunityIcons
                    name="camera"
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
        </ImageBackground>

        <View className="-mt-12 px-6 flex-row items-center">

            <View className="relative mr-5">
                <Image
                    source={{ uri: profile.avatar }}
                    className="w-28 h-28 rounded-full border-4 border-black"
                />

                <TouchableOpacity className="absolute bottom-0 p-1.5 right-0 bg-zinc-800  rounded-full border border-zinc-600">
                    <MaterialCommunityIcons
                        name="camera"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            <View className='mt-12'>
                <Text className="text-white text-2xl font-bold">
                    {profile.name}
                </Text>

                <View className="flex-row mt-1 space-x-4">
                    <Text className="text-zinc-400">
                        {profile.clients} clientes{"     "}
                    </Text>

                    <Text className="text-zinc-400">
                        {profile.diamonds} 💎
                    </Text>
                </View>
            </View>

        </View>
    </View>
);