import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const MIN_SCALE = 1;
const MAX_SCALE = 5;

// ─── ZoomableImage ─────────────────────────────────────────────────────────────
// Handles pinch, pan, double-tap and single-tap for a single image.

type ZoomableImageProps = {
  uri: string;
  onClose: () => void;
  onZoomChange: (zoomed: boolean) => void;
};

function ZoomableImage({ uri, onClose, onZoomChange }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedOffsetX = useSharedValue(0);
  const savedOffsetY = useSharedValue(0);

  function resetZoom() {
    "worklet";
    scale.value = withSpring(1, { damping: 20 });
    savedScale.value = 1;
    offsetX.value = withSpring(0, { damping: 20 });
    offsetY.value = withSpring(0, { damping: 20 });
    savedOffsetX.value = 0;
    savedOffsetY.value = 0;
  }

  // Pinch to zoom
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(MIN_SCALE, Math.min(savedScale.value * e.scale, MAX_SCALE));
    })
    .onEnd(() => {
      if (scale.value < 1.15) {
        resetZoom();
        runOnJS(onZoomChange)(false);
      } else {
        savedScale.value = scale.value;
        runOnJS(onZoomChange)(true);
      }
    });

  // Pan to move when zoomed
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        offsetX.value = savedOffsetX.value + e.translationX;
        offsetY.value = savedOffsetY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  // Double tap: zoom in (2x) or reset if already zoomed
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(250)
    .onEnd((e) => {
      if (scale.value > 1) {
        resetZoom();
        runOnJS(onZoomChange)(false);
      } else {
        // Zoom into tapped point
        const targetScale = 2.5;
        const tapX = e.x - SCREEN_W / 2;
        const tapY = e.y - SCREEN_H / 2;
        scale.value = withSpring(targetScale, { damping: 20 });
        savedScale.value = targetScale;
        offsetX.value = withSpring(-tapX * (targetScale - 1), { damping: 20 });
        offsetY.value = withSpring(-tapY * (targetScale - 1), { damping: 20 });
        savedOffsetX.value = -tapX * (targetScale - 1);
        savedOffsetY.value = -tapY * (targetScale - 1);
        runOnJS(onZoomChange)(true);
      }
    });

  // Single tap: close only when not zoomed
  const singleTap = Gesture.Tap()
    .onEnd(() => {
      if (scale.value <= 1) {
        runOnJS(onClose)();
      }
    });

  const gesture = Gesture.Simultaneous(
    pinch,
    pan,
    Gesture.Exclusive(doubleTap, singleTap),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            width: SCREEN_W,
            height: SCREEN_H,
            justifyContent: "center",
            alignItems: "center",
          },
          animatedStyle,
        ]}
      >
        <Image
          source={{ uri }}
          style={{ width: SCREEN_W, height: SCREEN_H * 0.82 }}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

// ─── ImageViewerModal ──────────────────────────────────────────────────────────

type Props = {
  images: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
};

export default function ImageViewerModal({
  images,
  initialIndex = 0,
  visible,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const listRef = useRef<FlatList>(null);

  function handleShow() {
    if (listRef.current && images.length > 1) {
      listRef.current.scrollToIndex({ index: initialIndex, animated: false });
    }
    setActiveIndex(initialIndex);
    setIsZoomed(false);
  }

  function handleScroll(event: any) {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_W);
    setActiveIndex(index);
    setIsZoomed(false);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onShow={handleShow}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.97)" }}>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: insets.top + 10,
              right: 16,
              zIndex: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "300" }}>✕</Text>
          </TouchableOpacity>

          {/* Hint de zoom — desaparece cuando está zoomeado */}
          {!isZoomed && images.length > 0 && (
            <Text
              style={{
                position: "absolute",
                bottom: insets.bottom + (images.length > 1 ? 52 : 28),
                left: 0,
                right: 0,
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: 11,
              }}
            >
              Pellizca para hacer zoom · Doble toque para ampliar
            </Text>
          )}

          {/* Imágenes con zoom */}
          <FlatList
            ref={listRef}
            data={images}
            horizontal
            pagingEnabled
            scrollEnabled={!isZoomed}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={handleScroll}
            getItemLayout={(_, index) => ({
              length: SCREEN_W,
              offset: SCREEN_W * index,
              index,
            })}
            renderItem={({ item }) => (
              <ZoomableImage
                uri={item}
                onClose={onClose}
                onZoomChange={setIsZoomed}
              />
            )}
          />

          {/* Dots */}
          {images.length > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: insets.bottom + 24,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {images.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === activeIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      i === activeIndex ? "white" : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </View>
          )}

          {/* Contador */}
          {images.length > 1 && (
            <Text
              style={{
                position: "absolute",
                top: insets.top + 14,
                left: 0,
                right: 0,
                textAlign: "center",
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
              }}
            >
              {activeIndex + 1} / {images.length}
            </Text>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
