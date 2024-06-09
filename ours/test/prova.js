const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const {User} = require('../app/models/profileModel');
const userRouter = require('../app/Entities/user');
const {registerValidation, loginValidation} = require("../app/validation");
const {privateAccess, verifySecretToken} = require("../app/middleware");

// Create a new express application instance
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(verifySecretToken);

// Routes
app.use('/users', userRouter);

// Connect to the database before running the tests
beforeAll(async () => {
    const url = `mongodb://127.0.0.1/test_db`;
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Disconnect from the database after running the tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('User Router', () => {

    // Cleanup the users collection before each test
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('user');
    });

    it('should not register a user with an existing email', async () => {
        await new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        }).save();

        const res = await request(app)
            .post('/users')
            .send({
                username: 'anotheruser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Email already exists');
    });

    it('should search for users', async () => {
        await new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        }).save();

        const res = await request(app)
            .get('/users')
            .query({ username: 'testuser' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('username', 'testuser');
    });

    it('should get a user by ID', async () => {
        const user = await new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        }).save();

        const res = await request(app)
            .get(`/users/${user._id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('username', 'testuser');
    });

    it('should edit a user', async () => {
        const user = await new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        }).save();

        const res = await request(app)
            .put(`/users/${user._id}`)
            .set('Authorization', `Bearer ${user._id}`)  // Assuming user ID is used as token for simplicity
            .send({
                username: 'updateduser'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Updated');
    });

    it('should delete a user', async () => {
        const user = await new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        }).save();

        const res = await request(app)
            .delete(`/users/${user._id}`)
            .set('Authorization', `Bearer ${user._id}`);  // Assuming user ID is used as token for simplicity

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', user._id.toString());
    });

});
