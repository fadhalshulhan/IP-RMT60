const request = require('supertest');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const { authenticate } = require('../middlewares/authMiddleware');

// Mock dependencies
jest.mock('google-auth-library');
jest.mock('../models');
jest.mock('jsonwebtoken');

// Suppress console logs during tests, except for debugging logs
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation((...args) => {
        if (
            args[0].includes('Response body') ||
            args[0].includes('userData before response') ||
            args[0].includes('Response after auth route') ||
            args[0].includes('Mock payload')
        ) {
            console.error(...args); // Allow specific logs to appear
        }
    });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});
afterAll(() => {
    jest.restoreAllMocks();
});

// Import app after setting up console mocks
const app = require('../app');

describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/google', () => {
        const mockGoogleToken = 'mockGoogleToken';
        const mockUserData = {
            sub: '123', // Use 'sub' to match Google token payload
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/picture.jpg',
        };
        const mockJwtToken = 'mockJwtToken';

        it('should return 400 if googleToken is not provided', async () => {
            const response = await request(app)
                .post('/api/auth/google')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Google token is required' });
        });

        it('should successfully verify Google token and return JWT', async () => {
            // Mock Google OAuth client
            const mockTicket = {
                getPayload: jest.fn().mockReturnValue(mockUserData),
            };
            OAuth2Client.prototype.verifyIdToken = jest.fn().mockResolvedValue(mockTicket);

            // Log mock payload for debugging
            console.log('Mock payload:', mockTicket.getPayload());

            // Mock User model for both created and non-created cases
            const mockUser = {
                userId: mockUserData.sub,
                email: mockUserData.email,
                name: mockUserData.name,
                picture: mockUserData.picture,
                update: jest.fn().mockResolvedValue({
                    userId: mockUserData.sub,
                    email: mockUserData.email,
                    name: mockUserData.name,
                    picture: mockUserData.picture,
                }),
            };
            User.findOrCreate = jest.fn().mockImplementation(async () => {
                return [mockUser, true]; // Test with created: true
            });

            // Mock JWT
            jwt.sign = jest.fn().mockReturnValue(mockJwtToken);

            const response = await request(app)
                .post('/api/auth/google')
                .send({ googleToken: mockGoogleToken });

            expect(response.status).toBe(200);
            // Log response for debugging
            console.log('Response body:', response.body);
            expect(response.body).toEqual({
                token: mockJwtToken,
                user: {
                    userId: mockUserData.sub,
                    email: mockUserData.email,
                    name: mockUserData.name,
                    picture: mockUserData.picture,
                },
            });
            expect(OAuth2Client.prototype.verifyIdToken).toHaveBeenCalledWith({
                idToken: mockGoogleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            expect(User.findOrCreate).toHaveBeenCalled();
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    userId: mockUserData.sub,
                    email: mockUserData.email,
                    name: mockUserData.name,
                    picture: mockUserData.picture,
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
        });

        it('should handle expired Google token', async () => {
            OAuth2Client.prototype.verifyIdToken = jest.fn().mockRejectedValue({
                name: 'TokenExpiredError',
            });

            const response = await request(app)
                .post('/api/auth/google')
                .send({ googleToken: mockGoogleToken });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Google token has expired' });
        });

        it('should handle general errors', async () => {
            OAuth2Client.prototype.verifyIdToken = jest.fn().mockRejectedValue(
                new Error('General error')
            );

            const response = await request(app)
                .post('/api/auth/google')
                .send({ googleToken: mockGoogleToken });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('pesan', 'General error');
        });
    });

    describe('GET /api/auth/verify', () => {
        const mockToken = 'mockJwtToken';
        const mockUser = {
            userId: '123',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/picture.jpg',
        };

        it('should return 401 if no token is provided', async () => {
            const response = await request(app).get('/api/auth/verify');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'No token provided' });
        });

        it('should return 401 if user is not found', async () => {
            jwt.verify = jest.fn().mockReturnValue({ userId: '123' });
            User.findByPk = jest.fn().mockResolvedValue(null);

            const response = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('should successfully verify session', async () => {
            jwt.verify = jest.fn().mockReturnValue(mockUser);
            User.findByPk = jest.fn().mockResolvedValue(mockUser);

            const response = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                token: mockToken,
                user: mockUser,
            });
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
            expect(User.findByPk).toHaveBeenCalledWith(mockUser.userId);
        });

        it('should handle expired JWT token', async () => {
            jwt.verify = jest.fn().mockImplementation(() => {
                throw { name: 'TokenExpiredError' };
            });

            const response = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Token has expired' });
        });

        it('should handle invalid JWT token', async () => {
            jwt.verify = jest.fn().mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const response = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Invalid token' });
        });
    });

    describe('authMiddleware', () => {
        const mockToken = 'mockJwtToken';
        const mockUser = {
            userId: '123',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/picture.jpg',
        };

        it('should call next() for valid token and user', async () => {
            const mockReq = {
                headers: { authorization: `Bearer ${mockToken}` },
            };
            const mockRes = {};
            const mockNext = jest.fn();

            jwt.verify = jest.fn().mockReturnValue(mockUser);
            User.findByPk = jest.fn().mockResolvedValue(mockUser);

            await authenticate(mockReq, mockRes, mockNext);

            expect(mockReq.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
            expect(User.findByPk).toHaveBeenCalledWith(mockUser.userId);
        });
    });
});