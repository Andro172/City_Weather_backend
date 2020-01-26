# City Weather backend

City Weather frontend: [https://github.com/Andro172/City_Weather_frontend](https://github.com/Andro172/City_Weather_frontend)

## Requirements

- MongoDB
- Node.js
- npm

## Installation

Install all dependencies:
```
npm install
```

## Setup

1.) Rename example.env to .env and fill in your data.

You'll need your own openweathermap api key.
You can get it [here](https://openweathermap.org/) after you register for a free account.

2.) Create roles:
```
node init/createRoles.js
```

3.) Start server:
```
npm start
```

or with debug information
```
npm run dev
```

4.) (optional) To set any registered user as administrator run:
```
node init/createAdmin.js <username>
```
