import jwt from 'jsonwebtoken';
import * as authService from '../services/authService';
import { ENV } from '@config/config';
import { Response } from 'express';

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
    describe('generateTokens', () => {
        it('should generate access and refresh tokens', () => {
            const mockUser = { _id: 'user123' };
            (jwt.sign as jest.Mock).mockReturnValue('mock-token' as any);

            const tokens = authService.generateTokens(mockUser as any);

            expect(tokens).toEqual({
                accessToken: 'mock-token',
                refreshToken: 'mock-token',
            });
            expect(jwt.sign).toHaveBeenCalledTimes(2);
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
            const mockPayload = { _id: 'user123' };
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload as any);

            const decoded = authService.verifyRefreshToken('valid-token');

            expect(decoded).toEqual(mockPayload);
            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'refresh-secret');
        });

        it('should throw UnauthorizedError on invalid token', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('invalid');
            });

            expect(() => authService.verifyRefreshToken('invalid-token')).toThrow();
        });
    });
});
