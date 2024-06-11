const request = require('supertest');
const express = require('express');
const {Organisation} = require('../../app/models/profileModel');
const organisationRouter = require('../../app/Entities/organisation');
const authRouter = require('../../app/authentication/auth');
const { verifySecretToken } = require('../../app/middleware');
const { connect, disconnect } = require('../db');

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/organisation', organisationRouter);
app.use('/auth', authRouter);

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await disconnect();
});

afterEach(async () => {
    await Organisation.deleteMany({});
});

describe('Organisation Routes', () => {
    it('should register a new organisation', async () => {
        const newOrganisation = {
            username: 'testorganisation',
            email: 'testorganisation@example.com',
            password: '123456789',
            taxIdCode: 'CMDSML01B23F443D',
        };

        const response = await request(app)
            .post('/organisation')
            .send(newOrganisation)
            .set('Content-Type', 'application/json');
        expect(response.status).toBe(201);
        expect(response.body.user).toBeDefined();
        
    });

    it('should not register a organisation with existing email', async () => {
        const newOrganisation = {
            username: 'testorganisation',
            email: 'testorganisation@example.com',
            password: '123456789',
            taxIdCode: 'CMDSML01B23F443D',
        };

        await new Organisation(newOrganisation).save();

        const response = await request(app)
            .post('/organisation')
            .send(newOrganisation)
            .set('Content-Type', 'application/json');
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already exists');
    });

    it('should search for organisations', async () => {
        const organisation1 = new Organisation({ username: 'organisation1', email: 'organisation1@example.com', password: '123456789', taxIdCode: 'CMDSML01B23F443D', confirmed: true, verified: true});
        const organisation2 = new Organisation({ username: 'organisation2', email: 'organisation2@example.com', password: '123456789', taxIdCode: 'CMDSML01B23F443D', confirmed: true, verified: true});
        await organisation1.save();
        await organisation2.save();

        const response = await request(app).get('/organisation');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should get organisation by ID', async () => {
        const organisation = new Organisation({ username: 'organisation1', email: 'organisation1@example.com', password: '123456789', taxIdCode: 'CMDSML01B23F443D'});
        await organisation.save();

        const response = await request(app).get(`/organisation/${organisation._id}`);
    
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('organisation1');
    });
});
