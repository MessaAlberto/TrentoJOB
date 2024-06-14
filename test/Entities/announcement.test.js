const request = require('supertest');
const express = require('express');
const { User, Organisation } = require('../../app/models/profileModel');
const userRouter = require('../../app/Entities/user');
const organisationRouter = require('../../app/Entities/organisation');
const announcementRouter = require('../../app/Entities/announcement');
const authRouter = require('../../app/authentication/auth');
const { verifySecretToken } = require('../../app/middleware');
const { connect, disconnect } = require('../db');
const { Announcement } = require('../../app/models/announcementModel');

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/user', userRouter);
app.use('/organisation', organisationRouter);
app.use('/announcement', announcementRouter);
app.use('/auth', authRouter);

let orgToken, orgId;
let userToken, userId;

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

    // password is the hash of 'password123'
    const user = new User({
        username: 'testuser',
        email: 'user@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
        role: 'user',
        confirmed: true,
    });
    await user.save();

    // Login as organization to get the token
    let response = await request(app)
        .post('/auth')
        .send({
            email: 'org@example.com',
            password: 'password123',
        });
    orgToken = response.body.token;
    orgId = response.body.userId;

    // Login as user to get the token
    response = await request(app)
        .post('/auth')
        .send({
            email: 'user@example.com',
            password: 'password123',
        });
    userToken = response.body.token;
    userId = response.body.userId;
});

afterAll(async () => {
    await disconnect();
});

afterEach(async () => {
    await Announcement.deleteMany({});
});

describe('Announcement Routes', () => {
    it('should create a new announcement as an organization', async () => {
        const newAnnouncement = {
            title: 'test announcement',
            description: 'test description',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'test location',
            maxNumberParticipants: 10,
        };

        const response = await request(app)
            .post('/announcement')
            .send(newAnnouncement)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${orgToken}`);

        expect(response.status).toBe(201);
        expect(response.body.activity_id).toBeDefined();
    });

    it('should create a new announcement as a user', async () => {
        const newAnnouncement = {
            title: 'test announcement',
            description: 'test description',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'test location',
            maxNumberParticipants: 10,
        };

        const response = await request(app)
            .post('/announcement')
            .send(newAnnouncement)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(201);
        expect(response.body.activity_id).toBeDefined();
    });

    it('should not create an announcement as a guest', async () => {
        const newAnnouncement = {
            title: 'test announcement',
            description: 'test description',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'test location',
            maxNumberParticipants: 10,
        };

        const response = await request(app)
            .post('/announcement')
            .send(newAnnouncement)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Unauthorized access');
    });

    it('should not create an announcement with missing fields', async () => {
        const newAnnouncement = {
            title: 'test announcement',
            description: 'test description',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'test location',
        };

        const response = await request(app)
            .post('/announcement')
            .send(newAnnouncement)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${orgToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Validation error');
    });

    it ('should not create an announcement with invalid date', async () => {
        const newAnnouncement = {
            title: 'test announcement',
            description: 'test description',
            date_begin: 'invalid date',
            date_stop: 'invalid date',
            location: 'test location',
            maxNumberParticipants: 10,
        };

        const response = await request(app)
            .post('/announcement')
            .send(newAnnouncement)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${orgToken}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Validation error');
    });

    it('should search for announcements', async () => {
        const announcement1 = new Announcement({
            title: 'announcement1',
            description: 'description1',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'location1',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });
        const announcement2 = new Announcement({
            title: 'announcement2',
            description: 'description2',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'location2',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });

        await announcement1.save();
        await announcement2.save();

        const response = await request(app).get('/announcement');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should get announcement by ID', async () => {
        const announcement = new Announcement({
            title: 'test announcement',
            description: 'description1',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'location1',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });
        await announcement.save();

        const response = await request(app).get(`/announcement/${announcement._id}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('test announcement');
    });

    it('should delete an announcement as an organization', async () => {
        const announcement = new Announcement({
            title: 'test announcement',
            description: 'description1',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'location1',
            maxNumberParticipants: 10,
            owner: {
                username: 'testorganisation',
                id: orgId,
                role: 'organisation',
            }
        });
        const saved = await announcement.save();

        const response = await request(app)
            .delete(`/announcement/${saved._id}`)
            .set('Authorization', `Bearer ${orgToken}`);
        expect(response.status).toBe(200);
    });

    it('should delete an announcement as a user', async () => {
        const announcement = new Announcement({
            title: 'test announcement',
            description: 'description1',
            date_begin: '2024-06-09T17:36:00.000+00:00',
            date_stop: '2024-06-09T17:36:00.000+00:00',
            location: 'location1',
            maxNumberParticipants: 10,
            owner: {
                username: 'testuser',
                id: userId,
                role: 'user',
            }
        });
        const saved = await announcement.save();

        const response = await request(app)
            .delete(`/announcement/${saved._id}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(200);
    });
});
