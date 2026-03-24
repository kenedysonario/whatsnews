require('dotenv').config();
const { fetchNews } = require('./src/newsFetcher');
const { summarizeNews } = require('./src/summarizer');

async function test() {
    console.log("--- TESTANDO BUSCA DE NOTÍCIAS (RSS) ---");
    const news = await fetchNews(2); // Pegar poucas só para testar mais rápido
    console.log(`\nLocalizamos: ${news.length} notícias brutas.`);
    if(news.length > 0) {
        console.log(`Exemplo de manchete: "${news[0].title}" (${news[0].source})\n`);
    }

    console.log("--- TESTANDO SUMARIZAÇÃO (IA GEMINI) ---");
    const summary = await summarizeNews(news);
    
    console.log("\n=========================");
    console.log("    RESUMO PARA WHATS    ");
    console.log("=========================\n");
    console.log(summary);
    console.log("\n=========================\n");
    console.log("Finalizado. Se ocorreu erro de API, verifique a chave GEMINI_API_KEY no .env.");
}

test();
