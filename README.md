# Coin Do Blockchain API

This project provides a RESTful API for managing wallets and blockchain operations.

## Installation

To install and run this project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:

   ```bash
   cd blockchain-docoin
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

The server will start running on port 3000 by default, network wi-Fi or localhost.

## Usage

Once the server is running, you can interact with the API using HTTP requests. You can use tools like cURL or Postman to send requests to the defined endpoints.

## Endpoints

The API provides the following endpoints:

## Auth

- `/auth/signup`: Sign up a new user and create a wallet.
- `/auth/signin`: Sign in with an existing wallet.

## Wallet

- `/wallets/detail`: Get details of a specific wallet.
- `/wallets/balance`: Get the balance of a wallet.
- `/wallets/transfer`: Transfer funds from you wallet to another.

## Blockchain

- `/blockchain`: Get a list of all wallets.
- `/blockchain/balance`: Get the balance of a blockchain.
- `/blockchain/transfer`: Transfer funds from one wallet to another.
- `/blockchain/mine`: Mine new blocks in the blockchain.

For detailed information on each endpoint, refer to the API documentation.

## Contributing

Contributions to this project are welcome! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Submit a pull request.

Please ensure that your code follows the established coding style and includes appropriate tests.

## License

This project is licensed under the [MIT License](LICENSE).
