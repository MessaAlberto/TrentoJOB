const request = require('supertest');
const express = require('express');
const { Profile } = require('../../app/models/profileModel');
const authRouter = require('../../app/authentication/auth');
const { connect, disconnect } = require('../db');
const {verifySecretToken} = require("../../app/middleware");
const {raw} = require("express");
const {sign} = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/auth', authRouter);

let token;
let userId;

beforeAll(async () => {
    await connect();

    // Password is the hash of 'password123'
    const user = new Profile({
        username: 'testuser',
        email: 'testuser@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        role: 'user',
        confirmed: true,
    });
    await user.save();

    // Password is the hash of 'password123'
    const userNotConfirmed = new Profile({
        username: 'testuserNC',
        email: 'userNotConfirmed@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        role: 'user',
        confirmed: false,
    });
    await userNotConfirmed.save();
    userId = userNotConfirmed._id;

    // Password is the hash of 'password123'
    const newOrganisation = new Profile( {
        username: 'testorganisation',
        email: 'testorganisation@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        taxIdCode: 'CMDSML01B23F443D',
        role: 'organisation',
        confirmed: true,
        verified: false
    });
    await newOrganisation.save();
});

afterAll(async () => {
    await Profile.deleteMany({});
    await disconnect();
});

describe('Auth Routes', () => {
    it('should login the user and return a token', async () => {
        const user = {
            email: 'testuser@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/auth')
            .send(user);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successfully');
        expect(response.body.username).toBe('testuser');
        expect(response.body.role).toBe('user');
        expect(response.body.token).toBeDefined();
        token = response.body.token;
    });

    it('should fail to login with incorrect credentials', async () => {
        const user = {
            email: 'testuser@example.com',
            password: 'wrongpassword'
        };

        const response = await request(app)
            .post('/auth')
            .send(user);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email or password is wrong');
    });

    it('should fail to login with unconfirmed account', async () => {
        const user = {
            email: 'userNotConfirmed@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/auth')
            .send(user);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Email was not confirmed');
    });

    it('should fail to login with unverified orgnaiztion', async () => {
        const user = {
            email: 'testorganisation@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/auth')
            .send(user);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("this account hasn't been verified yet");
    });

    it('should confirm the user email', async () => {
        const mailToken = sign({ _id: userId }, process.env.JWT_SECRET_MAIL, { expiresIn: '1h' });

        const response = await request(app)
            .get(`/auth/${mailToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('You have been verified');
    });

    it('should logout after login', async () => {
        const response = await request(app)
            .delete('/auth')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logout successfully');
    })
});
