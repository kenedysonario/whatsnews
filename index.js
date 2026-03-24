require('dotenv').config();
const cron = require('node-cron');
const { fetchNews } = require('./src/newsFetcher');
const { summarizeNews, analyzeBreakingNews } = require('./src/summarizer');
const { loadSeenNews, saveSeenNews } = require('./src/state');

// Estado das notícias já analisadas
let seenNewsSet = loadSeenNews();
const { initializeWhatsApp, sendMessageToGroup } = require('./src/whatsappBot');

async function runNewsCycle() {
    console.log(`\n[${new Date().toLocaleString()}] Iniciando a varredura e sumarização de notícias...`);
    const groupId = process.env.WHATSAPP_GROUP_ID;
    
    if (!groupId) {
         console.warn("⚠️ ALERTA: WHATSAPP_GROUP_ID não está definido no .env. O bot gerará o resumo no terminal, mas não enviará a mensagem pelo WhatsApp.");
    }

    // 1. Opcional: Avisar no grupo que está preparando as notícias (bom para grupos grandes)
    // if(groupId) await sendMessageToGroup(groupId, "⏳ Preparando o seu resumo de notícias diário... Aguarde um instante!");

    // 2. Buscar Notícias
    console.log("Buscando fontes...");
    const news = await fetchNews(4); // Pega até 4 de cada fonte
    if (!news || news.length === 0) {
        console.log("Nenhuma notícia encontrada hoje nas fontes configuradas.");
        return;
    }
    console.log(`Foram localizadas ${news.length} notícias. Iniciando sumarização avançada via GEMINI IA...`);

    // 3. Sumarizar com API
    const summary = await summarizeNews(news);
    console.log("\n=========================");
    console.log("   RESUMO GERADO (IA)    ");
    console.log("=========================\n");
    console.log(summary);
    console.log("\n=========================\n");

    // 4. Enviar no WhatsApp
    if (groupId) {
        await sendMessageToGroup(groupId, summary);
    }
}

async function runBreakingNewsCycle() {
    const groupId = process.env.WHATSAPP_GROUP_ID;
    if (!groupId) return;

    try {
        const news = await fetchNews(3);
        if (!news || news.length === 0) return;

        const newItems = [];
        for (const item of news) {
            if (!seenNewsSet.has(item.link)) {
                newItems.push(item);
                seenNewsSet.add(item.link);
            }
        }
        
        saveSeenNews(seenNewsSet);

        if (newItems.length > 0) {
            console.log(`[Monitor Urgente ${new Date().toLocaleTimeString()}] ${newItems.length} matérias inéditas encontradas. Avaliando via IA...`);
            const alert = await analyzeBreakingNews(newItems);
            
            if (alert) {
                console.log("\n🚨 URGENTE DETECTADO! Enviando alerta...");
                console.log(alert);
                await sendMessageToGroup(groupId, alert);
            } else {
                console.log(`[Monitor Urgente] Matérias analisadas, nenhuma notícia urgente de última hora.`);
            }
        }
    } catch(e) {
        console.error("Erro no monitor de última hora:", e.message);
    }
}

async function startApp() {
    try {
        // Inicializa o whatsapp e loga via QRCode. Após conectar, resolve a Promessa.
        await initializeWhatsApp();
        
        const schedule = process.env.CRON_SCHEDULE || "0 8 * * *";
        console.log(`\nAgendamento de notícias configurado para regra cron: "${schedule}" (M Padrão é 08h00 da manhã, em seu fuso horário).`);
        
        cron.schedule(schedule, () => {
            runNewsCycle();
        });

        console.log(`Agendamento do Monitor de Última Hora ativado (a cada 1 minuto).`);
        cron.schedule('* * * * *', () => {
            runBreakingNewsCycle();
        });

        console.log("✅ Bot carregado e pronto! Aguardando o horário agendado de acordo com seu CRON.");
        console.log("DICA: Para testar as notícias agora (sem agendamento), rode 'node test.js' em outro terminal.");
        console.log("Ou rode 'npm start' aqui para que ele apenas fique escutando o cron.");
        
    } catch (error) {
        console.error("Erro fatal ao iniciar sistema completo:", error);
    }
}

startApp();
