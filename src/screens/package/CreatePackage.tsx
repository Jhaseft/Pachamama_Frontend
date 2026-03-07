import React, { useState } from 'react';
import { Alert } from 'react-native';
import { PackageForm } from '../../components/package/PackageForm';
import { apiCreatePackage } from '../../api/package';
import { useNavigation } from '@react-navigation/native';
import { PackageData } from '../../types/package';
import AppAlert from '@/src/components/AppAlert';

export default function CreatePackage() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success" as "success" | "error"
  });

  const handleCreate = async (data: PackageData) => {
    setLoading(true);
    try {
      await apiCreatePackage(data);
      setAlert({
        visible: true,
        title: "Éxito",
        message: "Paquete creado correctamente",
        type: "success"
      });


    } catch (error: any) {
      setAlert({
        visible: true,
        title: "Error",
        message: "No se pudo crear el paquete",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
     <>
      <PackageForm 
        title="Crear paquete"
        onSubmit={handleCreate}
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