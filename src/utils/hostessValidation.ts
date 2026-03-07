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

    return { ok: true, message: "" };
}