import React, { useRef, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    TextInput,
    Animated,
    Easing
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    visible: boolean;
    selectedMedia: any;
    credits: string;
    uploading: boolean;
    onChangeCredits: (value: string) => void;
    onClose: () => void;
    onPublish: () => void;
}

export default function CreateHistoryModal({
    visible,
    selectedMedia,
    credits,
    uploading,
    onChangeCredits,
    onClose,
    onPublish
}: Props) {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 70,
                friction: 10,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible, scaleAnim]);

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, { width: '100%', maxWidth: 320 }]}>
                    <View style={{ backgroundColor: '#0a0f1f', borderRadius: 24, overflow: 'hidden', borderWidth: 1}}>

                        <LinearGradient
                            colors={['#1a0a2e', '#0f0f1e']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(168,68,242,0.2)' }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#a844f2', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>
                                        Nueva Historia
                                    </Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 1 }}>
                                        Comparte contenido exclusivo
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
                                    <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

                        <View style={{ padding: 14, gap: 12, width: '100%' }}>

                            {selectedMedia && (
                                <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 2, alignSelf: 'center', width: '100%' }}>
                                    <View style={{ width: '100%', height: 200, backgroundColor: '#000000' }}>
                                        <Image
                                            source={{ uri: selectedMedia.uri }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    </View>
                                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                        <Text style={{ color: '#f03eb3', fontSize: 10, fontWeight: '700' }}>
                                            {selectedMedia.type === 'video' ? '🎥 Video' : '📸 Foto'}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={{ gap: 6 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' }}>
                                        💰 Precio
                                    </Text>
                                    <Text style={{ color: '#a844f2', fontSize: 11, fontWeight: '700' }}>
                                        {credits === '0' || credits === '' ? 'Gratis' : `${credits} cr`}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a0a2e', borderRadius: 10, borderWidth: 1, borderColor: '#a844f2', paddingHorizontal: 12, paddingVertical: 10, gap: 6, width: '100%' }}>
                                    <MaterialCommunityIcons name="cash" size={18} color="#a844f2" />
                                    <TextInput
                                        style={{ flex: 1, color: 'white', fontSize: 14, fontWeight: '700', padding: 0 }}
                                        keyboardType="numeric"
                                        value={credits}
                                        onChangeText={onChangeCredits}
                                        placeholder="0"
                                        placeholderTextColor="rgba(168,68,242,0.4)"
                                    />
                                </View>
                            </View>

                            {/* Info box */}
                            <View style={{ backgroundColor: 'rgba(168,68,242,0.1)', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#a844f2', paddingHorizontal: 10, paddingVertical: 8, width: '100%' }}>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, lineHeight: 14 }}>
                                    <Text style={{ fontWeight: '700', color: '#a844f2' }}>💡</Text> Historias con precio = más ingresos
                                </Text>
                            </View>

                            {/* Buttons */}
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, width: '100%' }}>
                                <TouchableOpacity
                                    onPress={onClose}
                                    disabled={uploading}
                                    style={{ flex: 1 }}
                                >
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, borderWidth: 1, borderColor: '#132673', paddingVertical: 11, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#132673', fontWeight: '700', fontSize: 12 }}>
                                            Cancelar
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onPublish}
                                    disabled={uploading}
                                    style={{ flex: 1 }}
                                >
                                    <LinearGradient
                                        colors={['#a844f2', '#7209b7']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{ borderRadius: 10, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {uploading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <MaterialCommunityIcons name="cloud-upload" size={16} color="white" />
                                                <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>
                                                    Publicar
                                                </Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                        </View>

                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};