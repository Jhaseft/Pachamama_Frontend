
export interface PaymentMethod {
    id: string;
    type: 'QR' |'TRANFERENCIA' | string ;
    bankName: string | null;     // Ej: "Banco Unión"
    accountName: string | null;   // Titular de la cuenta
    accountNumber: string | null; // El número para la transferencia
    qrImageUrl: string | null;    // URL de Cloudinary para el QR
    logoUrl: string | null;      // URL de Cloudinary para el logo del banco o empresa
}