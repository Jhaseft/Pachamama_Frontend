import apiClient from './client';
import { PackageData } from '../types/package';

/**
 * Servicio para la gestión de paquetes en Pachamama
 */

// CREAR UN NUEVO PAQUETE
export const apiCreatePackage = async (packageData: PackageData) => {
    try {
        const response = await apiClient.post('/packages/create', packageData);
        return response.data;
    } catch (error: any) {
        throw (
            error?.response?.data?.message ||
            'Error al crear el paquete'
        );
    }
};

// OBTENER TODOS LOS PAQUETES
export const apiGetAllPackages = async () => {
    try {
        const response = await apiClient.get('/packages');
        return response.data;
    } catch (error: any) {
        throw (
            error?.response?.data?.message ||
            'Error al obtener la lista de paquetes'
        );
    }
};

// EDITAR UN PAQUETE EXISTENTE
export const apiUpdatePackage = async (id: string, updateData: Partial<PackageData>) => {
    try {
        const response = await apiClient.patch(`/packages/${id}`, updateData);
        return response.data;
    } catch (error: any) {
        throw (
            error?.response?.data?.message ||
            'Error al actualizar el paquete'
        );
    }
};

// ELIMINAR UN PAQUETE
export const apiDeletePackage = async (id: string) => {
    try {
        const response = await apiClient.delete(`/packages/${id}`);
        return response.data;
    } catch (error: any) {
        throw (
            error?.response?.data?.message ||
            error?.message ||
            'Error al intentar eliminar el paquete'
        );
    }
};


//OBTNER UN PAQUETE POR ID
export const apiGetPackageById = async (id: string) => {
  try {
    const response = await apiClient.get(`/packages/${id}`);
    return response.data;
  } catch (error: any) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      'No se pudo obtener la información del paquete'
    );
  }
};