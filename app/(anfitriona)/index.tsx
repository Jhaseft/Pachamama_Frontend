import { Stack } from "expo-router";
import { DollarSign, Heart, Images, MessageCircle, Settings, Star, Users } from "lucide-react-native";
import { Pressable, ScrollView, Text, View, Image } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { getProfile } from "../../src/services/auth";
import { useEffect, useState } from "react";
import { router } from "expo-router";


export default function AnfitrianaInicio() {

  const { accessToken, user, isHydrated, setSession, logout } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const validate = async () => {
      if (!accessToken) return;
      try {
        const profile = await getProfile();
        await setSession(accessToken, profile);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Sesi\u00f3n expirada.";
        setError(message);
        await logout();
        router.replace("/(auth)/choose-access");
      }
    };

    if (isHydrated) {
      void validate();
    }
  }, [accessToken, isHydrated, logout, setSession]);

  const USUARIO = {
    nombre: user?.firstName,
    avatar: require("../../assets/Black-and-White-X-Letter-Digital.jpg"),
  };

  const GANANCIAS = {
    hoy: 340,
    semana: 1850,
  };

  const MENSAJES = [
    { id: 1, de: "Carlos R.", texto: "Hola, quiero una sesión hoy", hora: "10:02", leido: false },
    { id: 2, de: "Luis M.", texto: "¿Tienes disponibilidad mañana?", hora: "09:45", leido: false },
    { id: 3, de: "Pedro G.", texto: "Gracias por la atención", hora: "08:30", leido: false },
    { id: 4, de: "Jose T.", texto: "Enviando el pago ahora", hora: "Ayer", leido: true },
    { id: 5, de: "Andres V.", texto: "Perfecto, hasta luego", hora: "Ayer", leido: true },
  ];

  const CLIENTES = [
    { id: 1, nombre: "Carlos R.", activo: true },
    { id: 2, nombre: "Luis M.", activo: true },
    { id: 3, nombre: "Pedro G.", activo: false },
    { id: 4, nombre: "Jose T.", activo: true },
    { id: 5, nombre: "Andres V.", activo: false },
    { id: 6, nombre: "Miguel F.", activo: false },
  ];

  const ACTIVIDAD = [
    { id: 1, Icon: Images, label: "8 fotos desbloqueadas por Carlos R.", hora: "Hace 5 min" },
    { id: 2, Icon: DollarSign, label: "Pago recibido de Luis M. — S/ 80", hora: "Hace 20 min" },
    { id: 3, Icon: Heart, label: "3 nuevos seguidores hoy", hora: "Hace 1 hora" },
    { id: 4, Icon: Star, label: "Nueva reseña 5 estrellas de Pedro G.", hora: "Hace 2 horas" },
    { id: 5, Icon: Images, label: "5 fotos desbloqueadas por Jose T.", hora: "Hace 3 horas" },
  ];

  // --- Accesos rápidos derivados del mock ---
  const mensajesNuevos = MENSAJES.filter((m) => !m.leido).length;
  const totalClientes = CLIENTES.length;

  const ACCESOS = [
    { Icon: MessageCircle, label: "Mensajes", sub: `${mensajesNuevos} nuevos` },
    { Icon: DollarSign, label: "Ganancias", sub: `S/ ${GANANCIAS.hoy}` },
    { Icon: Settings, label: "Mis precios", sub: null },
    { Icon: Users, label: "Clientes", sub: `${totalClientes} total` },
  ];



  return (
    <>
      <ScrollView className="flex-1  bg-black px-4 pt-4">

        <Stack.Screen
          options={{
            headerShown: false
          }}
        />

        <View className="flex flex-row gap-14 p-4 mb-1">

          <View className="items-center justify-center">
            <Text className="text-white text-2xl font-bold">Hola {USUARIO.nombre} 👋</Text>
            <Text className="text-gray-400 text-sm mb-4">Aqui esta tu resumen de hoy</Text>
          </View>

          <View className="">
            <Image
              source={USUARIO.avatar}
              className="w-[100px] h-[100px]"
              resizeMode="contain"
            />
          </View>

        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-red-600 rounded-xl p-4">
            <Text className="text-white text-xs mb-1">Hoy</Text>
            <Text className="text-white text-2xl font-bold">S/ {GANANCIAS.hoy}</Text>
          </View>
          <View className="flex-1 bg-red-600 rounded-xl p-4">
            <Text className="text-white text-xs mb-1">Esta semana</Text>
            <Text className="text-white text-2xl font-bold">S/ {GANANCIAS.semana}</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mb-3">Accesos Rapidos</Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {ACCESOS.map(({ Icon, label, sub }) => (
            <Pressable
              key={label}
              className="bg-red-600 rounded-xl p-4 items-center justify-center active:opacity-70"
              style={{ width: "47%" }}
            >
              <Icon size={32} color="white" />
              <Text className="text-white font-semibold mt-2">{label}</Text>
              {sub && <Text className="text-white text-xs opacity-80">{sub}</Text>}
            </Pressable>
          ))}
        </View>

        <Text className="text-white text-lg font-bold mb-3">Actividad reciente</Text>
        {ACTIVIDAD.map(({ id, Icon, label, hora }) => (
          <Pressable
            key={id}
            className="bg-red-600 rounded-xl px-4 py-3 flex-row items-center gap-3 mb-3 active:opacity-70"
          >
            <Icon size={24} color="white" />
            <View className="flex-1">
              <Text className="text-white font-semibold">{label}</Text>
              <Text className="text-white text-xs opacity-70">{hora}</Text>
            </View>
          </Pressable>
        ))}

        <View className="h-8" />
      </ScrollView>
    </>
  );
}
