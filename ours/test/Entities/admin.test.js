const request = require('supertest');
const express = require('express');
const { Admin } = require('../../app/models/profileModel');
const adminRouter = require('../../app/Entities/admin');
const authRouter = require('../../app/authentication/auth'); // Authentication route for login
const { verifySecretToken } = require('../../app/middleware');
const { connect, disconnect } = require('../db');

const app = express();
app.use(express.json());
app.use(verifySecretToken);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);

let token, adminId;

beforeAll(async () => {
    await connect();

    // Password is the hash of 'password123'
    const initialAdmin = new Admin({
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq', // hashed 'password123'
        role: 'admin',
        confirmed: true,
    });
    await initialAdmin.save();

    const response = await request(app)
        .post('/auth')
        .send({
            email: 'superadmin@example.com',
            password: 'password123',
        });
    token = response.body.token;
    adminId = response.body.userId;
});

afterAll(async () => {
    await disconnect();
});

afterEach(async () => {
    await Admin.deleteMany({ email: { $ne: 'superadmin@example.com' } });
});

describe('Admin Routes', () => {
    it('should create a new admin', async () => {
        const newAdmin = {
            username: 'newadmin',
            email: 'newadmin@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/admin')
            .send(newAdmin)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(201);
        expect(response.body.user).toBeDefined();
    });

    it('should not create an admin as a guest', async () => {
        const newAdmin = {
            username: 'newadmin',
            email: 'superadmin@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/admin')
            .send(newAdmin)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Unauthorized access');
    });

    it('should not create an admin with existing email', async () => {
        const newAdmin = {
            username: 'newadmin',
            email: 'superadmin@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/admin')
            .send(newAdmin)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already exists');
    });

    it('should modify an admin', async () => {
        const newAdmin = new Admin({
            username: 'modifyadmin',
            email: 'modifyadmin@example.com',
            password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
            role: 'admin',
            confirmed: true,
        });
        await newAdmin.save();

        const updatedData = {
            username: 'modifiedadmin',
        };

        const response = await request(app)
            .put(`/admin/${newAdmin._id.toString()}`)
            .send(updatedData)
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Updated');
        expect(response.body.entity).toBeTruthy();
    });

    it('should get all admins', async () => {
        const response = await request(app)
            .get('/admin')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get an admin by ID', async () => {
        const newAdmin = new Admin({
            username: 'getadmin',
            email: 'getadmin@example.com',
            password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
            role: 'admin',
            confirmed: true,
        });
        await newAdmin.save();

        const response = await request(app)
            .get(`/admin/${newAdmin._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe('getadmin');
    });

    it('should delete an admin', async () => {
        const newAdmin = new Admin({
            username: 'deleteadmin',
            email: 'deleteadmin@example.com',
            password: '$2b$10$4WkB/FUdhtsydVmSpH8uSeFUQtPOscIbVN3k6fjL82C/QDAM8.lAq',
            role: 'admin',
            confirmed: true,
        });
        await newAdmin.save();

        const response = await request(app)
            .delete(`/admin/${newAdmin._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
    });
});
