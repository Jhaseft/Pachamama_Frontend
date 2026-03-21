import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, UploadCloud } from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';

import { apiCreateDepositRequest } from "@/src/api/deposits";
import { apiGetPaymentMethods } from "@/src/api/paymentMethods";

// Importamos nuestros componentes
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

    // Función para convertir URI a Blob 
    const uriToBlob = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    };

    //para obtener sus detalles complejos (QRurl, numero de cuenta, etc)
    useEffect(() => {
        const fetchMethod = async () => {
            try {
                const methods = await apiGetPaymentMethods();
                // Buscamos el método específico que seleccionó el usuario
                const selected = methods.find(
                    (m: any) => String(m.id) === String(methodId)
                );
                if (selected) {
                    setMethodData(selected);
                }
            } catch (error) {
                console.error("Error cargando detalles del método:", error);
            } finally {
                setFetchingMethod(false);
            }
        };

        if (methodId) fetchMethod();
    }, [methodId]);

    // Función para abrir la galería
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

            setImage(asset.uri);          // Para mostrar la imagen en la pantalla
            setSelectedFile(asset);       // Para enviar el objeto completo a la API

            Alert.alert("Éxito", "Comprobante seleccionado correctamente.");
        }
    };


    //funcion para enviar los datos al backend
    const handleSendRequest = async () => {
        if (!selectedFile) {
            Alert.alert("Atención", "Por favor, sube una foto de tu comprobante primero.");
            return;
        }

        console.log({
            packageId,
            methodId,
            image,
            methodData
        });

        const depositData = {
            packageId: packageId as string,
            paymentMethodId: methodId as string,
        };

        console.log("--- INICIANDO ENVÍO DE DEPÓSITO ---");
        console.log("Datos:", depositData);
        console.log("Archivo URI:", selectedFile.uri);

        setLoading(true);
        try {

            // Convertimos URI a Blob para React Native
            const blob = await uriToBlob(selectedFile.uri);

            const fileToUpload = {
                uri: selectedFile.uri,
                name: selectedFile.fileName || `comprobante_${Date.now()}.jpg`,
                type: selectedFile.mimeType || 'image/jpeg',
                blob,
            };

            await apiCreateDepositRequest(
                depositData,
                fileToUpload
            );

            Alert.alert(
                "¡Solicitud Enviada!",
                "Tu pago está en revisión. Te avisaremos cuando tus créditos se activen.",
                [{ text: "Entendido", onPress: () => router.replace("/(cliente)/perfil") }]
            );
        } catch (error: any) {
            console.error(error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo enviar el comprobante";

            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    // CORRECCIÓN: Manejo de estados de carga y errores de navegación
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
        <ScrollView className="flex-1 bg-black">
            <View className="flex-row items-center px-6 pt-4">
                <Pressable onPress={() => router.back()} disabled={loading}>
                    <ArrowLeft color="white" size={28} />
                </Pressable>
                <Text className="text-white text-xl font-bold ml-4 lowercase">
                    {methodType === 'QR' ? 'escanea el codigo qr' : 'transfiera a esta cuenta'}
                </Text>
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

            <View className="px-10 mt-8 mb-10">

                <Pressable
                    onPress={pickImage}
                    disabled={loading}
                    className={`flex-row items-center justify-center py-4 rounded-2xl border-2 mb-4 ${image ? 'border-green-500 bg-green-500/10' : 'border-white bg-transparent'
                        }`}
                >
                    {image ? (
                        <>
                            <CheckCircle color="#22c55e" size={24} />
                          
                            <View className="ml-3 items-start">
                                <Text className="text-green-500 text-xl font-bold">
                                    Comprobante listo
                                </Text>
                                <Text className="text-green-500/70 text-sm font-medium">
                                    Presione aquí para volver a seleccionar
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <UploadCloud color="white" size={24} />
                            <Text className="text-white text-xl font-bold ml-3">
                                Seleccionar foto
                            </Text>
                        </>
                    )}
                </Pressable>

                {image && (
                    <View className="mt-4">
                        <Text className="text-white mb-2">Vista previa:</Text>
                        <Image
                            source={{ uri: image }}
                            className="w-full h-40 rounded-xl"
                        />
                    </View>
                )}

                {image && (
                    <Pressable
                        onPress={handleSendRequest}
                        disabled={loading}
                        className="bg-[#A11B1B] py-4 rounded-2xl items-center justify-center"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-xl font-bold uppercase">
                                Confirmar y Enviar
                            </Text>
                        )}
                    </Pressable>
                )}
            </View>
        </ScrollView>
    );
}