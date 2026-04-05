import { useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiEditAnfitriona } from '@/src/api/anfitriona';
import AnfitrionaDetailHeader from '@/src/components/admin/anfitriona/AnfitrionaDetailHeader';
import AnfitrionaDetailProfile from '@/src/components/admin/anfitriona/AnfitrionaDetailProfile';
import AnfitrionaPhoneField, { parsePhone } from '@/src/components/admin/anfitriona/AnfitrionaPhoneField';
import AnfitrionaEditField from '@/src/components/admin/anfitriona/AnfitrionaEditField';

export default function AnfitrionaDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        id: string; firstName: string; lastName: string; phoneNumber: string;
        isActive: string; balance: string; username: string; avatarUrl: string;
        bio: string; rateCredits: string; isOnline: string; email: string;
    }>();

    const isActive = params.isActive === 'true';
    const isOnline = params.isOnline === 'true';
    const balance = parseFloat(params.balance ?? '0');

    const parsed = parsePhone(params.phoneNumber ?? '');
    const [countryCode, setCountryCode] = useState(parsed.code);
    const [phoneNumber, setPhoneNumber] = useState(parsed.number);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        username: params.username ?? '',
        bio: params.bio ?? '',
        rateCredits: params.rateCredits ?? '',
        email: params.email ?? '',
    });
    const savedFormRef = useRef(form);
    const savedPhoneRef = useRef({ code: parsed.code, number: parsed.number });

    const handleCancel = () => {
        setForm(savedFormRef.current);
        setCountryCode(savedPhoneRef.current.code);
        setPhoneNumber(savedPhoneRef.current.number);
        setEditing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiEditAnfitriona(params.id, {
                phoneNumber: countryCode + phoneNumber || undefined,
                username: form.username || undefined,
                bio: form.bio || undefined,
                rateCredits: form.rateCredits ? Number(form.rateCredits) : undefined,
                email: form.email || undefined,
            });
            // Update saved refs so cancel/re-edit shows the latest saved values
            savedFormRef.current = { ...form };
            savedPhoneRef.current = { code: countryCode, number: phoneNumber };
            Alert.alert('✅ Éxito', 'Datos actualizados correctamente');
            setEditing(false);
        } catch (e: any) {
            Alert.alert('Error', typeof e === 'string' ? e : 'No se pudo actualizar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="flex-1 bg-[#0f0f0f]">

                <AnfitrionaDetailHeader
                    editing={editing}
                    saving={saving}
                    paddingTop={insets.top + 12}
                    onBack={() => router.back()}
                    onEdit={() => setEditing(true)}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 400 }}>

                    <AnfitrionaDetailProfile
                        firstName={params.firstName ?? ''}
                        lastName={params.lastName ?? ''}
                        avatarUrl={params.avatarUrl ?? ''}
                        isActive={isActive}
                        isOnline={isOnline}
                        balance={balance}
                    />

                    <View className="bg-[#141414] rounded-2xl border border-zinc-800 overflow-hidden">
                        <AnfitrionaPhoneField
                            editing={editing}
                            countryCode={countryCode}
                            phoneNumber={phoneNumber}
                            onChangeCode={setCountryCode}
                            onChangeNumber={setPhoneNumber}
                        />
                        <AnfitrionaEditField label="Nombre de Usuario" icon="account-outline" value={form.username} editing={editing} onChange={(v) => setForm(p => ({ ...p, username: v }))} />
                        <AnfitrionaEditField label="Biografía" icon="text-box-outline" value={form.bio} editing={editing} onChange={(v) => setForm(p => ({ ...p, bio: v }))} multiline />
                        <AnfitrionaEditField label="Créditos de Calificación" icon="diamond-stone" value={form.rateCredits} editing={editing} onChange={(v) => setForm(p => ({ ...p, rateCredits: v }))} keyboardType="numeric" />
                        <AnfitrionaEditField label="Email" icon="email-outline" value={form.email} editing={editing} onChange={(v) => setForm(p => ({ ...p, email: v }))} keyboardType="email-address" isLast />
                    </View>

                    <Text className="text-zinc-500 text-center py-4">
                        Puedes actualizar la información de la anfitriona utilizando el modo edición.
                    </Text>

                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
