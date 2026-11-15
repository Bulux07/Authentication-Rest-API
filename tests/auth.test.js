const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || 'test-secret';

const app = require('../app');
const User = require('../model/User');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await User.init(); // waits for the unique email index to build
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

test('should successfully register a new user', async () => {
    const res = await request(app)
        .post('/api/user/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'Passw0rd!' });

    expect(res.statusCode).toBe(200); // adjust to whatever your route returns
});

test('should fail registration with invalid data', async () => {
    const res = await request(app)
        .post('/api/user/register')
        .send({ name: 'A', email: 'not-an-email', password: 'weak' });

    expect(res.statusCode).toBe(400);
});

test('should reject a duplicate email', async () => {
    const user = { name: 'Test User', email: 'test@example.com', password: 'Passw0rd!' };

    await request(app).post('/api/user/register').send(user);
    const res = await request(app).post('/api/user/register').send(user);

    expect(res.statusCode).toBe(400); // adjust to what your route returns
});

test('should log in with correct credentials', async () => {
    const user = { name: 'Test User', email: 'test@example.com', password: 'Passw0rd!' };

    await request(app).post('/api/user/register').send(user);
    const res = await request(app)
        .post('/api/user/login')
        .send({ email: user.email, password: user.password });

    expect(res.statusCode).toBe(200);
});

test('should reject login with a wrong password', async () => {
    const user = { name: 'Test User', email: 'test@example.com', password: 'Passw0rd!' };

    await request(app).post('/api/user/register').send(user);
    const res = await request(app)
        .post('/api/user/login')
        .send({ email: user.email, password: 'WrongPass1!' });

    expect(res.statusCode).toBe(400); // adjust to what your route returns
});