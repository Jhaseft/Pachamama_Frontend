import { useRef } from "react";
import { Animated, PanResponder, View } from "react-native";

export function ZoomableImage({ uri, width, height }: { uri: string; width: number; height?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const currentScale = useRef(1);
  const currentTranslate = useRef({ x: 0, y: 0 });
  const imageHeight = height ?? width * 1.3;

  const getDist = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const getPanBounds = (nextScale: number) => ({
    x: Math.max(0, ((width * nextScale) - width) / 2),
    y: Math.max(0, ((imageHeight * nextScale) - imageHeight) / 2),
  });
  const clampTranslate = (x: number, y: number, nextScale: number) => {
    const bounds = getPanBounds(nextScale);
    return {
      x: clamp(x, -bounds.x, bounds.x),
      y: clamp(y, -bounds.y, bounds.y),
    };
  };
  const setTranslate = (x: number, y: number) => {
    translateX.setValue(x);
    translateY.setValue(y);
    currentTranslate.current = { x, y };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const t = evt.nativeEvent.touches;
        if (t.length === 2) {
          pinchRef.current = { dist: getDist(t), scale: currentScale.current };
          panRef.current = null;
        } else if (t.length === 1 && currentScale.current > 1) {
          panRef.current = {
            x: t[0].pageX,
            y: t[0].pageY,
            tx: currentTranslate.current.x,
            ty: currentTranslate.current.y,
          };
          pinchRef.current = null;
        } else {
          pinchRef.current = null;
          panRef.current = null;
        }
      },
      onPanResponderMove: (evt) => {
        const t = evt.nativeEvent.touches;
        if (t.length === 2) {
          panRef.current = null;
          if (!pinchRef.current) {
            pinchRef.current = { dist: getDist(t), scale: currentScale.current };
            return;
          }
          const newScale = Math.max(
            1,
            Math.min(4, pinchRef.current.scale * (getDist(t) / pinchRef.current.dist))
          );
          scale.setValue(newScale);
          currentScale.current = newScale;
          const clamped = clampTranslate(
            currentTranslate.current.x,
            currentTranslate.current.y,
            newScale
          );
          setTranslate(clamped.x, clamped.y);
          return;
        }
        pinchRef.current = null;
        if (t.length === 1 && currentScale.current > 1) {
          if (!panRef.current) {
            panRef.current = {
              x: t[0].pageX,
              y: t[0].pageY,
              tx: currentTranslate.current.x,
              ty: currentTranslate.current.y,
            };
          }
          const nextX = panRef.current.tx + (t[0].pageX - panRef.current.x);
          const nextY = panRef.current.ty + (t[0].pageY - panRef.current.y);
          const clamped = clampTranslate(nextX, nextY, currentScale.current);
          setTranslate(clamped.x, clamped.y);
          return;
        }
        panRef.current = null;
      },
      onPanResponderRelease: () => {
        pinchRef.current = null;
        panRef.current = null;
        if (currentScale.current < 1.1) {
          Animated.parallel([
            Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
          currentScale.current = 1;
          currentTranslate.current = { x: 0, y: 0 };
        } else {
          const clamped = clampTranslate(
            currentTranslate.current.x,
            currentTranslate.current.y,
            currentScale.current
          );
          setTranslate(clamped.x, clamped.y);
        }
      },
      onPanResponderTerminate: () => {
        pinchRef.current = null;
        panRef.current = null;
      },
    })
  ).current;

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      {...panResponder.panHandlers}
    >
      <Animated.Image
        source={{ uri }}
        style={{
          width,
          height: imageHeight,
          transform: [{ scale }, { translateX }, { translateY }],
        }}
        resizeMode="contain"
      />
    </View>
  );
}
