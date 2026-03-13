import { View, Image, Text, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Video } from "expo-av";
import { apiMarkAsViewed } from "@/src/api/anfitrionaHistory";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function StoryViewer() {
    const router = useRouter();
    const { data } = useLocalSearchParams();
    const storyData = JSON.parse(data as string);

    const [index, setIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const videoRef = useRef<Video | null>(null);

    const current = storyData.stories[index];

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        useCallback(() => {

            setProgress(0);
            apiMarkAsViewed(current.id);

            if (current.type === "image") {
                intervalRef.current = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 1) {
                            handleNext();
                            return 1;
                        }
                        return prev + 0.01;
                    });
                }, 50);
            }


            if (current.type === "video" && videoRef.current) {

                videoRef.current.replayAsync();
            }

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (videoRef.current) videoRef.current.pauseAsync();
            };
        }, [index, current.id])
    );

    const handleNext = () => {
        if (index < storyData.stories.length - 1) {
            setProgress(0);
            setIndex(index + 1);
        } else {
            router.back();
        }
    };

    const handlePrev = () => {
        if (index > 0) {
            setProgress(0);
            setIndex(index - 1);
        }
    };

    return (
        <View style={styles.container}>

            {current.type === "image" ? (
                <Image
                    key={current.id}
                    source={{ uri: current.uri }}
                    style={styles.media}
                    resizeMode="cover"
                />
            ) : (
                <Video
                    key={current.id}
                    ref={videoRef}
                    source={{ uri: current.uri }}
                    style={styles.media}
                    resizeMode="cover"
                    shouldPlay={true}
                    progressUpdateIntervalMillis={50}
                    onPlaybackStatusUpdate={(status: any) => {
                        if (status.didJustFinish) handleNext();
                        if (status.isLoaded && status.durationMillis) {
                            setProgress(status.positionMillis / status.durationMillis);
                        }
                    }}
                />
            )}

            <LinearGradient
                colors={["rgba(0,0,0,0.6)", "transparent"]}
                style={styles.topGradient}
            />

            <TouchableOpacity style={styles.touchLeft} onPress={handlePrev} />
            <TouchableOpacity style={styles.touchRight} onPress={handleNext} />

            <View style={styles.progressContainer}>
                {storyData.stories.map((_: any, i: number) => (
                    <View key={i} style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                                },
                            ]}
                        />
                    </View>
                ))}
            </View>

            <View style={styles.header}>
                <Image source={{ uri: storyData.avatar }} style={styles.avatar} />
                <Text style={styles.username}>{storyData.name}</Text>

                <TouchableOpacity
                    style={{ marginLeft: "auto" }}
                    onPress={() => {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        videoRef.current?.pauseAsync();
                        router.back();
                    }}
                >
                    <Text style={{ color: "white", fontSize: 28 }}>×</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },

    progressContainer: {
        flexDirection: "row",
        position: "absolute",
        top: 50,
        left: 10,
        right: 10,
        zIndex: 20,
    },

    progressBarBackground: {
        flex: 1,
        height: 2,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginHorizontal: 2,
        borderRadius: 2,
    },

    topGradient: {
        position: "absolute",
        top: 0,
        width: "100%",
        height: 160,
        zIndex: 15,
    },

    progressBarFill: {
        height: 2,
        backgroundColor: "white",
        borderRadius: 2,
    },

    header: {
        position: "absolute",
        top: 70,
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        zIndex: 25, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5, 
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "white",
    },

    username: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },

    media: {
        width,
        height,
        position: "absolute",
    },

    touchLeft: {
        position: "absolute",
        left: 0,
        width: width * 0.3,
        height,
        zIndex: 10,
    },

    touchRight: {
        position: "absolute",
        right: 0,
        width: width * 0.7,
        height,
        zIndex: 10,
    },
});