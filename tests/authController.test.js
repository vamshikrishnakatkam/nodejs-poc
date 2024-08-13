
const request = require('supertest');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');


describe('Auth Routes', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user successfully', async () => {
            const mockUserData = {
                fname: 'John',
                email: 'john@example.com',
                password: 'password123',
            };

            const hashedPassword = 'hashed_password123';
            bcrypt.hash.mockResolvedValue(hashedPassword);

            User.findOne.mockResolvedValue(null);

            User.prototype.save = jest.fn().mockResolvedValue({
                _id: 'someUserId',
                ...mockUserData,
                password: hashedPassword,
            });

            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockUserData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Successfully user created');

            expect(User.findOne).toHaveBeenCalledWith({ email: mockUserData.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
            expect(User.prototype.save).toHaveBeenCalled();
        });

        it('should return 400 if user already exists', async () => {
            User.findOne.mockResolvedValue({}); 

            const res = await request(app)
                .post('/api/auth/signup')
                .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });

        it('should handle errors in the catch block', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/api/auth/signup')
                .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Database error');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });
    });

    describe('POST /api/auth/signin', () => {
        it('should sign in a user successfully', async () => {
            User.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedPassword' });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            const res = await request(app)
                .post('/api/auth/signin')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'User Logged in Successfully');
            expect(res.body).toHaveProperty('token', 'mockToken');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(jwt.sign).toHaveBeenCalledWith({ email: 'test@example.com' }, process.env.TOKEN_SECRET, { expiresIn: '1800s', algorithm: 'HS256' });
        });

        it('should return 400 if email is incorrect', async () => {
            User.findOne.mockResolvedValue(null); 

            const res = await request(app)
                .post('/api/auth/signin')
                .send({ email: 'wrong@example.com', password: 'password123' });

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Email or password is wrong.');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'wrong@example.com' });
        });

        it('should return 400 if password is incorrect', async () => {
            User.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedPassword' });
            bcrypt.compare.mockResolvedValue(false); 

            const res = await request(app)
                .post('/api/auth/signin')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Invalid Password');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
        });


        it('should handle errors in the catch block', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/api/auth/signin')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Database error');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });
    });
});
