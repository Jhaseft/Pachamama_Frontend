import React, { useEffect } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video'; // <--- Nueva librería
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';

export const HistoryViewer = ({ isVisible, item, onClose, onDelete }: any) => {
    const insets = useSafeAreaInsets();

    // Configuramos el reproductor nuevo
    const player = useVideoPlayer(item?.mediaUrl, (player) => {
        player.loop = true;
        player.muted = false;
        if (isVisible) player.play();
    });

    // Escuchamos cuando el video termina
    useEffect(() => {
        const subscription = player.addListener('playToEnd', () => {
            console.log('Video finalizado, cerrando visor...');
            onClose();
        });

        return () => {
            subscription.remove();
        };
    }, [player, onClose]);

    //controlamos que la imagen se cierre despues de 5 segundos
    useEffect(() => {
        if (isVisible && item?.mediaType === 'IMAGE') {
            const timer = setTimeout(() => {
                onClose();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, item, onClose]);

    // Controlamos el play/pause según la visibilidad del Modal
    useEffect(() => {
        if (isVisible && item?.mediaType === 'VIDEO') {
            player.play();
        } else {
            player.pause();
        }
    }, [isVisible, item]);

    if (!item) return null;

    return (
        <Modal visible={isVisible} transparent={false} animationType="fade" statusBarTranslucent>
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

                <View style={[styles.topBar, { top: insets.top + 10 }]}>
                    
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        style={styles.actionButton}
                    >
                        <MaterialCommunityIcons name="delete-outline" size={26} color="#ef4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.actionButton}
                    >
                        <MaterialCommunityIcons name="close" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {item.mediaType === "VIDEO" ? (
                        <VideoView
                            player={player}
                            style={styles.media}
                            contentFit="contain" 
                            allowsFullscreen={false}
                            allowsPictureInPicture={false}
                        />
                    ) : (
                        <Image
                            source={{ uri: item.mediaUrl }}
                            style={styles.media}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 25,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: '100%',
        height: '100%',
    },

    topBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end', 
        paddingHorizontal: 20,
        zIndex: 100,
    },
    actionButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 25,
    }
});