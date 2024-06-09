const request = require('supertest');
const express = require('express');
const { User } = require('../app/models/profileModel');
const userRouter = require('../app/Entities/user');
const authRouter = require('../app/authentication/auth');
const { verifySecretToken } = require('../app/middleware');
const { connect, disconnect } = require('./db');

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/user', userRouter);
app.use('/auth', authRouter);

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await disconnect();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('User Routes', () => {
    it('should register a new user', async () => {
        const newUser = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/user')
            .send(newUser)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(201);
        expect(response.body.user).toBeDefined();
    });

    it('should not register a user with existing email', async () => {
        const newUser = {
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        };

        await new User(newUser).save();

        const response = await request(app)
            .post('/user')
            .send(newUser)
            .set('Content-Type', 'application/json');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already exists');
    });

    it('should search for users', async () => {
        const user1 = new User({ username: 'user1', email: 'user1@example.com', password: 'password123', confirmed: true});
        const user2 = new User({ username: 'user2', email: 'user2@example.com', password: 'password123', confirmed: true});
        await user1.save();
        await user2.save();

        const response = await request(app).get('/user');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should get user by ID', async () => {
        const user = new User({ username: 'user1', email: 'user1@example.com', password: 'password123'});
        await user.save();

        const response = await request(app).get(`/user/${user._id}`);
    
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('user1');
    });

    it('should update a user', async () => {
        // password is the hashed value of 'password123'
        const user = new User({ username: 'useredit', email: 'edit@example.com', password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq', confirmed: true});
        await user.save();

        // Login to get token
        const loginRes = await request(app)
            .post('/auth')
            .send({
                email: 'edit@example.com',
                password: 'password123'
            });

        const token = loginRes.body.token;
        const userId = loginRes.body.userId;
        const updatedData = { username: 'useredited' };

        const res = await request(app)
            .put(`/user/${userId}`)
            .send(updatedData)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Updated');
    });


    it('should delete a user', async () => {
        // password is the hashed value of 'password123'
        const user = new User({ username: 'useredit', email: 'edit@example.com', password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq', confirmed: true});
        await user.save();

        // Login to get token
        const loginRes = await request(app)
            .post('/auth')
            .send({
                email: 'edit@example.com',
                password: 'password123'
            });

        const token = loginRes.body.token;
        const userId = loginRes.body.userId;

        const res = await request(app)
            .delete(`/user/${userId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
    });

});
