import jwt, { JwtPayload } from 'jsonwebtoken';
import * as authService from '../services/authService';
import { Response } from 'express';
import { jest } from '@jest/globals';
import { IUser } from '../models/User';

jest.mock('jsonwebtoken');

jest.mock('@config/config', () => ({
    ENV: {
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        ACCESS_TOKEN_EXPIRES_IN: '15m',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        COOKIE_SECURE: false,
    },
}));

describe('AuthService', () => {
    const mockedSign = jwt.sign as jest.MockedFunction<typeof jwt.sign>;
    const mockedVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateTokens', () => {
        it('should generate access and refresh tokens', () => {
            const mockUser = { _id: 'user123' } as unknown as IUser;
            
            mockedSign.mockReturnValue('mock-token' as any); 

            const tokens = authService.generateTokens(mockUser);

            expect(tokens).toEqual({
                accessToken: 'mock-token',
                refreshToken: 'mock-token',
            });
            expect(mockedSign).toHaveBeenCalledTimes(2);
        });
    });

    describe('setAuthCookies', () => {
        it('should set refresh token cookie', () => {
            const mockRes = {
                cookie: jest.fn(),
            } as unknown as Response;

            authService.setAuthCookies(mockRes, 'refresh-token');

            expect(mockRes.cookie).toHaveBeenCalledWith(
                expect.any(String),
                'refresh-token',
                expect.objectContaining({ httpOnly: true })
            );
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify and return decoded payload', () => {
            const mockPayload: JwtPayload = { _id: 'user123' };
            
            mockedVerify.mockReturnValue(mockPayload as any);

            const decoded = authService.verifyRefreshToken('valid-token');

            expect(decoded).toEqual(mockPayload);
            expect(mockedVerify).toHaveBeenCalledWith('valid-token', 'refresh-secret');
        });

        it('should throw error on invalid token', () => {
            mockedVerify.mockImplementation(() => {
                throw new Error('invalid');
            });

            expect(() => authService.verifyRefreshToken('invalid-token')).toThrow();
        });
    });
});