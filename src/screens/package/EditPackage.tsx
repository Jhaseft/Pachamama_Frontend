import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import { PackageForm } from '../../components/package/PackageForm';
import { apiGetPackageById, apiUpdatePackage } from '../../api/package';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PackageData } from '../../types/package';
import AppAlert from '@/src/components/AppAlert';

export default function EditPackage() {
    const [packageData, setPackageData] = useState<PackageData | null>(null);
    const [loading, setLoading] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params as { id: string };

    const [alert, setAlert] = useState({
        visible: false,
        title: "",
        message: "",
        type: "success" as "success" | "error"
    });


    useEffect(() => {
        loadPackage();
    }, []);

    const loadPackage = async () => {
        try {
            const data = await apiGetPackageById(id);
            setPackageData(data);
        } catch (error: any) {
            setAlert({
                visible: true,
                title: "Error",
                message: "No se pudo cargar el paquete",
                type: "error"
            });
        }
    };

    const handleUpdate = async (updatedData: PackageData) => {
        setLoading(true);
        try {
            await apiUpdatePackage(id, updatedData);
            setAlert({
                visible: true,
                title: "Éxito",
                message: "Paquete actualizado correctamente",
                type: "success"
            });
        } catch (error: any) {
            setAlert({
                visible: true,
                title: "Error",
                message: "No se pudo actualizar el paquete",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    if (!packageData) return <View className="flex-1 bg-black justify-center"><ActivityIndicator size="large" color="#A11213" /></View>;

    return (
        <>
            <PackageForm
                title="Editar paquete"
                initialData={packageData}
                onSubmit={handleUpdate}
                onCancel={() => navigation.goBack()}
                isLoading={loading}
            />
            <AppAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => {
                    setAlert(prev => ({ ...prev, visible: false }));
                    navigation.goBack();
                }}
            />
        </>
    );
};