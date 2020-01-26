# City Weather backend

City Weather frontend: [https://github.com/Andro172/City_Weather_frontend.git](https://github.com/Andro172/City_Weather_frontend.git)

## Requirements

- MongoDB
- Node.js
- npm

## Installation

Install all dependencies:
```
npm install
```
Create roles:
```
node init/createRoles.js
```
## Setup

Rename example.env to .env and fill in your data.

You'll need your own openweathermap api key.
You can get it [here](https://openweathermap.org/) after registering a free account.

Start server:
```
npm start
```

or with debug information
```
npm run dev
```

To set any registered user as administrator run:
```
node init/createAdmin.js <username>
```
