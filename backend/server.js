
require("dotenv").config();

const express = require("express");

const app = express();
const PORT = 3000;

const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));
app.get("/api/coins", async (req, res) => {
    try {
        const apiKey = process.env.COINGECKO_API_KEY;
        console.log("API key loaded in server:", Boolean(apiKey));
        if (!apiKey) {
            return res.status(500).json({
                error: "CoinGecko API key is missing. Check backend/.env."
            });
        }

        const url = new URL(
            "https://api.coingecko.com/api/v3/coins/markets"
        );

        url.search = new URLSearchParams({
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: "20",
            page: "1",
            sparkline: "false",
            price_change_percentage: "24h"
        });

        const response = await fetch(url, {
            headers: {
                "x-cg-demo-api-key": apiKey
            }
        });

        if (!response.ok) {
            const details = await response.text();

            console.error("CoinGecko response:", response.status, details);

            return res.status(response.status).json({
                error: "Unable to retrieve market data from CoinGecko."
            });
        }

        const coins = await response.json();
        res.json(coins);
    } catch (error) {
        console.error("Market data error:", error.message);

        res.status(500).json({
            error: "An unexpected error occurred while fetching prices."
        });
    }
});

app.listen(PORT, () => {
    console.log(`CryptoTracker backend running at http://localhost:${PORT}`);
});
