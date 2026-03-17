import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { StatCard } from '../components/StartCard';
import { PlanItem } from '../components/package/PlanItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from "expo-router";
import ConfirmDialog from '../components/ConfirmDialog';


import { apiGetAllPackages, apiDeletePackage } from '../api/package';
import { PackageData } from '../types/package';
import { useRouter, useFocusEffect } from 'expo-router';

export default function AdminDashboard() {

  const [packages, setPackages] = useState<PackageData[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);


  const [stats, setStats] = useState({
    ganancias: 1202,
    solicitudesAnf: 8,
    solicitudesPago: 34,
    anfitrionas: 13,
    compras: 48
  });

  // Función para cargar los paquetes desde la API
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await apiGetAllPackages();
      setPackages(data);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar los paquetes";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar los paquetes al montar el componente
  useFocusEffect(
    useCallback(() => {
      fetchPackages();
    }, [])
  );
  // Función para refrescar la lista de paquetes
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPackages();
  }, []);

  // Función para eliminar un paquete
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await apiDeletePackage(deleteId);
      fetchPackages();
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar";
      Alert.alert("Error", message);
    } finally {
      setConfirmVisible(false);
      setDeleteId(null);
    }
  };
  return (
    <>
      <StatusBar style="light" />

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A11213" />
        }
      >

        <View className="bg-[#A11213] p-2 rounded-2xl mb-4 items-center shadow-lg">
          <Text className="text-white text-[26px] font-black tracking-tight">
            Bienvenido Administrador
          </Text>
        </View>

        <Link href="/(auth)/choose-access" asChild>
          <TouchableOpacity className="mt-6 bg-black py-3 px-8 rounded-xl">
            <Text className="text-white font-bold">Ir a Panel Anfitriona</Text>
          </TouchableOpacity>
        </Link>

        <View className="bg-[#A11213] border border-gray-50/50 p-2 rounded-[30px] mb-4 items-center shadow-xl">
          <Text className="text-white text-lg font-bold mb-1 italic">Ganancias acumuladas</Text>
          <Text className="text-green-500 text-4xl font-black">{`${stats.ganancias} $`}</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <StatCard title="Solicitud anfitrionas" value={stats.solicitudesAnf} icon="file-document-edit" />
          <StatCard title="Solicitudes de pago" value={stats.solicitudesPago} icon="cash-clock" />
          <StatCard title="Anfitrionas" value={stats.anfitrionas} icon="account-tie" color="#3b82f6" />
          <StatCard title="Solicitudes de compra" value={stats.compras} icon="cart-check" color="#8b5cf6" />
        </View>

        <View className="flex-row justify-between mb-4 mt-4">

          <Link
            asChild
            href={"createPackage"}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-red-800 flex-row items-center px-6 py-4 rounded-2xl w-[48%] justify-center"
            >
              <MaterialCommunityIcons name="package-variant-plus" size={24} color="white" />
              <Text className="text-white font-bold italic">Crear paquete</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-[#1a1a1a] border border-gray-800 flex-row items-center px-6 py-2 rounded-2xl w-[48%] justify-center space-x-2"
          >
            <MaterialIcons name="payment" size={24} color="#e11d48" />
            <Text className="text-white font-bold italic">Ver</Text>
          </TouchableOpacity>

        </View>

        <Text className="text-white text-xl font-black mb-2 ml-1 italic tracking-tight uppercase">
          Paquetes de Suscripción
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#A11213" className="mt-10" />
        ) : (
          packages.map((item) => (
            <PlanItem
              key={item.id}
              name={item.name}
              credits={item.credits}
              price={Number(item.price)}
              onEdit={() => router.push({ pathname: '/editPackage', params: { id: item.id } })}
              onDelete={() => handleDelete(item.id!)}
            />
          ))
        )}

      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        title="Eliminar paquete"
        message="¿Estás seguro de que deseas eliminar este paquete?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmDelete}
      />


    </>
  );
}
