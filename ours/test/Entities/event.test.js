const request = require('supertest');
const express = require('express');
const { User, Organisation } = require('../../app/models/profileModel');
const { Event } = require('../../app/models/eventModel');
const userRouter = require('../../app/Entities/user');
const organisationRouter = require('../../app/Entities/organisation');
const eventRouter = require('../../app/Entities/event');
const authRouter = require('../../app/authentication/auth');
const { verifySecretToken } = require('../../app/middleware');
const { connect, disconnect } = require('../db');
const { emailVerification } = require('../../app/mailBody');

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/user', userRouter);
app.use('/organisation', organisationRouter);
app.use('/event', eventRouter);
app.use('/auth', authRouter);

beforeAll(async () => {
    await connect();

    // password is the hash of 'password123'
    const organisation = new Organisation({
        username: 'testorganisation',
        email: 'org@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        role: 'organisation',
        taxIdCode: '12345678',
        confirmed: true,
        verified: true,
    });
    await organisation.save();

    // Login to get the token
    const response = await request(app)
        .post('/auth')
        .send({
            email: 'org@example.com',
            password: 'password123',
        });
    token = response.body.token;
    orgId = response.body.userId;
});

afterAll(async () => {
    await disconnect();
});

afterEach(async () => {
    await Event.deleteMany({});
});

describe('Event Routes', () => {
    it('should create a new event', async () => {
        const newEvent = {
            title: 'test event',
            description: 'test description',
            date: '2024-06-09T17:36:00.000+00:00',
            location: 'test location',
            maxNumberParticipants: 10,
        };

        const response = await request(app)
            .post('/event')
            .send(newEvent)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(201);
        expect(response.body.activity_id).toBeDefined();
    });

    it('should not create an event as a guest', async () => {
        const newEvent = {
            title: 'test event',
            description: 'test description',
            date: '2024-06-09T17:36:00.000+00:00',
            location: 'test location',
            maxNumberParticipants: 10,
        };

        const response = await request(app)
            .post('/event')
            .send(newEvent)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Unauthorized access');
    });

    it('should not create an event with missing fields', async () => {
        const newEvent = {
            title: 'test event',
            description: 'test description',
            date: '2024-06-09T17:36:00.000+00:00',
            location: 'test location',
        };

        const response = await request(app)
            .post('/event')
            .send(newEvent)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Validation error');
    });

    it ('should not create an event with invalid date', async () => {
        const newEvent = {
            title: 'test event',
            description: 'test description',
            date: 'invalid date',
            location: 'test location',
            maxNumberParticipants: 10,
        };

        const response = await request(app)
            .post('/event')
            .send(newEvent)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Validation error');
    });

    it('should search for events', async () => {
        const event1 = new Event({
            title: 'event1',
            description: 'description1',
            date: '2024-06-09T17:36:00.000+00:00',
            location: 'location1',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });
        const event2 = new Event({
            title: 'event2',
            description: 'description2',
            date: '2024-06-09T17:36:00.000+00:00',
            location: 'location2',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });
        
        await event1.save();
        await event2.save();

        const response = await request(app).get('/event');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should get event by ID', async () => {
        const event = new Event({
            title: 'test event',
            description: 'description1',
            date: '2024-06-09T17:36:00.000+00:00',
            location: 'location1',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });
        await event.save();

        const response = await request(app).get(`/event/${event._id}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('test event');
    });

    it('should delete an event', async () => {
        const event = new Event({
            title: 'test event',
            description: 'description1',
            date: '2024-06-09T17:36:00.000+00:00',
            location: 'location1',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });
        await event.save();

        const response = await request(app)
            .delete(`/event/${event._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
    });
});