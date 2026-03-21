import React from 'react';
import {
  Modal, View, Image, TouchableOpacity, Text, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GalleryItem } from '../../../types/gallery';

type Props = {
  item: GalleryItem | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: (item: GalleryItem) => void;
  onDelete?: (item: GalleryItem) => void;
  onSetFeatured?: (item: GalleryItem) => void;
};

export default function GalleryItemViewer({ item, visible, onClose, onEdit, onDelete, onSetFeatured }: Props) {
  const insets = useSafeAreaInsets();

  if (!item) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        {/* Botón cerrar */}
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { top: insets.top + 10 }]}
        >
          <MaterialCommunityIcons name="close" size={26} color="white" />
        </TouchableOpacity>

        {/* Imagen */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Barra inferior: tipo de foto + acciones */}
        <View style={styles.bottomBar}>
          {item.isPremium ? (
            <View style={styles.badgePremium}>
              <MaterialCommunityIcons name="lock" size={16} color="#ef4444" />
              <Text style={styles.badgePremiumText}>
                Foto exclusiva · {item.unlockCredits} créditos para desbloquear
              </Text>
            </View>
          ) : (
            <View style={styles.badgeNormal}>
              <MaterialCommunityIcons name="image-outline" size={16} color="#a1a1aa" />
              <Text style={styles.badgeNormalText}>
                {item.isVisible ? 'Foto normal · visible públicamente' : 'Foto oculta · no visible en tu perfil'}
              </Text>
            </View>
          )}

          {/* Botones de acción (solo si se pasan los callbacks) */}
          {(onSetFeatured || onEdit || onDelete) && (
            <View style={styles.actions}>
              {onSetFeatured && (
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnFeatured]} onPress={() => onSetFeatured(item)}>
                  <MaterialCommunityIcons name="star" size={18} color="#facc15" />
                  <Text style={[styles.actionBtnText, { color: '#facc15' }]}>Del feed</Text>
                </TouchableOpacity>
              )}
              {onEdit && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
                  <MaterialCommunityIcons name="pencil" size={18} color="white" />
                  <Text style={styles.actionBtnText}>Editar</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={() => onDelete(item)}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                  <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 25,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  badgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePremiumText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  badgeNormal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeNormalText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#27272a',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnFeatured: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#facc15',
  },
  actionBtnDanger: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
