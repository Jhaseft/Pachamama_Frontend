import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    editing: boolean;
    saving: boolean;
    paddingTop: number;
    onBack: () => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function AnfitrionaDetailHeader({ editing, saving, paddingTop, onBack, onEdit, onSave, onCancel }: Props) {
    return (
        <View className="flex-row items-center gap-3 px-4 pb-4" style={{ paddingTop }}>
            <TouchableOpacity onPress={onBack} className="bg-[#1a1a1a] rounded-full p-2">
                <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-lg font-black flex-1">Detalle Anfitriona</Text>

            <TouchableOpacity
                onPress={editing ? onSave : onEdit}
                disabled={saving}
                className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${editing ? 'bg-[#A11B1B]' : 'bg-[#1a1a1a]'}`}
            >
                {saving
                    ? <ActivityIndicator size="small" color="white" />
                    : <MaterialCommunityIcons name={editing ? 'content-save' : 'pencil'} size={16} color="white" />
                }
                <Text className="text-white text-xs font-bold">
                    {saving ? 'Guardando...' : editing ? 'Guardar' : 'Editar'}
                </Text>
            </TouchableOpacity>

            {editing && (
                <TouchableOpacity onPress={onCancel} className="bg-[#1a1a1a] rounded-full p-2">
                    <MaterialCommunityIcons name="close" size={18} color="#6b7280" />
                </TouchableOpacity>
            )}
        </View>
    );
}
