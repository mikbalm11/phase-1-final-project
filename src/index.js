// Define the API URL for CoinGecko
const API_URL = 'https://api.coingecko.com/api/v3';

// Event listener to load pages on DOM content load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('home').addEventListener('click', () => loadPage('home'));
    document.getElementById('portfolio').addEventListener('click', () => loadPage('portfolio'));
    //loadPage('home'); // Load the home page by default - best to have this omitted as too many requests end api conn
});

async function fetchData(apiUrl) {
    // Function to fetch data from an API
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function loadPortfolio(wallId = null) {
    // Function to load portfolio based on wallet ID - GET
    // Retrieves from either updatePortfolio - parameter, or retrieve button - element
    let walletId;
    if (wallId) {
        walletId = wallId;
    } else {
        walletId = document.getElementById('walletIdInput').value.trim();
    }
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
                // Portfolio found but it's empty :(
                const portfolioTable = document.getElementById('portfolioTable');
                if (portfolio.cryptocurrencies.length === 0) {
                    portfolioTable.innerHTML = '<p>This wallet has no cryptocurrencies yet.</p>';
                    return;
                } else {
                    // Portfolio found, display its cryptocurrencies
                    const cryptoData = await fetchData(`${API_URL}/coins/markets?vs_currency=usd`);

                    let totalValue = 0;
                    const table = document.createElement('table');
                    table.innerHTML = `
                      <thead>
                        <tr>
                          <br>
                          <div>Retrieving Wallet ID: ${walletId} successful.</div>
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

                    portfolioTable.innerHTML = '';
                    portfolioTable.appendChild(table);
                    portfolioTable.innerHTML += `<h4>Total Portfolio Value: $${totalValue.toFixed(2)}</h4>`;
                }
            } else {
                // Portfolio not found
                const portfolioTable = document.getElementById('portfolioTable');
                portfolioTable.innerHTML = `<p>No portfolio found for the provided wallet ID.</p>`;
            }

        } catch (error) {
            console.error('Error loading portfolio:', error);
        }
    } else {
        const portfolioTable = document.getElementById('portfolioTable');
        portfolioTable.innerHTML = `<p>Input field cannot be empty. Please enter a valid wallet ID.</p>`;
    }
}

function addPortfolio() {
    // Function to add a new portfolio - POST
    const walletIdInput = document.getElementById('newWalletIdInput');
    let walletId = walletIdInput.value.trim();

    // If no wallet ID is provided, generate a random one
    if (!walletId || walletId.length !== 34) {
        walletId = generateRandomWalletId();
        document.getElementById('generatedWalletId').textContent = `Generated Wallet ID: ${walletId}`;
    }

    const newPortfolio = {
        id: walletId,
        cryptocurrencies: []
    };

    try {
        fetch('http://localhost:3000/portfolios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPortfolio),
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to add portfolio');
            }
        }).catch(error => {
            console.error('Error adding portfolio:', error);
        });
    } catch (error) {
        console.error('Error adding portfolio:', error);
    }
}

function getChangeClass(changePercent) {
    // Function to determine CSS class for displaying change
    if (changePercent > 0) {
        return 'positive-change';
    } else if (changePercent < 0) {
        return 'negative-change';
    } else {
        return 'no-change';
    }
}

function generateRandomWalletId() {
    // Function to generate a random wallet ID
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 34;
    let randomId = '';
    for (let i = 0; i < length; i++) {
        randomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomId;
}

async function updatePortfolio(walletId) {
    // Function to update portfolio with new cryptocurrency - PUT
    const select = document.getElementById('cryptoSelect');
    const amount = parseFloat(document.getElementById('cryptoAmount').value.trim());
    const cryptoId = select.value;
    const cryptoName = select.options[select.selectedIndex].text;

    if (!cryptoId || isNaN(amount) || amount <= 0) {
        const updatedWalletId = document.getElementById('updatedWalletId');
        updatedWalletId.innerHTML = "Please enter a valid amount.";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/portfolios`);
        if (!response.ok) {
            throw new Error('Failed to fetch portfolios');
        }
        const portfolios = await response.json();
        const portfolio = portfolios.find(portfolio => portfolio.id === walletId);

        if (portfolio) {
            const existingCrypto = portfolio.cryptocurrencies.find(crypto => crypto.id === cryptoId);
            if (existingCrypto) {
                existingCrypto.amount += amount;
            } else {
                portfolio.cryptocurrencies.push({ id: cryptoId, name: cryptoName, amount });
            }

            const updateResponse = await fetch(`http://localhost:3000/portfolios/${walletId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portfolio),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update portfolio');
            }

            const updatedWalletId = document.getElementById('updatedWalletId');
            updatedWalletId.innerHTML = "Portfolio updated successfully.";
            loadPortfolio(walletId);
        } else {
            const updatedWalletId = document.getElementById('updatedWalletId');
            updatedWalletId.innerHTML = "Wallet ID is not found. Please enter a valid wallet ID.";
        }
    } catch (error) {
        console.error('Error updating portfolio:', error);
    }
}

async function displayUpdateForm(portfolio) {
    // Function to add options to the select element for each cryptocurrency
    const updateForm = document.getElementById('updateForm');
    updateForm.innerHTML = `
        <p>Select Cryptocurrency:</p>
        <select id="cryptoSelect"></select>
        <p>Enter Amount:</p>
        <input type="number" id="cryptoAmount" placeholder="Enter Amount">
        <button id="updateCryptoBtn">Update Cryptocurrency</button>
    `;

    const data = await fetchData(`${API_URL}/coins/markets?vs_currency=usd`);
    const cryptoSelect = document.getElementById('cryptoSelect');

    data.slice(0, 20).forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.id;
        option.text = crypto.name;
        cryptoSelect.appendChild(option);
    });

    document.getElementById('updateCryptoBtn').addEventListener('click', () => updatePortfolio(portfolio.id));
}

async function checkWalletId() {
    // Function to check if wallet ID exists before updating portfolio
    const walletId = document.getElementById('modWalletIdInput').value.trim();
    if (!walletId) {
        const portfolioTable = document.getElementById('portfolioTable');
        portfolioTable.innerHTML = "Wallet ID is not found. Please enter a valid wallet ID.";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/portfolios`);
        if (!response.ok) {
            throw new Error('Failed to fetch portfolios');
        }
        const portfolios = await response.json();
        const portfolio = portfolios.find(portfolio => portfolio.id === walletId);

        if (portfolio) {
            displayUpdateForm(portfolio);
        } else {
            const updatedWalletId = document.getElementById('updatedWalletId');
            updatedWalletId.innerHTML = "Wallet ID is not found. Please enter a valid wallet ID.";
        }
    } catch (error) {
        console.error('Error checking wallet ID:', error);
    }
}

async function deletePortfolio() {
    // Function to delete a portfolio - DELETE
    const walletIdInput = document.getElementById('voidWalletIdInput');
    const walletId = walletIdInput.value.trim();
    const deletionStatus = document.getElementById('deletionStatus');

    if (!walletId) {
        deletionStatus.textContent = 'Please enter a wallet ID.';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/portfolios');
        if (!response.ok) {
            throw new Error('Failed to fetch portfolios');
        }
        const portfolios = await response.json();

        const portfolioExists = portfolios.some(portfolio => portfolio.id === walletId);
        if (!portfolioExists) {
            deletionStatus.textContent = 'Portfolio not found.';
            return;
        }

        const deleteResponse = await fetch(`http://localhost:3000/portfolios/${walletId}`, {
            method: 'DELETE',
        });
        if (!deleteResponse.ok) {
            throw new Error('Failed to delete portfolio');
        }

        deletionStatus.textContent = 'Portfolio deleted successfully!';
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        deletionStatus.textContent = 'An error occurred while deleting the portfolio.';
    }
}

async function upvote(cryptoSymbol) {
    // called from evenet listener on the homepage
    // populate the new column with the new increased value

    const countElement = document.getElementById(`upvoteCount${cryptoSymbol}`);
    let upvoteCount = parseInt(countElement.textContent);
    upvoteCount++;
    countElement.textContent = upvoteCount;

    try {
        const response = await fetch(`http://localhost:3000/upvoteCount`);
        if (!response.ok) {
            throw new Error('Failed to fetch upvotes');
        }
        const upvotes = await response.json();

        let crypto = upvotes.find(cryptos => cryptos.id === cryptoSymbol);
        let updateResponse;

        if (crypto) {
            crypto.upvotes = upvoteCount;
            updateResponse = await fetch(`http://localhost:3000/upvoteCount/${cryptoSymbol}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(crypto),
            });
        } else {
            crypto = { id: cryptoSymbol, upvotes: upvoteCount };
            upvotes.push(crypto);

            updateResponse = await fetch(`http://localhost:3000/upvoteCount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(crypto),
            });
        }

        if (!updateResponse.ok) {
            throw new Error('Failed to update upvotes');
        }
    } catch (error) {
        console.error('Error updating upvotes:', error);
    }
}

