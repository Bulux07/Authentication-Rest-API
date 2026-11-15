const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || 'test-secret';

const app = require('../app');
const User = require('../model/User');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

const user = { name: 'Test User', email: 'test@example.com', password: 'Passw0rd!' };

// Registers and logs in, then returns the JWT from the 'auth-token' header
async function getToken() {
    await request(app).post('/api/user/register').send(user);
    const res = await request(app)
        .post('/api/user/login')
        .send({ email: user.email, password: user.password });
    return res.header['auth-token'];
}

test('login returns a token in the auth-token header', async () => {
    const token = await getToken();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
});

test('rejects a request with no token (401)', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(401);
});

test('rejects a garbage token (400)', async () => {
    const res = await request(app).get('/api/posts').set('auth-token', 'not-a-real-token');
    expect(res.statusCode).toBe(400);
});

test('rejects a token signed with the wrong secret (400)', async () => {
    const forged = jwt.sign({ _id: new mongoose.Types.ObjectId() }, 'wrong-secret');
    const res = await request(app).get('/api/posts').set('auth-token', forged);
    expect(res.statusCode).toBe(400);
});

test('rejects an expired token (400)', async () => {
    const expired = jwt.sign(
        { _id: new mongoose.Types.ObjectId() },
        process.env.TOKEN_SECRET,
        { expiresIn: -10 }
    );
    const res = await request(app).get('/api/posts').set('auth-token', expired);
    expect(res.statusCode).toBe(400);
});

test('allows a request with a valid token and returns the protected data', async () => {
    const token = await getToken();
    const res = await request(app).get('/api/posts').set('auth-token', token);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts.title).toBe('My Protected Data');
    expect(res.body.loggedUser.email).toBe(user.email);
});

test('does not leak the password hash', async () => {
    const token = await getToken();
    const res = await request(app).get('/api/posts').set('auth-token', token);

    expect(res.body.loggedUser.password).toBeUndefined();
});