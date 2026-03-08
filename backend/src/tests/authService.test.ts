import jwt from 'jsonwebtoken';
import * as authService from '../services/authService';
import { Response } from 'express';
import { jest } from '@jest/globals';
import { IUser } from '../models/User';

jest.mock('@config/config', () => ({
    ENV: {
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        ACCESS_TOKEN_EXPIRES_IN: '15m',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        COOKIE_SECURE: false,
    },
}));

describe('AuthService', () => {

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe('generateTokens', () => {
        it('should generate access and refresh tokens', () => {
            const mockUser = { _id: 'user123' } as unknown as IUser;
            
            const signSpy = jest.spyOn(jwt, 'sign').mockImplementation(() => 'mock-token' as any);

            const tokens = authService.generateTokens(mockUser);

            expect(tokens).toEqual({
                accessToken: 'mock-token',
                refreshToken: 'mock-token',
            });
            
            expect(signSpy).toHaveBeenCalledTimes(2);
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
            const mockPayload = { _id: 'user123' } as any;
            
            const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue(mockPayload);

            const decoded = authService.verifyRefreshToken('valid-token');

            expect(decoded).toEqual(mockPayload);
            
            expect(verifySpy).toHaveBeenCalledWith('valid-token', 'test-refresh-secret');
        });

        it('should throw error on invalid token', () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('invalid');
            });

            expect(() => authService.verifyRefreshToken('invalid-token')).toThrow();
        });
    });
});