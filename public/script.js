
const searchInput = document.getElementById("search");
const coinGrid = document.getElementById("coin-grid");
const noResults = document.getElementById("no-results");

let allCoins = [];

function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
}

function createCoinCard(coin) {
    const card = document.createElement("article");
    card.className = "coin-card";

    const top = document.createElement("div");
    top.className = "coin-top";

    const image = document.createElement("img");
    image.src = coin.image;
    image.alt = "";
    image.width = 36;
    image.height = 36;
    image.style.objectFit = "contain";

    const details = document.createElement("div");

    const name = document.createElement("h3");
    name.className = "coin-name";
    name.textContent = coin.name;

    const symbol = document.createElement("p");
    symbol.className = "coin-symbol";
    symbol.textContent = coin.symbol.toUpperCase();

    details.append(name, symbol);
    top.append(image, details);

    const price = document.createElement("p");
    price.className = "coin-price";
    price.textContent = formatPrice(coin.current_price);

    const change = document.createElement("p");
    change.className = "change";

    const percentage = coin.price_change_percentage_24h;
    const validChange = typeof percentage === "number";

    if (validChange && percentage >= 0) {
        change.classList.add("positive");
        change.textContent = `▲ +${percentage.toFixed(2)}% today`;
    } else if (validChange) {
        change.classList.add("negative");
        change.textContent = `▼ ${percentage.toFixed(2)}% today`;
    } else {
        change.textContent = "24-hour change unavailable";
    }

    const marketCap = document.createElement("p");
    marketCap.className = "coin-symbol";
    marketCap.style.marginTop = "12px";
    marketCap.textContent =
        "Market cap: " +
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 2
        }).format(coin.market_cap || 0);

    card.append(top, price, change, marketCap);
    return card;
}

function renderCoins(coins) {
    coinGrid.replaceChildren();

    coins.forEach(function (coin) {
        coinGrid.appendChild(createCoinCard(coin));
    });

    noResults.style.display = coins.length === 0 ? "block" : "none";

    if (coins.length === 0) {
        noResults.textContent = "No matching cryptocurrency found.";
    }
}

function filterCoins() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredCoins = allCoins.filter(function (coin) {
        return (
            coin.name.toLowerCase().includes(searchText) ||
            coin.symbol.toLowerCase().includes(searchText)
        );
    });

    renderCoins(filteredCoins);
}

async function loadCoins() {
    noResults.style.display = "block";
    noResults.textContent = "Loading live market data...";

    try {
        const response = await fetch("/api/coins");

        if (!response.ok) {
            throw new Error("Market data request failed: " + response.status);
        }

        const coins = await response.json();

        if (!Array.isArray(coins)) {
            throw new Error("Unexpected market data response.");
        }

        allCoins = coins;
        filterCoins();

        console.log("Market data loaded:", allCoins.length, "coins");
    } catch (error) {
        console.error("Could not load market data:", error);

        coinGrid.replaceChildren();
        noResults.textContent =
            "Unable to load prices. Check the backend terminal and try again.";
        noResults.style.display = "block";
    }
}

searchInput.addEventListener("input", filterCoins);

loadCoins();

// Refresh market data every 60 seconds while the page is open.
setInterval(loadCoins, 60000);
