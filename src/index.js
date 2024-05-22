document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('homeLink').addEventListener('click', () => loadPage('home'));
    document.getElementById('portfolioLink').addEventListener('click', () => loadPage('portfolio'));
    loadPage('home');
});

async function fetchData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function loadPage(page) {
    const content = document.getElementById('content');
    if (page === 'home') {
        content.innerHTML = `
        <h2>Home Page</h2>
        <p>Welcome to the Crypto Portfolio Tracker!</p>
        <h3>Top Cryptocurrencies</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price (USD)</th>
              <th>Daily Change (%)</th>
            </tr>
          </thead>
          <tbody id="cryptoTableBody"></tbody>
        </table>
      `;

        const data = await fetchData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
        if (data) {
            const tableBody = document.getElementById('cryptoTableBody');
            data.slice(0, 20).forEach(crypto => {
                const changePercent = parseFloat(crypto.price_change_percentage_24h).toFixed(2);
                const row = document.createElement('tr');
                row.innerHTML = `
            <td><img src=${crypto.image} alt= ${crypto.symbol}> ${crypto.name}</td>
            <td>$${parseFloat(crypto.current_price).toFixed(2)}</td>
            <td class="${getChangeClass(changePercent)}">${changePercent}%</td>
          `;
                tableBody.appendChild(row);
            });
        }
    } else if (page === 'portfolio') {
        content.innerHTML = `
        <h2>My Portfolio</h2>
        <form id="portfolioForm">
          <label for="cryptoSelect">Cryptocurrency:</label>
          <select id="cryptoSelect" name="cryptoSelect"></select>
          <label for="cryptoAmount">Amount:</label>
          <input type="number" id="cryptoAmount" name="cryptoAmount" min="0" step="any">
          <button type="button" id="addButton">Add to Portfolio</button>
        </form>
        <div id="portfolio"></div>
      `;

        document.getElementById('addButton').addEventListener('click', addToPortfolio);

        const data = await fetchData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
        if (data) {
            const select = document.getElementById('cryptoSelect');
            data.slice(0, 20).forEach(crypto => {
                const option = document.createElement('option');
                option.value = crypto.id;
                option.text = crypto.name;
                select.add(option);
            });
        }

        loadPortfolio();
    }
}

let portfolio = [];

async function addToPortfolio() {
    const select = document.getElementById('cryptoSelect');
    const amount = parseFloat(document.getElementById('cryptoAmount').value.trim());
    const cryptoId = select.value;
    const cryptoName = select.options[select.selectedIndex].text;

    if (!cryptoId || isNaN(amount) || amount <= 0) {
        alert('Please select a valid cryptocurrency and enter a valid amount.');
        return;
    }

    const existingCrypto = portfolio.find(crypto => crypto.id === cryptoId);
    if (existingCrypto) {
        existingCrypto.amount += amount;
    } else {
        portfolio.push({ id: cryptoId, name: cryptoName, amount });
    }

    document.getElementById('cryptoAmount').value = '';

    loadPortfolio();
}

async function loadPortfolio() {
    const portfolioDiv = document.getElementById('portfolio');
    portfolioDiv.innerHTML = '<h3>My Portfolio</h3>';

    if (portfolio.length === 0) {
        portfolioDiv.innerHTML += '<p>No cryptocurrencies in your portfolio.</p>';
        return;
    }

    const data = await fetchData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
    const cryptoData = data.reduce((acc, crypto) => {
        acc[crypto.id] = crypto;
        return acc;
    }, {});

    let totalValue = 0;
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Current Price (USD)</th>
          <th>Value (USD)</th>
          <th>Daily Change (%)</th>
        </tr>
      </thead>
      <tbody id="portfolioTableBody"></tbody>
    `;
    const tableBody = table.querySelector('tbody');

    portfolio.forEach(crypto => {
        if (cryptoData[crypto.id]) {
            const price = parseFloat(cryptoData[crypto.id].current_price);
            const changePercent = parseFloat(cryptoData[crypto.id].price_change_percentage_24h).toFixed(2);
            const value = (crypto.amount * price).toFixed(2);
            totalValue += parseFloat(value);




            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${crypto.name}</td>
            <td>${crypto.amount}</td>
            <td>$${price.toFixed(2)}</td>
            <td>$${value}</td>
            <td class="${getChangeClass(changePercent)}">${changePercent}%</td>
        `;
            tableBody.appendChild(row);
        }
    });

    portfolioDiv.appendChild(table);
    portfolioDiv.innerHTML += `<h4>Total Portfolio Value: $${totalValue.toFixed(2)}</h4>`;
}



function getChangeClass(changePercent) {
    if (changePercent > 0) {
        return 'positive-change';
    } else if (changePercent < 0) {
        return 'negative-change';
    } else {
        return 'no-change';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPage('home');
    document.querySelector('nav ul li a[href="#portfolio"]').addEventListener('click', () => loadPage('portfolio'));
});
