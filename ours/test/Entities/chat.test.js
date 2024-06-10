const request = require('supertest');
const express = require('express');
const { Profile } = require('../../app/models/profileModel');
const chatRouter = require('../../app/Entities/chat');
const authRouter = require('../../app/authentication/auth');
const { connect, disconnect } = require('../db');
const {verifySecretToken} = require("../../app/middleware");

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/auth', authRouter);
app.use('/chat', chatRouter);

let tokenA, userAId;
let tokenB, userBId;
let chatId;

beforeAll(async () => {
    await connect();

    // Password is the hash of 'password123'
    const userA = new Profile({
        username: 'testuserA',
        email: 'userA@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        role: 'user',
        confirmed: true,
    });
    await userA.save();

    // Password is the hash of 'password123'
    const userB = new Profile({
        username: 'testuserB',
        email: 'userB@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        role: 'user',
        confirmed: true,
    });
    await userB.save();

    userAId = userA._id;
    userBId = userB._id;


    // Login as userA to get the token
    let response = await request(app)
        .post('/auth')
        .send({
            email: 'userA@example.com',
            password: 'password123',
        });

    tokenA = response.body.token;

    response = await request(app)
        .post('/auth')
        .send({
            email: 'userB@example.com',
            password: 'password123',
        });

    tokenB = response.body.token;
});

afterAll(async () => {
    await disconnect();
});

describe('Chat Routes', () => {
    it('should create a new chat', async () => {
        const response = await request(app)
            .post(`/chat/${userBId}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.status).toBe(200);
        expect(response.body.chat_id).toBeDefined();
        chatId = response.body.chat_id;
    });

    it('should not create a new chat with oneself', async () => {
        const response = await request(app)
            .post(`/chat/${userAId}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Bad Request');
    });

    it('should not create a duplicate chat', async () => {
        const response = await request(app)
            .post(`/chat/${userBId}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Chat already exists');
    });

    it('should send a message', async () => {
        const response = await request(app)
            .patch(`/chat/${chatId}`)
            .send({ text: 'Hello, this is a test message' })
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('message sent');
    });

    it('should get chat details', async () => {
        const response = await request(app)
            .get(`/chat/${chatId}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.status).toBe(200);
        expect(response.body._id).toBe(chatId);
    });

    it('should receive a message', async () => {
        const response = await request(app)
            .get(`/chat/${chatId}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.status).toBe(200);
        expect(response.body._id).toBe(chatId);
        expect(response.body.messages.length).toBe(1);
    });

    it('should delete a chat', async () => {
        const response = await request(app)
            .delete(`/chat/${chatId}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(response.status).toBe(200);
        expect(response.body._id).toBe(chatId);
    });
});
