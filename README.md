# Phase-1 Final Project

## Learning Goals

- Design and architect features across a frontend
- Communicate and collaborate in a technical environment
- Integrate JavaScript and an external API
- Debug issues in small- to medium-sized projects
- Build and iterate on a project MVP

## CryptoVault

- In this project, I'll create a single-page application to maintain a real-time cryptocurrency portfolio.
- Given the abundance of available APIs for cryptocurrencies, it seemed reasonable that I would have numerous options and flexibility.
- My main objective is to display the user's current portfolio on this page and fetch real-time data as frequently as possible.
- I would greatly appreciate using coin logos to facilitate everyone's tracking of this portfolio.
- Below this page, I also aim to implement the top n cryptocurrencies by volume and their daily gains/losses.
- Based on my initial assessment, I would like to use CoinGecko's API as I find it the most structured one for the needs of this project.
- I have also created a logo just to make it a bit more professional, i liked the colors, so I'll stick with them on stylesheet.

## Project Pitch
CryptoVault is an application designed to help users explore the exciting world of cryptocurrency. It offers features to track cryptocurrency portfolios, providing insights into current prices, value fluctuations, and daily changes in the market. Whether you're a seasoned investor or just getting started with cryptocurrency, CryptoVault is here to simplify portfolio management and keep you informed about your investments.

## Core Features of MVP
1. **Portfolio Tracking**: Users can track their cryptocurrency portfolios by entering their wallet IDs. CryptoVault retrieves and displays the cryptocurrencies associated with the provided wallet ID, along with their current values and daily changes.
2. **Add Portfolio**: Users have the option to add new portfolios by entering a wallet ID. If no wallet ID is provided, CryptoVault generates a random one for the user.
3. **Update Portfolio**: Users can update their portfolios by adding more cryptocurrencies to their existing holdings. CryptoVault retrieves cryptocurrency data from an external API to ensure accuracy.
4. **Delete Portfolio**: Users can delete portfolios associated with specific wallet IDs.

## API Data and Usage
CryptoVault utilizes the CoinGecko API to fetch real-time cryptocurrency data. This data includes information such as current prices, price changes over 24 hours, and cryptocurrency symbols. The application uses this data to display portfolio information, including cryptocurrency names, current prices, total portfolio values, and daily percentage changes.

## Challenges Expected
1. **API Integration**: Ensuring seamless integration with the CoinGecko API to fetch accurate and up-to-date cryptocurrency data.
2. **Error Handling**: Implementing robust error handling mechanisms to gracefully handle situations such as network errors, API failures, or invalid user input.
3. **User Experience**: Designing an intuitive and user-friendly interface for managing portfolios and navigating through different sections of the application.
4. **Security**: Implementing security measures to protect user data and prevent unauthorized access to portfolios.

## Meeting Project Requirements
- **Portfolio Management**: CryptoVault allows users to manage their cryptocurrency portfolios, including adding, updating, and deleting portfolios.
- **API Integration**: The application integrates with the CoinGecko API to fetch real-time cryptocurrency data for portfolio tracking.
- **User Interaction**: Users can interact with the application through a web interface, entering wallet IDs to retrieve portfolio information.
- **Error Handling**: CryptoVault implements error handling to provide informative messages to users in case of API failures, invalid inputs, or other errors.
- **Documentation**: This README file serves as documentation for the CryptoVault project, providing an overview of its features, API usage, challenges, and meeting project requirements.

## Conclusion
CryptoVault aims to provide users with a comprehensive solution for managing their cryptocurrency investments. With its intuitive interface, real-time data updates, and portfolio tracking capabilities, CryptoVault empowers users to make informed decisions and navigate the dynamic world of cryptocurrency with confidence.
