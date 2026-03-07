import React from 'react';
import { View } from 'react-native';
import BottomNav from '../components/BottonNav';


interface Props {
    children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
    return (
        <View className="flex-1 bg-black">

            <View className="flex-1">
                {children}
            </View>

                <BottomNav />
        </View>
    );
};