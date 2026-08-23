const clientId = 'JdexzBCkg0atg9w4eb61';
const clientSecret = 'na9eG5NGFE-v4hNYiBT1Btjs0eji5dF0PZ95uHjh';
const fs = require('fs');

async function run() {
    console.log("Starting analysis...");
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const tokenRes = await fetch('https://api.avito.ru/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });
    const { access_token } = await tokenRes.json();
    
    const selfRes = await fetch('https://api.avito.ru/core/v1/accounts/self', {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const { id: userId } = await selfRes.json();
    
    const chatsRes = await fetch(`https://api.avito.ru/messenger/v2/accounts/${userId}/chats?limit=25`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    if(!chatsRes.ok) return;
    const chatsData = await chatsRes.json();
    
    let allMyMessages = [];
    let dialogues = [];
    
    for(let i = 0; i < chatsData.chats.length; i++) {
        const chatId = chatsData.chats[i].id;
        const msgRes = await fetch(`https://api.avito.ru/messenger/v3/accounts/${userId}/chats/${chatId}/messages?limit=20`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        if(msgRes.ok) {
            const msgData = await msgRes.json();
            const msgs = msgData.messages.reverse().filter(m => m.type === 'text');
            
            let dialogHistory = [];
            msgs.forEach(m => {
                const author = m.author_id === userId ? "YOU" : "CLIENT";
                dialogHistory.push(`[${author}]: ${m.content.text}`);
                if (author === "YOU") {
                    allMyMessages.push(m.content.text);
                }
            });
            if(dialogHistory.length > 0) {
                 dialogues.push(dialogHistory.join('\n'));
            }
        }
    }
    
    const report = `
# Сырые данные сообщений:
${allMyMessages.slice(0, 50).map(m => "- " + m).join('\n')}

# Примеры недавних диалогов:
${dialogues.slice(0, 5).map((d, i) => `\n## Диалог ${i+1}\n${d}`).join('\n')}
    `;
    
    fs.writeFileSync('communication_dump.txt', report);
    console.log("Dump saved to communication_dump.txt");
}
run();
