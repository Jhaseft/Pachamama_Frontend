import { useEffect, useRef } from "react";
import { Animated, Easing, Image, View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logoSplash = require("../../assets/logoMonetizaLab.png");

export default function Splash() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulso continuo en el logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Texto aparece con fade
    Animated.timing(textFade, {
      toValue: 1,
      duration: 600,
      delay: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      router.replace("/(onboarding)/onboarding1");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Image source={logoSplash} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={{ opacity: textFade }}>
        <Text style={styles.text}>Cargando .....</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 160,
    height: 160,
  },
  text: {
    marginTop: 16,
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
});
