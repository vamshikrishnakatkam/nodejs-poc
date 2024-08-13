const authMiddleware=require('../middleware/authMiddleware')
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should proceed if token is valid', async () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            if (token === 'token') {
                callback(null, { email: 'user@example.com' });
            } else {
                callback(new Error('Invalid token'));
            }
        });

        const req = { headers: { authorization: 'Bearer token' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('token', process.env.JWT_SECRET, expect.any(Function));
        expect(req.user).toEqual({ email: 'user@example.com' });
        expect(next).toHaveBeenCalled();
    });

    test('should return 401 if no token is provided', async () => {
        const req = { headers: {} };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Authorization failed. No access token.');
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 if token verification fails', async () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Token verification failed'), null);
        });

        const req = { headers: { authorization: 'Bearer invalid_token' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('invalid_token', process.env.JWT_SECRET, expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Could not verify token');
        expect(next).not.toHaveBeenCalled();
    });
});
