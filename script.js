const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if(menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Header scroll state: transparente sobre o hero, sólido depois dele.
// Páginas sem .hero (ex.: blog) ficam sempre no estado "scrolled".
const header = document.querySelector('header');
const hero = document.querySelector('.hero');

if (header) {
    if (!hero) {
        header.classList.add('header-scrolled');
    } else {
        const updateHeaderState = () => {
            // O texto do hero começa logo abaixo do cabeçalho (mais ainda
            // no mobile, mas também no desktop) — esperar a altura inteira
            // do hero pra ficar opaco deixava o h1 passar por baixo do
            // cabeçalho ainda transparente durante a rolagem, sobrepondo
            // logo/nav e título de forma ilegível (mais visível no mobile,
            // mas existia em qualquer largura). Fica opaco assim que a
            // rolagem passa da própria altura do cabeçalho, antes do texto
            // ter chance de chegar perto dele, em qualquer tamanho de tela.
            const threshold = header.offsetHeight;
            header.classList.toggle('header-scrolled', window.scrollY > threshold);
        };
        updateHeaderState();
        window.addEventListener('scroll', updateHeaderState, { passive: true });
        window.addEventListener('resize', updateHeaderState);
    }
}

// Accordion (cards de equipe + bio do sócio fundador). Só tem efeito
// visual no mobile — no desktop o CSS mantém a bio sempre visível
// independente da classe .is-open.
function setupAccordionToggle(toggleSelector, containerSelector) {
    document.querySelectorAll(toggleSelector).forEach((toggle) => {
        const container = toggle.closest(containerSelector);
        if (!container) return;

        const setOpen = (open) => {
            container.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        };

        toggle.addEventListener('click', () => {
            setOpen(!container.classList.contains('is-open'));
        });

        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(!container.classList.contains('is-open'));
            }
        });
    });
}

setupAccordionToggle('.team-member-toggle', '.team-member');
setupAccordionToggle('.founder-toggle', '.founder-content');

// ---------- Botão flutuante de WhatsApp ----------
// Injetado via JS (não HTML fixo) pra aparecer em qualquer página que
// carregue este script — site institucional e todas as páginas do blog —
// sem duplicar o markup em cada template.
(function setupWhatsappButton() {
    const WHATSAPP_NUMBER = '5561998342821';
    const WHATSAPP_MESSAGE = 'Olá, gostaria de agendar uma conversa com o escritório.';

    const btn = document.createElement('a');
    btn.className = 'whatsapp-float';
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Conversar no WhatsApp');
    btn.innerHTML = `<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.66 1.784 6.687L2.667 29.333l6.826-1.789a13.27 13.27 0 0 0 6.511 1.658h.006c7.362 0 13.333-5.97 13.333-13.333 0-3.56-1.386-6.908-3.903-9.425a13.24 13.24 0 0 0-9.436-3.777Zm0 24.4h-.005a11.06 11.06 0 0 1-5.636-1.542l-.404-.24-4.05 1.062 1.082-3.948-.264-.406a11.05 11.05 0 0 1-1.693-5.893c0-6.113 4.976-11.088 11.093-11.088a11.02 11.02 0 0 1 7.844 3.253 11.02 11.02 0 0 1 3.245 7.847c-.003 6.114-4.978 11.088-11.09 11.088Zm6.083-8.305c-.333-.167-1.97-.972-2.276-1.083-.305-.111-.527-.166-.75.167-.222.333-.86 1.083-1.055 1.305-.194.222-.388.25-.72.083-.334-.167-1.41-.52-2.686-1.657-.993-.885-1.664-1.98-1.859-2.313-.194-.334-.02-.514.146-.68.15-.15.334-.39.5-.583.167-.195.223-.334.334-.556.11-.222.055-.417-.028-.583-.084-.167-.75-1.807-1.028-2.474-.271-.65-.546-.563-.75-.573-.194-.01-.417-.012-.639-.012s-.583.083-.888.417c-.305.333-1.166 1.14-1.166 2.78 0 1.64 1.194 3.225 1.36 3.447.167.222 2.352 3.59 5.7 5.035.796.344 1.418.55 1.903.703.8.254 1.528.218 2.104.132.642-.096 1.97-.805 2.248-1.583.278-.778.278-1.445.194-1.583-.083-.14-.305-.222-.639-.39Z"/>
    </svg>`;
    // Dispara o evento de lead pros scripts de rastreamento (se
    // consentidos e configurados — ver tracking.config.js). Não bloqueia
    // a navegação: o link abre o WhatsApp normalmente de qualquer jeito.
    btn.addEventListener('click', () => {
        if (window.trackLeadConversion) window.trackLeadConversion('whatsapp_click');
    });
    document.body.appendChild(btn);
})();

// ---------- Consentimento de cookies ----------
const COOKIE_CONSENT_KEY = 'cookieConsent'; // 'accepted' | 'declined'

function getCookieConsent() {
    try {
        return localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch {
        return null;
    }
}

function setCookieConsent(value) {
    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
        // localStorage indisponível (modo privado, etc.) — degrada pra
        // perguntar de novo na próxima visita, não quebra o site.
    }
}

