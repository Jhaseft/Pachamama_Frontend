import { useState } from "react";
import { Alert } from "react-native";
import { unlockGalleryImage } from "../services/hostesses";

/**
 * Hook que gestiona el flujo de desbloqueo de una imagen premium.
 *
 * Uso:
 *   const { unlockImage, unlockingImageId } = useUnlockImage();
 *   unlockImage(anfitrionaId, imageId, () => onSuccess(imageId));
 */
export function useUnlockImage() {
  const [unlockingImageId, setUnlockingImageId] = useState<string | null>(null);

  const unlockImage = async (
    anfitrionaId: string,
    imageId: string,
    onSuccess: () => void,
  ) => {
    if (unlockingImageId) return; // evitar doble tap
    setUnlockingImageId(imageId);
    try {
      await unlockGalleryImage(anfitrionaId, imageId);
      onSuccess();
    } catch (e) {
      const raw = e instanceof Error ? e.message : "";
      const isInsufficientCredits =
        raw.toLowerCase().includes("insuficiente") ||
        raw.toLowerCase().includes("insufficient");
      Alert.alert(
        isInsufficientCredits ? "Créditos insuficientes" : "Error",
        isInsufficientCredits
          ? "No tienes suficientes créditos para desbloquear esta foto."
          : raw || "No se pudo desbloquear la imagen. Intenta de nuevo.",
      );
    } finally {
      setUnlockingImageId(null);
    }
  };

  return { unlockImage, unlockingImageId };
}
