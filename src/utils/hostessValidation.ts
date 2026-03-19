import type { HostessForm } from "../types/hostess";

type ValidationResult = {
    ok: boolean;
    message?: string;
};

export function validateHostessForm(form: HostessForm): ValidationResult {
    if (!form.firstName.trim()) {
        return { ok: false, message: "El nombre es obligatorio" };
    }

    if (!form.lastName.trim()) {
        return { ok: false, message: "El apellido es obligatorio" };
    }

    if (!form.phone.trim()) {
        return { ok: false, message: "El teléfono es obligatorio" };
    }

    if (!form.dateOfBirth.trim()) {   
        return { ok: false, message: "La fecha de nacimiento es obligatoria" };
    }

    if (!form.identityNumber.trim()) {      
        return { ok: false, message: "La cédula es obligatoria" };
    }

    if (!form.username.trim()) {
        return { ok: false, message: "El nombre de usuario es obligatorio" };
    }

    if (!form.email.trim()) {
        return { ok: false, message: "El correo electrónico es obligatorio" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
        return { ok: false, message: "El correo electrónico no es válido" };
    }

    if (!form.password.trim()) {
        return { ok: false, message: "La contraseña es obligatoria" };
    }

    if (form.password.trim().length < 6) {
        return { ok: false, message: "La contraseña debe tener al menos 6 caracteres" };
    }

    return { ok: true, message: "" };
}