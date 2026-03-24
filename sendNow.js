require('dotenv').config();
const { fetchNews } = require('./src/newsFetcher');
const { summarizeNews } = require('./src/summarizer');
const { initializeWhatsApp, sendMessageToGroup } = require('./src/whatsappBot');

async function sendNow() {
    console.log("=== INICIANDO TESTE MANUAL DE ENVIO ===");
    
    // Conecta ao WhatsApp primeiro
    try {
        await initializeWhatsApp();
    } catch (e) {
        console.error("Erro ao conectar no WhatsApp Web:", e);
        process.exit(1);
    }

    const groupId = process.env.WHATSAPP_GROUP_ID;
    console.log("Buscando notícias frescas...");
    const news = await fetchNews(3); // 3 de cada fonte
    
    if(news.length === 0) {
        console.log("Nenhuma notícia encontrada para o teste.");
        process.exit(0);
    }
    
    console.log(`Encontradas ${news.length} notícias. Mandando para a IA Gemini resumir (Pode demorar uns segundos)...`);
    const summary = await summarizeNews(news);
    
    console.log("Enviando mensagem para o grupo WhatsApp:", groupId, "...");
    await sendMessageToGroup(groupId, summary);
    
    console.log("=== TESTE CONCLUÍDO COM SUCESSO! ===");
    
    // Espera 3 segundos para garantir o disparo na rede do whatsapp antes de matar o processo
    setTimeout(() => {
        console.log("Desligando script de teste...");
        process.exit(0);
    }, 3000);
}

sendNow();
