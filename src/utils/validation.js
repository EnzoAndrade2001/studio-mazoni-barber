const { HttpError } = require('./httpError');

function texto(value, campo, { obrigatorio = true, min = 0, max = 500 } = {}) {
    if (value === undefined || value === null || value === '') {
        if (obrigatorio) throw new HttpError(400, `O campo ${campo} e obrigatorio.`);
        return null;
    }

    if (typeof value !== 'string') throw new HttpError(400, `O campo ${campo} deve ser texto.`);
    const normalizado = value.trim();
    if (!normalizado && obrigatorio) throw new HttpError(400, `O campo ${campo} e obrigatorio.`);
    if (normalizado && normalizado.length < min) throw new HttpError(400, `O campo ${campo} deve ter pelo menos ${min} caracteres.`);
    if (normalizado.length > max) throw new HttpError(400, `O campo ${campo} excede ${max} caracteres.`);
    return normalizado || null;
}

function id(value, campo = 'id') {
    const numero = Number(value);
    if (!Number.isSafeInteger(numero) || numero <= 0) {
        throw new HttpError(400, `O campo ${campo} deve ser um inteiro positivo.`);
    }
    return numero;
}

function dinheiro(value, campo = 'preco') {
    const numero = Number(value);
    if (!Number.isFinite(numero) || numero < 0) {
        throw new HttpError(400, `O campo ${campo} deve ser um valor positivo.`);
    }
    return Math.round(numero * 100) / 100;
}

function inteiro(value, campo, minimo, maximo) {
    const numero = Number(value);
    if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
        throw new HttpError(400, `O campo ${campo} deve estar entre ${minimo} e ${maximo}.`);
    }
    return numero;
}

function data(value, campo = 'inicio') {
    if (typeof value !== 'string' || !value.trim()) {
        throw new HttpError(400, `O campo ${campo} deve ser uma data ISO 8601.`);
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new HttpError(400, `O campo ${campo} possui data invalida.`);
    return parsed;
}

function telefone(value) {
    const original = texto(value, 'telefone', { max: 20 });
    const digitos = original.replace(/\D/g, '');
    if (digitos.length < 10 || digitos.length > 13) {
        throw new HttpError(400, 'O telefone deve conter entre 10 e 13 digitos.');
    }
    return digitos;
}

function cpf(value) {
    const digitos = String(value || '').replace(/\D/g, '');
    if (digitos.length !== 11 || /^(\d)\1+$/.test(digitos)) {
        throw new HttpError(400, 'CPF invalido.');
    }
    const calcularDigito = (base) => {
        let soma = 0;
        for (let i = 0; i < base.length; i += 1) soma += Number(base[i]) * (base.length + 1 - i);
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };
    const primeiro = calcularDigito(digitos.slice(0, 9));
    const segundo = calcularDigito(digitos.slice(0, 10));
    if (primeiro !== Number(digitos[9]) || segundo !== Number(digitos[10])) {
        throw new HttpError(400, 'CPF invalido.');
    }
    return digitos;
}

function cnpj(value) {
    const digitos = String(value || '').replace(/\D/g, '');
    if (digitos.length !== 14 || /^(\d)\1+$/.test(digitos)) {
        throw new HttpError(400, 'CNPJ invalido.');
    }
    const calcularDigito = (base) => {
        const pesos = base.length === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const soma = base.split('').reduce((total, digito, index) => total + Number(digito) * pesos[index], 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };
    const primeiro = calcularDigito(digitos.slice(0, 12));
    const segundo = calcularDigito(digitos.slice(0, 13));
    if (primeiro !== Number(digitos[12]) || segundo !== Number(digitos[13])) {
        throw new HttpError(400, 'CNPJ invalido.');
    }
    return digitos;
}

function cpfCnpj(value) {
    const digitos = String(value || '').replace(/\D/g, '');
    if (digitos.length === 11) return cpf(digitos);
    if (digitos.length === 14) return cnpj(digitos);
    throw new HttpError(400, 'Informe CPF ou CNPJ valido.');
}

function email(value, { obrigatorio = false } = {}) {
    const normalizado = texto(value, 'email', { obrigatorio, max: 160 });
    if (!normalizado) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
        throw new HttpError(400, 'O email informado e invalido.');
    }
    return normalizado.toLowerCase();
}

function booleano(value, campo) {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    throw new HttpError(400, `O campo ${campo} deve ser verdadeiro ou falso.`);
}

function objeto(value, campo) {
    if (value === undefined || value === null || value === '') return {};
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new HttpError(400, `O campo ${campo} deve ser um objeto.`);
    }
    return value;
}

module.exports = { texto, id, dinheiro, inteiro, data, telefone, cpf, cnpj, cpfCnpj, email, booleano, objeto };
