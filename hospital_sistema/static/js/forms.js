// ===== FORMS.JS - VALIDAÇÃO E GERENCIAMENTO DE FORMULÁRIOS =====

// Validações
const Validator = {
    // Validar CPF (11 dígitos)
    cpf(cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');
        return cpfLimpo.length === 11;
    },
    
    // Validar email
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validar telefone
    telefone(telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
    },
    
    // Validar data
    data(data) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(data)) return false;
        
        const [dia, mes, ano] = data.split('/');
        const dataObj = new Date(ano, mes - 1, dia);
        return dataObj.getFullYear() == ano && 
               dataObj.getMonth() == mes - 1 && 
               dataObj.getDate() == dia;
    },
    
    // Validar horário
    horario(horario) {
        const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(horario);
    },
    
    // Validar nome (mínimo 2 caracteres)
    nome(nome) {
        return nome && nome.trim().length >= 2;
    },
    
    // Validar campo não vazio
    required(valor) {
        return valor && valor.toString().trim() !== '';
    }
};

// Máscaras para inputs
const Mascaras = {
    // Máscara para CPF: 000.000.000-00
    cpf(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        
        input.value = value;
        return value;
    },
    
    // Máscara para telefone: (00) 00000-0000 ou (00) 0000-0000
    telefone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length === 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length === 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        input.value = value;
        return value;
    },
    
    // Máscara para data: dd/mm/aaaa
    data(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        
        if (value.length >= 3 && value.length < 5) {
            value = value.replace(/(\d{2})(\d)/, '$1/$2');
        } else if (value.length >= 5) {
            value = value.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
        }
        
        input.value = value;
        return value;
    },
    
    // Máscara para horário: hh:mm
    horario(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        
        if (value.length >= 3) {
            value = value.replace(/(\d{2})(\d)/, '$1:$2');
        }
        
        input.value = value;
        return value;
    }
};

// Configurar máscaras em todos os inputs
function configurarMascarasGlobais() {
    // CPF
    document.querySelectorAll('.cpf-input').forEach(input => {
        input.addEventListener('input', () => Mascaras.cpf(input));
        input.addEventListener('blur', () => {
            if (!Validator.cpf(input.value)) {
                input.classList.add('error');
                mostrarErro(input, 'CPF inválido');
            } else {
                input.classList.remove('error');
                removerErro(input);
            }
        });
    });
    
    // Telefone
    document.querySelectorAll('.telefone-input').forEach(input => {
        input.addEventListener('input', () => Mascaras.telefone(input));
        input.addEventListener('blur', () => {
            if (!Validator.telefone(input.value) && input.value) {
                input.classList.add('error');
                mostrarErro(input, 'Telefone inválido');
            } else {
                input.classList.remove('error');
                removerErro(input);
            }
        });
    });
    
    // Data
    document.querySelectorAll('.data-input').forEach(input => {
        input.addEventListener('input', () => Mascaras.data(input));
        input.addEventListener('blur', () => {
            if (input.value && !Validator.data(input.value)) {
                input.classList.add('error');
                mostrarErro(input, 'Data inválida (DD/MM/AAAA)');
            } else {
                input.classList.remove('error');
                removerErro(input);
            }
        });
    });
}

// Mostrar mensagem de erro
function mostrarErro(input, mensagem) {
    let errorDiv = input.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        input.parentElement.appendChild(errorDiv);
    }
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;
}

// Remover mensagem de erro
function removerErro(input) {
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validar formulário inteiro
function validarFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!Validator.required(field.value)) {
            field.classList.add('error');
            mostrarErro(field, 'Campo obrigatório');
            isValid = false;
        } else {
            field.classList.remove('error');
            removerErro(field);
        }
        
        // Validações específicas por tipo
        if (field.type === 'email' && field.value) {
            if (!Validator.email(field.value)) {
                field.classList.add('error');
                mostrarErro(field, 'Email inválido');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Limpar formulário
function limparFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.reset();
    
    // Remover classes de erro
    form.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
        removerErro(field);
    });
}

// Preencher formulário com dados
function preencherFormulario(formId, dados) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    for (const [key, value] of Object.entries(dados)) {
        const field = form.querySelector(`[name="${key}"]`) || document.getElementById(key);
        if (field) {
            field.value = value;
        }
    }
}

// Buscar dados do formulário
function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    
    const formData = new FormData(form);
    const dados = {};
    
    for (let [key, value] of formData.entries()) {
        dados[key] = value;
    }
    
    return dados;
}

// Inicializar formulários ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    configurarMascarasGlobais();
});