# Authentication REST API

[![Tests](https://github.com/Bulux07/Authentication-Rest-API/actions/workflows/test.yml/badge.svg)](https://github.com/Bulux07/Authentication-Rest-API/actions/workflows/test.yml)

A REST API for user registration and login, built with Node.js, Express 5, and MongoDB. It issues JSON Web Tokens (JWT) on login and uses them to protect routes.

## Features

- User registration and login with JWT authentication
- Passwords hashed with bcrypt before they are stored
- Request validation with Joi (name, email, and password strength rules)
- Token-protected routes using a custom middleware
- Security middleware: Helmet headers, CORS, and rate limiting on the user routes
- Automated integration tests (Jest, Supertest, in-memory MongoDB)
- GitHub Actions workflow that runs the tests on every push and pull request

## Tech Stack

Node.js, Express 5, MongoDB with Mongoose, JSON Web Tokens, bcryptjs, Joi, Jest, Supertest, mongodb-memory-server, GitHub Actions

## Getting Started

### Prerequisites

- Node.js
- A MongoDB database, either local or a MongoDB Atlas connection string

### Installation

```bash
git clone https://github.com/Bulux07/Authentication-Rest-API.git
cd Authentication-Rest-API
npm install
```

### Configuration

Create a `.env` file in the project root:

```
TOKEN_SECRET=replace-with-a-long-random-string
DB_CONNECT=mongodb://localhost:27017/auth
PORT=3000
```

| Variable       | Description                                  |
| -------------- | -------------------------------------------- |
| `TOKEN_SECRET` | Secret used to sign and verify JWTs          |
| `DB_CONNECT`   | MongoDB connection string                    |
| `PORT`         | Port the server listens on (default `3000`)  |

The server refuses to start if `TOKEN_SECRET` or `DB_CONNECT` is missing. Never commit your `.env` file. It is listed in `.gitignore`.

To generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Run the server

```bash
npm start       # runs node index.js
npm run dev     # runs with nodemon (auto-restart on changes)
```

The API is then available at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint             | Requires token | Description                           |
| ------ | -------------------- | -------------- | ------------------------------------- |
| GET    | `/`                  | No             | Health check                          |
| POST   | `/api/user/register` | No             | Create a new user                     |
| POST   | `/api/user/login`    | No             | Log in with email and password, receive a JWT |
| GET    | `/api/posts`         | Yes            | Example protected route (send the JWT in the `auth-token` header) |

### Register

`POST /api/user/register`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Passw0rd!"
}
```

Validation rules:

- `name`: 2 to 50 characters
- `email`: a valid email address
- `password`: at least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character (`@$!%*?&`)

Success: `200` with `{ "user": "<user id>" }`

Errors: `400` for invalid input or an email that is already registered.

### Login

`POST /api/user/login`

```json
{
  "email": "jane@example.com",
  "password": "Passw0rd!"
}
```

Success: `200`. The JWT is returned in the `auth-token` response header and in the response body.

Errors: `400` for invalid input, an unknown email, or a wrong password.

### Protected route

`GET /api/posts` requires the token in an `auth-token` header:

```bash
curl http://localhost:3000/api/posts \
  -H "auth-token: <your token>"
```

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| `200`  | Valid token, protected data returned            |
| `401`  | No token provided                               |
| `400`  | Invalid, forged, or expired token               |

The password hash is never included in responses.

Note: `/api/user` is rate limited to 100 requests per 15 minutes per IP address.

## Testing

```bash
npm test
```

The tests use an in-memory MongoDB instance (`mongodb-memory-server`), so they never touch your real database and need no `.env` file or setup. They cover:

- Registering a user, invalid input, and duplicate emails
- Logging in with correct and incorrect credentials
- Rejecting requests with a missing, garbage, forged, or expired token
- Accessing a protected route with a valid token
- Making sure the password hash is not leaked in responses

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/test.yml`) installs dependencies and runs `npm test` on every push and pull request. The `main` branch is protected by a ruleset that requires the test check to pass before changes can be merged.

## Project Structure

```
.
├── .github/workflows/test.yml   # CI workflow
├── model/User.js                # Mongoose user schema
├── routes/
│   ├── auth.js                  # register and login routes
│   ├── post.js                  # protected route
│   └── verifiedToken.js         # JWT verification middleware
├── tests/
│   ├── auth.test.js             # registration and login tests
│   └── posts.test.js            # protected route tests
├── app.js                       # Express app (middleware and routes)
├── index.js                     # entry point (DB connection and server start)
└── validation.js                # Joi validation schemas
```

`app.js` and `index.js` are separate on purpose. Tests import the app without connecting to a real database or opening a port.

## License

ISC
