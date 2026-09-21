// ================================================================
// CONFIGURAÇÃO DOS SCRIPTS DE RASTREAMENTO — preencha aqui quando as
// contas de anúncios estiverem prontas. Enquanto o valor começar com
// "SEU_", o script correspondente fica desligado automaticamente (não
// carrega, não gera erro no console) — só trocar o valor já liga.
//
// Nenhum desses scripts roda sem consentimento: tudo aqui passa pelo
// gate de cookies em script.js (window.runIfTrackingConsented), então
// é seguro preencher os IDs a qualquer momento, mesmo antes de estar
// 100% pronto — só começa a disparar de verdade quando o visitante
// aceitar o banner de cookies.
//
// Onde conseguir cada ID:
//
// Meta Pixel (Facebook/Instagram Ads):
//   business.facebook.com > Gerenciador de Eventos > Conectar fontes
//   de dados > Web > Meta Pixel — copie o ID (só números).
//
// Google Analytics 4:
//   analytics.google.com > Admin > Fluxos de dados > seu fluxo web —
//   copie o "ID de MENSURAÇÃO" (formato G-XXXXXXXXXX).
//
// Google Ads (conversão):
//   ads.google.com > Ferramentas e configurações > Conversões > crie a
//   conversão (ex: "Contato pelo site") > abra o snippet de tag de
//   evento — copie o ID (formato AW-XXXXXXXXX) e o rótulo (o trecho
//   depois da barra "/" em send_to).
// ================================================================
window.TRACKING_CONFIG = {
    PIXEL_ID: 'SEU_PIXEL_ID_AQUI',
    GA_MEASUREMENT_ID: 'SEU_GA_MEASUREMENT_ID_AQUI',
    AW_CONVERSION_ID: 'SEU_AW_CONVERSION_ID_AQUI',
    AW_CONVERSION_LABEL: 'SEU_AW_CONVERSION_LABEL_AQUI',
};