async function loadPage(page) {
    // Function to load pages based on page selection home or portfolio
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
              <th>Like Count</th>
              <th>Like Button</th>
            </tr>
          </thead>
          <tbody id="cryptoTableBody"></tbody>
        </table>
        <div id="tooltip" class="tooltip"></div>
      `;

        const cryptoData = await fetchData(`${API_URL}/coins/markets?vs_currency=usd`);
        const upvoteData = await fetchData('http://localhost:3000/upvoteCount');
        const tooltip = document.getElementById('tooltip');

        if (cryptoData) {
            const tableBody = document.getElementById('cryptoTableBody');
            cryptoData.slice(0, 20).forEach(crypto => {
                const changePercent = parseFloat(crypto.price_change_percentage_24h).toFixed(2);
                const upvoteCount = upvoteData.find(upvote => upvote.id === crypto.symbol)?.upvotes || 0;
                //console.log(upvoteCount);
                const row = document.createElement('tr');
                row.innerHTML = `
            <td><img src=${crypto.image} alt=${crypto.symbol}> ${crypto.name}</td>
            <td>$${parseFloat(crypto.current_price).toFixed(2)}</td>
            <td class="${getChangeClass(changePercent)}">${changePercent}%</td>
            <td id="upvoteCount${crypto.symbol}">${upvoteCount}</td>
            <td>
              <form id="upvoteForm${crypto.symbol}">
                <button type="submit">Upvote</button>
              </form>
            </td>
          `;
                // have a button element on new td, with upvote count

                tableBody.appendChild(row);

                row.addEventListener('mouseover', (event) => {
                    tooltip.style.display = 'block';
                    tooltip.textContent = `Market Cap: $${crypto.market_cap.toLocaleString()} \nTotal Volume: ${crypto.total_volume.toLocaleString()} \nCirculating Supply: ${crypto.circulating_supply.toLocaleString()}`;
                    tooltip.style.left = `${event.pageX + 10}px`;
                    tooltip.style.top = `${event.pageY + 10}px`;
                });

                row.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });

                document.getElementById(`upvoteForm${crypto.symbol}`).addEventListener('submit', (event) => {
                    event.preventDefault();
                    upvote(crypto.symbol);
                });
            });
        }
        // have an event listener to handle user click for upvotes/likes
        // have it a callback function that would process the upvote
        //document.getElementById(`upvoteBtn${crypto.symbol}`).addEventListener('click', upvote(this));

    } else if (page === 'portfolio') {
        content.innerHTML = `
        <h2>Portfolio Page</h2>
        <p>Welcome to CryptoVault Portfolio Tracker!</p>
        <p>Please enter your wallet ID:</p>
        <input type="text" id="walletIdInput" placeholder="Enter Wallet ID">
        <button id="retrievePortfolioBtn">Retrieve Portfolio</button>
        <div id="portfolioTable"></div>
    
        <h2>Add Portfolio</h2>
        <p>Enter wallet ID (optional):</p>
        <input type="text" id="newWalletIdInput" placeholder="Your wallet ID should be 34 characters">
        <button id="addPortfolioBtn">Add Portfolio</button>
        <div id="generatedWalletId"></div>

        <h2>Update Portfolio</h2>
        <p>Enter wallet ID:</p>
        <input type="text" id="modWalletIdInput" placeholder="Enter Wallet ID">
        <button id="modifyPortfolioBtn">Update Portfolio</button>
        <div id="updateForm"></div>
        <div id="updatedWalletId"></div>

        <h2>Delete Portfolio</h2>
        <p>Enter wallet ID:</p>
        <input type="text" id="voidWalletIdInput" placeholder="Enter Wallet ID">
        <button id="deletePortfolioBtn">Delete Portfolio</button>
        <div id="deletionStatus"></div>
      `;

        document.getElementById('retrievePortfolioBtn').addEventListener('click', () => {
            // Retrieve the wallet ID
            const walletId = document.getElementById('walletIdInput').value.trim();
            // Call loadPortfolio with the retrieved wallet ID
            loadPortfolio(walletId);
        });
        document.getElementById('addPortfolioBtn').addEventListener('click', addPortfolio);
        document.getElementById('modifyPortfolioBtn').addEventListener('click', checkWalletId);
        document.getElementById('deletePortfolioBtn').addEventListener('click', deletePortfolio);
    }
}