// Gate pra quando o Meta Pixel (ou qualquer outro script de rastreamento)
// for instalado: em vez de disparar o script direto, chame
// window.runIfTrackingConsented(() => { ...código do pixel... }).
// Não precisa mexer no banner quando isso acontecer.
window.hasTrackingConsent = () => getCookieConsent() === 'accepted';
window.runIfTrackingConsented = (fn) => {
    if (window.hasTrackingConsent()) fn();
};

(function initCookieBanner() {
    if (getCookieConsent()) return; // já decidiu antes, não mostra de novo

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
        <p>Usamos cookies, inclusive de rastreamento para anúncios. Saiba mais na
            <a href="/privacidade.html">Política de Privacidade</a>.</p>
        <div class="cookie-banner-actions">
            <button type="button" class="btn btn-outline-dark cookie-decline">Recusar</button>
            <button type="button" class="btn btn-primary cookie-accept">Aceitar</button>
        </div>`;
    document.body.appendChild(banner);

    const close = (choice) => {
        setCookieConsent(choice);
        banner.remove();
    };

    banner.querySelector('.cookie-accept').addEventListener('click', () => close('accepted'));
    banner.querySelector('.cookie-decline').addEventListener('click', () => close('declined'));
})();

// ---------- Scripts de rastreamento (Meta Pixel, GA4, Google Ads) ----------
// Lê os IDs de window.TRACKING_CONFIG (ver tracking.config.js, que
// precisa ser carregado ANTES deste arquivo). Cada script só é
// carregado se: (1) o consentimento de cookies foi aceito, e (2) o ID
// correspondente já foi preenchido (enquanto for o placeholder
// "SEU_..." o script fica desligado — sem isso, todo mundo que abrisse
// o site antes de você configurar as contas geraria erro de rede/console
// tentando carregar um pixel/tag com ID inválido).
(function setupTracking() {
    const cfg = window.TRACKING_CONFIG || {};
    const isPlaceholder = (value) => !value || /^SEU_/.test(value);

    function loadMetaPixel(pixelId) {
        /* eslint-disable */
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
            t = b.createElement(e); t.async = !0; t.src = v;
            s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */
        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
    }

    function loadGtagJs(id) {
        if (window.gtagScriptLoaded) return;
        window.gtagScriptLoaded = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        document.head.appendChild(script);
    }

    window.runIfTrackingConsented(() => {
        if (!isPlaceholder(cfg.PIXEL_ID)) {
            loadMetaPixel(cfg.PIXEL_ID);
        }
        if (!isPlaceholder(cfg.GA_MEASUREMENT_ID)) {
            loadGtagJs(cfg.GA_MEASUREMENT_ID);
            window.gtag('config', cfg.GA_MEASUREMENT_ID);
        }
        if (!isPlaceholder(cfg.AW_CONVERSION_ID)) {
            loadGtagJs(cfg.AW_CONVERSION_ID);
            window.gtag('config', cfg.AW_CONVERSION_ID);
        }
    });

    // Chamado em dois momentos: clique no botão do WhatsApp (acima) e
    // envio bem-sucedido do formulário de contato (ver setupContactForm
    // abaixo). Cada script só dispara se estiver de fato carregado
    // (consentimento aceito + ID configurado) — nunca lança erro se
    // faltar algum, só ignora aquele específico.
    window.trackLeadConversion = function (source) {
        if (!window.hasTrackingConsent()) return;

        if (window.fbq) {
            window.fbq('track', 'Lead', { content_name: source });
        }
        if (window.gtag) {
            if (!isPlaceholder(cfg.GA_MEASUREMENT_ID)) {
                window.gtag('event', 'generate_lead', { event_category: source });
            }
            if (!isPlaceholder(cfg.AW_CONVERSION_ID) && !isPlaceholder(cfg.AW_CONVERSION_LABEL)) {
                window.gtag('event', 'conversion', {
                    send_to: `${cfg.AW_CONVERSION_ID}/${cfg.AW_CONVERSION_LABEL}`,
                });
            }
        }
    };
})();

// ---------- Formulário de contato (Brevo) ----------
// Só faz algo se a página tiver o formulário (só existe em index.html —
// vira um no-op silencioso em qualquer outra página que carregue este
// mesmo script.js, como o blog).
(function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = form.querySelector('.contact-form-status');
    const submitBtn = form.querySelector('.contact-form-submit');
    const emailInput = form.querySelector('#cf-email');

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const setStatus = (message, kind) => {
        statusEl.textContent = message;
        statusEl.classList.remove('is-success', 'is-error');
        if (kind) statusEl.classList.add(kind);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus('', null);

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const message = form.message.value.trim();

        if (!name || !email || !phone || !message) {
            setStatus('Preencha todos os campos antes de enviar.', 'is-error');
            return;
        }
        if (!isValidEmail(email)) {
            setStatus('Digite um e-mail válido.', 'is-error');
            emailInput.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            const res = await fetch('/api/contato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, message, website: form.website.value }),
            });

            if (!res.ok) throw new Error('request failed');

            setStatus('Mensagem enviada, entraremos em contato em breve.', 'is-success');
            form.reset();
            if (window.trackLeadConversion) window.trackLeadConversion('contact_form_submit');
        } catch (err) {
            setStatus('Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.', 'is-error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar mensagem';
        }
    });
})();
