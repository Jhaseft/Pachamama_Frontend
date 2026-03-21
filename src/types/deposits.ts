export type DepositStatus = 'PENDING' | 'APROVED' | 'REJECTED';

export interface DepositResponse {
    id: string;
    userId: string;
    packageId: string;
    paymentMethodId: string;
    imageUrl: string;
    status: DepositStatus;
    createdAt: string;
}

export interface CreateDepositRequest {
    packageId: string;
    paymentMethodId: string;
}

/**
 * 👉 Esto es TypeScript puro
* 👉 Sirve para definir cómo es la respuesta de tu backend
* 
* 🔥 En palabras simples

Es como decir:

“Cuando yo llame a la API, espero que me devuelva esto”
 */