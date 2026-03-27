import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, UploadCloud, Send } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';

import { apiCreateDepositRequest } from "@/src/api/deposits";
import { apiGetPaymentMethods } from "@/src/api/paymentMethods";

import { PackageSummary } from "@/src/components/user/payment/PackageSummary";
import { TransferDetail } from "@/src/components/user/payment/TransferDetail";
import { QRDetail } from "@/src/components/user/payment/QRDetail";

export default function ConfirmarPagoScreen() {
    const router = useRouter();
    const { methodId, methodType, credits, price, packageId } = useLocalSearchParams();
    const [methodData, setMethodData] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingMethod, setFetchingMethod] = useState(true);
    const [selectedFile, setSelectedFile] = useState<any>(null);

    const uriToBlob = async (uri: string) => {
        const response = await fetch(uri);
        return await response.blob();
    };

    useEffect(() => {
        const fetchMethod = async () => {
            try {
                const methods = await apiGetPaymentMethods();
                const selected = methods.find((m: any) => String(m.id) === String(methodId));
                if (selected) setMethodData(selected);
            } catch (error) {
                console.error("Error cargando detalles del método:", error);
            } finally {
                setFetchingMethod(false);
            }
        };
        if (methodId) fetchMethod();
    }, [methodId]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.7,
        });
        if (!result.canceled) {
            const asset = result.assets[0];
            setImage(asset.uri);
            setSelectedFile(asset);
            Alert.alert("Éxito", "Comprobante seleccionado correctamente.");
        }
    };

    const handleSendRequest = async () => {
        if (!selectedFile) {
            Alert.alert("Atención", "Por favor, sube una foto de tu comprobante primero.");
            return;
        }
        setLoading(true);
        try {
            const blob = await uriToBlob(selectedFile.uri);
            const fileToUpload = {
                uri: selectedFile.uri,
                name: selectedFile.fileName || `comprobante_${Date.now()}.jpg`,
                type: selectedFile.mimeType || 'image/jpeg',
                blob,
            };
            await apiCreateDepositRequest({ packageId: packageId as string, paymentMethodId: methodId as string }, fileToUpload);
            Alert.alert(
                "¡Solicitud Enviada!",
                "Tu pago está en revisión. Te avisaremos cuando tus créditos se activen.",
                [{ text: "Entendido", onPress: () => router.replace("/(cliente)/perfil") }]
            );
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || error?.message || "No se pudo enviar el comprobante");
        } finally {
            setLoading(false);
        }
    };

    if (!methodId || !packageId) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white">Error: Datos de la transacción perdidos.</Text>
                <Pressable onPress={() => router.back()} className="mt-4 bg-white p-2 rounded">
                    <Text>Volver</Text>
                </Pressable>
            </View>
        );
    }

    if (fetchingMethod) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator color="#A11B1B" size="large" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-black" contentContainerStyle={{ paddingBottom: 40 }}>

            <View className="flex-row items-center px-5 pt-1 mb-2">
                <Pressable
                    onPress={() => router.back()}
                    disabled={loading}
                    className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center mr-4 active:opacity-50"
                    style={{ borderWidth: 1, borderColor: 'rgba(161,27,27,0.3)' }}
                >
                    <ArrowLeft color="white" size={20} />
                </Pressable>
                <View>
                    <Text className="text-white text-[20px] font-black">
                        {methodType === 'QR' ? 'Escanea el código QR' : 'Transfiere a esta cuenta'}
                    </Text>
                    <Text className="text-zinc-500 text-xs mt-0.5">Realiza el pago y sube tu comprobante</Text>
                </View>
            </View>

            <PackageSummary credits={credits as string} price={price as string} />

            {methodType === 'QR' ? (
                <QRDetail qrUrl={methodData?.qrImageUrl} />
            ) : (
                <TransferDetail
                    accountNumber={methodData?.accountNumber}
                    accountName={methodData?.accountName}
                />
            )}

            <View className="px-5 mt-6">
                <View className="items-center mb-3">
                    <Text className="text-white text-[18px] font-black tracking-wide">Sube tu comprobante</Text>
                    <View className="h-[2px] w-10 bg-[#A11B1B] rounded-full mt-1" />
                </View>

                <Pressable
                    onPress={pickImage}
                    disabled={loading}
                    style={image
                        ? { borderWidth: 2, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)' }
                        : { borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.04)' }
                    }
                    className="flex-row items-center justify-center py-5 rounded-2xl mb-4 active:opacity-70"
                >
                    {image ? (
                        <>
                            <CheckCircle color="#22c55e" size={26} />
                            <View className="ml-3 items-start">
                                <Text className="text-green-500 text-lg font-black">Comprobante listo</Text>
                                <Text className="text-green-500/60 text-xs font-medium mt-0.5">Toca para cambiar la imagen</Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <UploadCloud color="white" size={26} />
                            <View className="ml-3 items-start">
                                <Text className="text-white text-lg font-black">Subir Comprobante</Text>
                                <Text className="text-zinc-500 text-xs mt-0.5">JPG, PNG — máx. calidad 70%</Text>
                            </View>
                        </>
                    )}
                </Pressable>

                {image && (
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
                            <CheckCircle color="#22c55e" size={14} />
                            <Text className="text-zinc-400 text-xs uppercase tracking-widest font-bold">Vista previa</Text>
                        </View>
                        <View
                            className="rounded-3xl overflow-hidden"
                            style={{ shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: 'rgba(161,27,27,0.25)' }}
                        >
                            <Image source={{ uri: image }} className="w-full h-56" resizeMode="cover" />
                        </View>
                    </View>
                )}

                {image && (
                    <Pressable
                        onPress={handleSendRequest}
                        disabled={loading}
                        className="py-5 rounded-2xl items-center justify-center flex-row active:opacity-80"
                        style={{ backgroundColor: '#A11B1B', shadowColor: '#A11B1B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10 }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Send color="white" size={20} strokeWidth={2} />
                                <Text className="text-white text-lg font-black uppercase ml-3 tracking-widest">Confirmar y Enviar</Text>
                            </>
                        )}
                    </Pressable>
                )}
            </View>
        </ScrollView>
    );
}
