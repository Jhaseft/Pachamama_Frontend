import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Linking, AppState } from 'react-native';
import notifee from '@notifee/react-native';
import { StatCard } from '../components/StartCard';
import { PlanItem } from '../components/package/PlanItem';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from "expo-router";
import ConfirmDialog from '../components/ConfirmDialog';
import { apiCountPendingWithdrawalRequests } from '../api/withdrawalRequest';
import { getAdminDashboardData } from '../api/admin';
import { apiGetAllPackages, apiDeletePackage } from '../api/package';
import { PackageData } from '../types/package';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useCreditRate } from '../hooks/useCreditRate';

export default function AdminDashboard() {

  const [packages, setPackages] = useState<PackageData[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);

  const { logout } = useAuth();
  const { toSoles } = useCreditRate();

  const [stats, setStats] = useState({
    ganancias: 0,
    solicitudesAnf: 0,
    solicitudesPago: 0,
    anfitrionas: 0,
    compras: 0
  });

  useEffect(() => {
    const checkPermissions = async () => {
      const settings = await notifee.getNotificationSettings();
      setNotificationsEnabled(settings.authorizationStatus >= 1);
    };
    checkPermissions();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkPermissions();
    });
    return () => sub.remove();
  }, []);

  const handleNotificationsPress = () => {
    Alert.alert(
      'Notificaciones',
      notificationsEnabled
        ? '¿Quieres desactivar las notificaciones?'
        : 'Las notificaciones están desactivadas. ¿Quieres activarlas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const fetchStats = async () => {
    try {
      const [data, withdrawalCount] = await Promise.all([
        getAdminDashboardData(),
        apiCountPendingWithdrawalRequests(),
      ]);
      setStats({
        ganancias: data.deposits?.totalRevenue ?? 0,
        solicitudesAnf: data.clients?.newThisMonth ?? 0,
        solicitudesPago: withdrawalCount,
        anfitrionas: data.anfitrionas?.total ?? 0,
        compras: data.deposits?.pending ?? 0,
      });
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error.message);
    }
  };

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

  useFocusEffect(
    useCallback(() => {
      fetchPackages();
      fetchStats();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchPackages(), fetchStats()]).finally(() => setRefreshing(false));
  }, []);

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

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login-admin");
  };

  return (
    <>
      <StatusBar style="light" />

      <ScrollView
        className="flex-1 px-4 pt-10"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A11213" />
        }
      >
        <View className="bg-[#A11213] p-2 rounded-2xl mb-2 items-center shadow-lg">
          <Text className="text-white text-[26px] font-black tracking-tight">
            Bienvenido Administrador
          </Text>
          <TouchableOpacity
            onPress={handleNotificationsPress}
            className="mt-2 bg-white/20 px-4 py-1.5 rounded-full"
          >
            <Text className="text-white text-xs font-bold">
              Notificaciones {notificationsEnabled === null ? '' : notificationsEnabled ? '✅' : '❌'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="flex-row items-center justify-center bg-[#1a1a1a] border border-red-900/40 py-3 rounded-xl mb-2"
        >
          <MaterialCommunityIcons name="logout" size={22} color="#f87171" />
          <Text className="text-red-300 font-semibold ml-2">
            Cerrar sesión
          </Text>
        </TouchableOpacity>

        <View className="bg-[#A11213] border border-gray-50/50 p-2 rounded-[30px] mb-4 items-center shadow-xl">
          <Text className="text-white text-lg font-bold mb-1 italic">Ganancias acumuladas</Text>
          <Text className="text-green-500 text-4xl font-black">{`${toSoles(stats.ganancias)} Soles`}</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <StatCard title="Solicitud anfitrionas" value={stats.solicitudesAnf} icon="file-document-edit" />
          <StatCard title="Solicitudes de pago" value={stats.solicitudesPago} icon="cash-clock" onPress={() => router.push('/admin/listWithdrawalRequest' as any)} />
          <StatCard title="Anfitrionas" value={stats.anfitrionas} icon="account-tie" color="#3b82f6" onPress={() => router.push('/admin/anfitriona' as any)} />
          <StatCard title="Solicitudes de compra" value={stats.compras} icon="cart-check" color="#8b5cf6" />
        </View>

        <View className="flex-row justify-between mb-4 mt-4">
          <Link asChild href={"createPackage"}>
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-red-800 flex-row items-center px-6 py-4 rounded-2xl w-[48%] justify-center"
            >
              <MaterialCommunityIcons name="package-variant-plus" size={24} color="white" />
              <Text className="text-white font-bold italic">Crear paquete</Text>
            </TouchableOpacity>
          </Link>

          <Link asChild href={"/admin/historyPayment"}>
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-[#1a1a1a] border border-gray-800 flex-row items-center px-6 py-2 rounded-2xl w-[48%] justify-center space-x-2"
            >
              <MaterialIcons name="payment" size={24} color="#e11d48" />
              <Text className="text-white font-bold italic">Ver</Text>
            </TouchableOpacity>
          </Link>
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
