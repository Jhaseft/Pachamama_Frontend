import { View, Text, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    label: string;
    icon: string;
    value: string;
    editing: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean;
    onChange: (val: string) => void;
    isLast?: boolean;
}

export default function AnfitrionaEditField({ label, icon, value, editing, keyboardType = 'default', multiline, onChange, isLast }: Props) {
    return (
        <View className={`flex-row px-4 py-4 gap-3 ${!isLast ? 'border-b border-zinc-800' : ''} ${multiline ? 'items-start' : 'items-center'}`}>
            <View className={`w-9 h-9 rounded-xl bg-[#1a0505] items-center justify-center ${multiline ? 'mt-1' : ''}`}>
                <MaterialCommunityIcons name={icon as any} size={18} color="#A11B1B" />
            </View>
            <View className="flex-1">
                <Text className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">{label}</Text>
                {editing ? (
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        className="text-white text-[15px] font-semibold"
                        style={{ borderBottomWidth: 1, borderBottomColor: '#A11B1B', paddingVertical: 4, minHeight: multiline ? 60 : undefined }}
                        placeholderTextColor="#52525b"
                    />
                ) : (
                    <Text className="text-white text-[15px] font-semibold">{value || '—'}</Text>
                )}
            </View>
        </View>
    );
}
