import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import ScreenHeader from "@/components/Menu/ScreenHeader";

export default function ClientePerfil() {
  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Perfil" role="cliente"/>
      
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-gray-800">Perfil Cliente</Text>
        
        {/* Enlace a la pantalla principal de anfitriona */}
        <Link href="/(auth)/choose-access" asChild>
          <TouchableOpacity className="mt-6 bg-black py-3 px-8 rounded-xl">
            <Text className="text-white font-bold">Ir a Panel Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}