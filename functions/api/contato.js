// ================================================================
// Cloudflare Pages Function — recebe o formulário de contato do site
// (#contact-form em index.html) e cria/atualiza o contato no Brevo.
//
// Variáveis de ambiente necessárias (Cloudflare Dashboard > seu projeto
// Pages > Settings > Environment variables — configure em "Production"
// e também em "Preview" se for testar em deploys de preview):
//
//   BREVO_API_KEY   chave de API do Brevo (Brevo > Configurações >
//                   Chaves SMTP e API > API Keys > gerar uma nova).
//                   NUNCA colar a chave direto no código — só aqui, via
//                   variável de ambiente.
//
//   BREVO_LIST_ID   ID numérico da lista de contatos do Brevo que vai
//                   receber os leads do site (Brevo > Contatos > Listas
//                   > abra a lista > o ID aparece na URL, ex:
//                   .../list/5 → BREVO_LIST_ID=5). Crie uma lista
//                   dedicada tipo "Site - Formulário de contato" antes
//                   de configurar isso.
//
// Atributo customizado a criar no Brevo antes de usar (Contatos >
// Configurações > Atributos de contato > Adicionar um atributo, tipo
// "Texto"), senão o Brevo ignora o valor enviado:
//
//   MENSAGEM   guarda o texto da mensagem enviada no formulário.
//
// Os atributos padrão do Brevo (FIRSTNAME, LASTNAME, SMS) já existem por
// conta e não precisam ser criados.
// ================================================================

const REQUIRED_FIELDS = ['name', 'email', 'phone', 'message'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhoneToE164(rawPhone) {
    const digits = rawPhone.replace(/\D/g, '');
    if (!digits) return '';
    // Já vem com o código do país (Brasil, 55 + DDD + número) — usa como está.
    if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
    // DDD + número (10 ou 11 dígitos, formato mais comum no formulário) —
    // assume Brasil, já que é o país de atuação do escritório.
    if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
    return `+${digits}`;
}

function splitName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    return {
        firstName: parts[0] || fullName,
        lastName: parts.slice(1).join(' ') || '',
    };
}

function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function onRequestPost({ request, env }) {
    let data;
    try {
        data = await request.json();
    } catch {
        return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
    }

    // Honeypot: campo escondido no CSS que só um bot preencheria. Se
    // vier preenchido, finge sucesso (não dá dica pro bot de que foi
    // barrado) sem chamar o Brevo.
    if (data.website) {
        return jsonResponse({ ok: true }, 200);
    }

    for (const field of REQUIRED_FIELDS) {
        if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
            return jsonResponse({ ok: false, error: `missing_field_${field}` }, 400);
        }
    }

    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone.trim();
    const message = data.message.trim();

    if (!EMAIL_REGEX.test(email)) {
        return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) {
        console.error('Faltam BREVO_API_KEY / BREVO_LIST_ID nas variáveis de ambiente do Cloudflare Pages.');
        return jsonResponse({ ok: false, error: 'server_not_configured' }, 500);
    }

    const { firstName, lastName } = splitName(name);

    const brevoPayload = {
        email,
        attributes: {
            FIRSTNAME: firstName,
            LASTNAME: lastName,
            SMS: normalizePhoneToE164(phone),
            MENSAGEM: message,
        },
        listIds: [Number(env.BREVO_LIST_ID)],
        updateEnabled: true,
    };

    let brevoRes;
    try {
        brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'api-key': env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify(brevoPayload),
        });
    } catch (err) {
        console.error('Falha ao chamar a API do Brevo:', err);
        return jsonResponse({ ok: false, error: 'brevo_unreachable' }, 502);
    }

    // Brevo retorna 201 (contato novo) ou 204 (contato existente
    // atualizado, corpo vazio) como sucesso.
    if (brevoRes.status === 201 || brevoRes.status === 204) {
        return jsonResponse({ ok: true }, 200);
    }

    const errorBody = await brevoRes.text().catch(() => '');
    console.error(`Brevo respondeu ${brevoRes.status}:`, errorBody);
    return jsonResponse({ ok: false, error: 'brevo_rejected' }, 502);
}

export async function onRequestGet() {
    return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405);
}
