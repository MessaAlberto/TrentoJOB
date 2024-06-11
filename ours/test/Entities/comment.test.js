const request = require('supertest');
const express = require('express');
const {Profile} = require('../../app/models/profileModel');
const {Event} = require('../../app/models/eventModel');
const commentRouter = require('../../app/Entities/comment');
const authRouter = require('../../app/authentication/auth');
const { verifySecretToken } = require('../../app/middleware');
const { connect, disconnect } = require('../db');

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/auth', authRouter);
app.use('/comment', commentRouter);

let userId, token;
let eventId;
let commentId;

beforeAll(async () => {
    await connect();

    // Password is the hash of 'password123'
    const user = new Profile({
        username: 'testuser',
        email: 'user@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        role: 'user',
        confirmed: true,
    });
    await user.save();

    // Login as userA to get the token
    let response = await request(app)
        .post('/auth')
        .send({
            email: 'user@example.com',
            password: 'password123',
        });

    userId = user._id;
    token = response.body.token;

    const event = new Event({
        title: 'event',
        description: 'description',
        date: '2024-06-09T17:36:00.000+00:00',
        location: 'location',
        maxNumberParticipants: 10,
        owner: {
            username: 'testuser',
            id: userId,
            role: 'user',
        }
    });

    await event.save();

    eventId = event._id;

});

afterAll(async () => {
    await Profile.deleteMany({});
    await Event.deleteMany({});
    await disconnect();
});

describe('Comment Routes', () => {

    it('should create a new comment', async () => {
        const response = await request(app)
            .post(`/comment/${eventId}`)
            .send({text: 'test text'})
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Comment added');

        commentId = response.body._id;
    });

    it('should not crete a comment since there is no text', async () => {
        const response = await request(app)
            .post(`/comment/${eventId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Validation error');
    });

    it('should not crete a comment from a guest', async () => {
        const response = await request(app)
            .post(`/comment/${eventId}`)
            .send({text: 'test text'});

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Unauthorized access');
    });

    it('should not create a new comment with a wrong id', async () => {
        const response = await request(app)
            .post(`/comment/invalidId`)
            .send({text: 'test text'})
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });

    it('should get all comments of an event', async () => {
        const response = await request(app)
            .get(`/comment/${eventId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });

    it('should delete a comment', async () => {
        const response = await request(app)
            .delete(`/comment/${commentId}`)
            .send({eventId: eventId})
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Comment deleted');
    });
});