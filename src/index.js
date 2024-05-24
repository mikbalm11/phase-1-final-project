const API_URL = 'https://api.coingecko.com/api/v3';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('home').addEventListener('click', () => loadPage('home'));
    document.getElementById('portfolio').addEventListener('click', () => loadPage('portfolio'));
    loadPage('home'); // Load the home page by default
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
        <p>Welcome to CryptoVault home page!</p>
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

        const data = await fetchData(`${API_URL}/coins/markets?vs_currency=usd`);
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
        <h2>Portfolio Page</h2>
        <p>Welcome to CryptoVault Portfolio Tracker!</p>
        <p>Please enter your wallet ID:</p>
        <input type="text" id="walletIdInput" placeholder="Enter Wallet ID">
        <button id="retrievePortfolioBtn">Retrieve Portfolio</button>
        <div id="portfolioTable"></div>
    
        <!-- Add Portfolio section -->
        <h2>Add Portfolio</h2>
        <p>Enter wallet ID (optional):</p>
        <input type="text" id="newWalletIdInput" placeholder="Enter Wallet ID">
        <button id="addPortfolioBtn">Add Portfolio</button>
        <div id="generatedWalletId"></div>
      `;

      document.getElementById('retrievePortfolioBtn').addEventListener('click', loadPortfolio);
      document.getElementById('addPortfolioBtn').addEventListener('click', addPortfolio);
    }
}

function addPortfolio() {
    const walletIdInput = document.getElementById('newWalletIdInput');
    let walletId = walletIdInput.value.trim();

    // If no wallet ID is provided, generate a random one
    if (!walletId) {
        walletId = generateRandomWalletId();
        document.getElementById('generatedWalletId').textContent = `Generated Wallet ID: ${walletId}`;
    }

    // Your logic to add the portfolio item goes here
}

function generateRandomWalletId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 34;
    let randomId = '';
    for (let i = 0; i < length; i++) {
        randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomId;
}

async function addToPortfolio() {
    const select = document.getElementById('cryptoSelect');
    const amount = parseFloat(document.getElementById('cryptoAmount').value.trim());
    const cryptoId = select.value;
    const cryptoName = select.options[select.selectedIndex].text;

    if (!cryptoId || isNaN(amount) || amount <= 0) {
        alert('Please select a valid cryptocurrency and enter a valid amount.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/portfolios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: cryptoId, name: cryptoName, amount }),
        });
        if (!response.ok) {
            throw new Error('Failed to add cryptocurrency to portfolio');
        }
        loadPortfolio();
    } catch (error) {
        console.error('Error adding to portfolio:', error);
    }
}

async function loadPortfolio() {
    const walletId = document.getElementById('walletIdInput').value.trim();
    if (walletId) {
        try {
            const response = await fetch(`http://localhost:3000/portfolios`);
            if (!response.ok) {
                throw new Error('Failed to fetch portfolio data');
            }
            const portfolios = await response.json();

            // Find the portfolio object with the matching walletId
            const portfolio = portfolios.find(portfolio => portfolio.id === walletId);

            if (portfolio) {
                // Portfolio found, display its cryptocurrencies
                const cryptoData = await fetchData(`${API_URL}/coins/markets?vs_currency=usd`);
                
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

                portfolio.cryptocurrencies.forEach(crypto => {
                    const cryptoInfo = cryptoData.find(item => item.id === crypto.id);
                    if (cryptoInfo) {
                        const price = parseFloat(cryptoInfo.current_price);
                        const changePercent = parseFloat(cryptoInfo.price_change_percentage_24h).toFixed(2);
                        const value = (crypto.amount * price).toFixed(2);
                        totalValue += parseFloat(value);

                        const row = document.createElement('tr');
                        row.innerHTML = `
                          <td><img src=${cryptoInfo.image} alt="${cryptoInfo.symbol}"> ${crypto.name}</td>
                          <td>${crypto.amount}</td>
                          <td>$${price.toFixed(2)}</td>
                          <td>$${value}</td>
                          <td class="${getChangeClass(changePercent)}">${changePercent}%</td>
                        `;
                        tableBody.appendChild(row);
                    }
                });

                const portfolioTable = document.getElementById('portfolioTable');
                portfolioTable.innerHTML = '';
                portfolioTable.appendChild(table);
                portfolioTable.innerHTML += `<h4>Total Portfolio Value: $${totalValue.toFixed(2)}</h4>`;

            } else {
                // Portfolio not found
                const portfolioTable = document.getElementById('portfolioTable');
                portfolioTable.innerHTML = '<p>No portfolio found for the provided wallet ID.</p>';
            }

        } catch (error) {
            console.error('Error loading portfolio:', error);
        }
    } else {
        alert('Please enter your wallet ID.');
    }
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
