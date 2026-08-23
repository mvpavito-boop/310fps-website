const fetch = require('node-fetch');
async function run() {
    const clientId = "JdexzBCkg0atg9w4eb61";
    const clientSecret = "na9eG5NGFE-v4hNYiBT1Btjs0eji5dF0PZ95uHjh";
    const userId = "111007456";

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const tokenRes = await fetch('https://api.avito.ru/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    console.log("Token:", token ? "OK" : "Error");

    const reviewsRes = await fetch(`https://api.avito.ru/ratings/v1/users/${userId}/reviews?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Reviews status:", reviewsRes.status);
    const reviewsData = await reviewsRes.json();
    console.log("Reviews:", JSON.stringify(reviewsData, null, 2).slice(0, 500));
}
run();
