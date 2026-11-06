import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { PasswordService } from './password.service.js';
import { TotpService } from './totp.service.js';
import { OneTimeTokenService } from './one-time-token.service.js';
import { AuthMethod } from '../../common/enums/auth-method.enum.js';
import { Role } from '../../common/enums/role.enum.js';
import { User } from '../users/entities/user.entity.js';

const { toDataURLMock } = vi.hoisted(() => ({
  toDataURLMock: vi.fn(async () => 'data:image/png;base64,abc'),
}));

vi.mock('qrcode', () => ({
  toDataURL: toDataURLMock,
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let passwordService: PasswordService;
  let jwtService: JwtService;
  let totpService: TotpService;
  let mailerService: MailerService;
  let oneTimeTokenService: OneTimeTokenService;
  
  const mockUser: User = {
    id: 'user-1',
    sub: 'sub-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    givenName: 'Test',
    familyName: 'User',
    picture: null,
    locale: 'en',
    roles: [Role.USER],
    status: 'active' as any,
    totpEnabled: false,
    loginTokenConsumed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    passwordHash: 'hashed-password',
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: vi.fn(),
            findByEmailWithPassword: vi.fn(),
            findById: vi.fn(),
            findByIdWithTotp: vi.fn(),
            updateProfile: vi.fn(),
            create: vi.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: vi.fn(),
            verify: vi.fn(),
            needsRehash: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn(),
            verifyAsync: vi.fn(),
          },
        },
        {
          provide: TotpService,
          useValue: {
            generateSecret: vi.fn(),
            generateUri: vi.fn(),
            verifyTotp: vi.fn(),
            generateBackupCodes: vi.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: vi.fn(),
          },
        },
        {
          provide: OneTimeTokenService,
          useValue: {
            createToken: vi.fn(),
            verifyToken: vi.fn(),
          },
        },
      ],
    }).compile();
    
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    totpService = module.get<TotpService>(TotpService);
    mailerService = module.get<MailerService>(MailerService);
    oneTimeTokenService = module.get<OneTimeTokenService>(OneTimeTokenService);
  });
  
  describe('register', () => {
    it('should register a new user and return auth result', async () => {
      vi.mocked(usersService.findByEmail).mockResolvedValue(null);
      vi.mocked(passwordService.hash).mockResolvedValue('hashed-password');
      vi.mocked(usersService.create).mockResolvedValue(mockUser);
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      const result = await service.register('test@example.com', 'password123', 'Test User');
      
      expect(result.user.sub).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens?.accessToken).toBe('access-token');
      expect(result.tokens?.refreshToken).toBe('refresh-token');
      expect(result.tokens?.tokenType).toBe('Bearer');
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        emailVerified: false,
        roles: [Role.USER],
      });
    });
    
    it('should handle user with null name', async () => {
      const userWithNullName = { ...mockUser, name: null };
      vi.mocked(usersService.findByEmail).mockResolvedValue(null);
      vi.mocked(passwordService.hash).mockResolvedValue('hashed-password');
      vi.mocked(usersService.create).mockResolvedValue(userWithNullName);
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      const result = await service.register('test@example.com', 'password123');
      
      expect(result.user.name).toBeUndefined();
    });
    
    it('should throw ConflictException if user already exists', async () => {
      vi.mocked(usersService.findByEmail).mockResolvedValue(mockUser);
      
      await expect(service.register('test@example.com', 'password123')).rejects.toThrow(ConflictException);
    });
    
    it('should use email as name when name not provided', async () => {
      vi.mocked(usersService.findByEmail).mockResolvedValue(null);
      vi.mocked(passwordService.hash).mockResolvedValue('hashed-password');
      vi.mocked(usersService.create).mockResolvedValue(mockUser);
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      await service.register('test@example.com', 'password123');
      
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: null }),
      );
    });
  });
  
  describe('login', () => {
    it('should login with valid credentials', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verify).mockResolvedValue(true);
      vi.mocked(usersService.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      const result = await service.login('test@example.com', 'password123');
      
      expect(result.user.sub).toBe('user-1');
      expect(result.tokens?.accessToken).toBe('access-token');
      expect(result.tokens?.refreshToken).toBe('refresh-token');
    });
    
    it('should throw UnauthorizedException for invalid email', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(null);
      
      await expect(service.login('nonexistent@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
    });
    
    it('should throw UnauthorizedException for invalid password', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verify).mockResolvedValue(false);
      
      await expect(service.login('test@example.com', 'wrong-password')).rejects.toThrow(UnauthorizedException);
    });
    
    it('should throw UnauthorizedException when user has no password hash', async () => {
      const userWithoutPassword = { ...mockUser, passwordHash: null };
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(userWithoutPassword);
      
      await expect(service.login('test@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
    });
    
    it('should throw UnauthorizedException when user not found after validation', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verify).mockResolvedValue(true);
      vi.mocked(usersService.findByEmail).mockResolvedValue(null);
      
      await expect(service.login('test@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
    });
    
    it('should return mfaRequired and mfaToken when user has totp enabled', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verify).mockResolvedValue(true);
      vi.mocked(usersService.findByEmail).mockResolvedValue({ ...mockUser, totpEnabled: true });
      vi.mocked(jwtService.signAsync).mockResolvedValue('mfa-token');
      
      const result = await service.login('test@example.com', 'password123');
      
      expect(result.mfaRequired).toBe(true);
      expect(result.mfaToken).toBe('mfa-token');
      expect(result.tokens).toBeUndefined();
      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verify).mockResolvedValue(true);
      
      const result = await service.validateUser('test@example.com', 'password123');
      
      expect(result).not.toBeNull();
      expect(result?.sub).toBe('user-1');
      expect(result?.email).toBe('test@example.com');
    });
    
    it('should return null for invalid email', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(null);
      
      const result = await service.validateUser('nonexistent@example.com', 'password123');
      
      expect(result).toBeNull();
    });
    
    it('should return null for invalid password', async () => {
      vi.mocked(usersService.findByEmailWithPassword).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verify).mockResolvedValue(false);
      
      const result = await service.validateUser('test@example.com', 'wrong-password');
      
      expect(result).toBeNull();
    });
  });
  
  describe('issueTokens', () => {
    it('should issue access and refresh tokens', async () => {
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      const result = await service.issueTokens({
        sub: 'user-1',
        email: 'test@example.com',
        roles: [Role.USER],
      });
      
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.expiresIn).toBe(900);
      expect(result.tokenType).toBe('Bearer');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('refreshTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({
        sub: 'user-1',
        email: 'test@example.com',
        roles: [Role.USER],
        type: 'refresh',
      });
      vi.mocked(usersService.findById).mockResolvedValue(mockUser);
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      
      const result = await service.refreshTokens('valid-refresh-token');
      
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
    
    it('should throw UnauthorizedException for invalid refresh token', async () => {
      vi.mocked(jwtService.verifyAsync).mockRejectedValue(new Error('invalid'));
      
      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
    
    it('should throw UnauthorizedException for non-refresh token', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({
        sub: 'user-1',
        email: 'test@example.com',
        roles: [Role.USER],
        type: 'access',
      });
      
      await expect(service.refreshTokens('access-token')).rejects.toThrow(UnauthorizedException);
    });
    
    it('should throw UnauthorizedException when user not found', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({
        sub: 'non-existent',
        email: 'test@example.com',
        roles: [Role.USER],
        type: 'refresh',
      });
      vi.mocked(usersService.findById).mockResolvedValue(null);
      
      await expect(service.refreshTokens('valid-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });
  
  describe('verifyToken', () => {
    it('should verify and return decoded payload', async () => {
      const payload = { sub: 'user-1', email: 'test@example.com' };
      vi.mocked(jwtService.verifyAsync).mockResolvedValue(payload);
      
      const result = await service.verifyToken('valid-token');
      
      expect(result).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    });
  });
  
  describe('verifyMfa', () => {
    it('should enable mfa when totp code is valid (setup flow)', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      vi.mocked(totpService.verifyTotp).mockResolvedValue(true);
      
      const result = await service.verifyMfa('user-1', 'test@example.com', '123456');
      
      expect(result.enabled).toBe(true);
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', expect.objectContaining({ totpEnabled: true }));
    });
    
    it('should return enabled false when setup totp code is invalid', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      vi.mocked(totpService.verifyTotp).mockResolvedValue(false);
      
      const result = await service.verifyMfa('user-1', 'test@example.com', '000000');
      
      expect(result.enabled).toBe(false);
      expect(usersService.updateProfile).not.toHaveBeenCalled();
    });
    
    it('should return enabled false when totp secret is missing', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: null });
      
      const result = await service.verifyMfa('user-1', 'test@example.com', '123456');
      
      expect(result.enabled).toBe(false);
    });
    
    it('should return tokens when mfa token and valid code verify', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: 'user-1', type: 'mfa' });
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      vi.mocked(totpService.verifyTotp).mockResolvedValue(true);
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      const result = await service.verifyMfa('user-1', 'test@example.com', '123456', 'mfa-token');
      
      expect(result.enabled).toBe(true);
      expect(result.tokens?.accessToken).toBe('access-token');
      expect(result.tokens?.refreshToken).toBe('refresh-token');
    });
    
    it('should return enabled false when mfa token code is invalid', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: 'user-1', type: 'mfa' });
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      vi.mocked(totpService.verifyTotp).mockResolvedValue(false);
      
      const result = await service.verifyMfa('user-1', 'test@example.com', '000000', 'mfa-token');
      
      expect(result.enabled).toBe(false);
    });
    
    it('should throw UnauthorizedException when mfa token has invalid type', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: 'user-1', type: 'access' });
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      
      await expect(service.verifyMfa('user-1', 'test@example.com', '123456', 'mfa-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
    
    it('should return enabled false when mfa token user has no secret', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: 'user-1', type: 'mfa' });
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: null });
      
      const result = await service.verifyMfa('user-1', 'test@example.com', '123456', 'mfa-token');
      
      expect(result.enabled).toBe(false);
    });
    
    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue(null);
      
      await expect(service.verifyMfa('user-1', 'test@example.com', '123456')).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('disableMfa', () => {
    it('should disable mfa when totp code is valid', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      vi.mocked(totpService.verifyTotp).mockResolvedValue(true);
      
      const result = await service.disableMfa('user-1', 'test@example.com', '123456');
      
      expect(result.enabled).toBe(true);
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', {
        totpSecret: null,
        totpEnabled: false,
        backupCodes: null,
      });
    });
    
    it('should return enabled false when totp code is invalid', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      vi.mocked(totpService.verifyTotp).mockResolvedValue(false);
      
      const result = await service.disableMfa('user-1', 'test@example.com', '000000');
      
      expect(result.enabled).toBe(false);
    });
    
    it('should return enabled false when totp secret is missing', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: null });
      
      const result = await service.disableMfa('user-1', 'test@example.com', '123456');
      
      expect(result.enabled).toBe(false);
    });
    
    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue(null);
      
      await expect(service.disableMfa('user-1', 'test@example.com', '123456')).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('setupMfa', () => {
    it('should set up totp and return secret, otpauth url and qr code', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue(mockUser);
      vi.mocked(totpService.generateSecret).mockReturnValue('JBSWY3DPEHPK3PXP');
      vi.mocked(totpService.generateUri).mockReturnValue('otpauth://totp/NestJS%20Boilerplate:user%40example.com?secret=JBSWY3DPEHPK3PXP');
      toDataURLMock.mockResolvedValue('data:image/png;base64,abc');
      vi.mocked(usersService.updateProfile).mockResolvedValue(mockUser);
      
      const result = await service.setupMfa('user-1', 'test@example.com');
      
      expect(result).toEqual({
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUrl: 'otpauth://totp/NestJS%20Boilerplate:user%40example.com?secret=JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,abc',
      });
      expect(toDataURLMock).toHaveBeenCalledWith('otpauth://totp/NestJS%20Boilerplate:user%40example.com?secret=JBSWY3DPEHPK3PXP');
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', {
        totpSecret: 'JBSWY3DPEHPK3PXP',
        totpEnabled: false,
      });
    });
    
    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue(null);
      
      await expect(service.setupMfa('user-1', 'test@example.com')).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('verifyMfaWithToken', () => {
    it('should return tokens when mfa token and valid code verify', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: 'user-1', type: 'mfa' });
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue({ ...mockUser, totpSecret: 'JBSWY3DPEHPK3PXP' });
      vi.mocked(totpService.verifyTotp).mockResolvedValue(true);
      vi.mocked(jwtService.signAsync)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      
      const result = await service.verifyMfaWithToken('mfa-token', '123456');
      
      expect(result.enabled).toBe(true);
      expect(result.tokens?.accessToken).toBe('access-token');
      expect(result.tokens?.refreshToken).toBe('refresh-token');
    });
    
    it('should throw NotFoundException when user not found', async () => {
      vi.mocked(jwtService.verifyAsync).mockResolvedValue({ sub: 'user-1', type: 'mfa' });
      vi.mocked(usersService.findByIdWithTotp).mockResolvedValue(null);
      
      await expect(service.verifyMfaWithToken('mfa-token', '123456')).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('requestMagicLink', () => {
    it('should send magic link email when user exists and return generic success', async () => {
      vi.mocked(usersService.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(oneTimeTokenService.createToken).mockResolvedValue({ token: 'magic-token', expiresAt: new Date() });
      
      const result = await service.requestMagicLink('test@example.com');
      
      expect(result).toEqual({ success: true });
      expect(oneTimeTokenService.createToken).toHaveBeenCalledWith('user-1', 'MAGIC_LINK');
      expect(mailerService.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'test@example.com' }));
    });
    
    it('should return generic success when user does not exist', async () => {
      vi.mocked(usersService.findByEmail).mockResolvedValue(null);
      
      const result = await service.requestMagicLink('unknown@example.com');
      
      expect(result).toEqual({ success: true });
      expect(oneTimeTokenService.createToken).not.toHaveBeenCalled();
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });
  });
  
  describe('verifyMagicLink', () => {
    it('should issue tokens when magic link is valid and user has no totp', async () => {
      vi.mocked(oneTimeTokenService.verifyToken).mockResolvedValue({ userId: 'user-1', authMethod: AuthMethod.MAGIC_LINK });
      vi.mocked(usersService.findById).mockResolvedValue(mockUser);
      vi.mocked(jwtService.signAsync).mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
      
      const result = await service.verifyMagicLink('magic-token');
      
      expect(result.tokens?.accessToken).toBe('access-token');
      expect(result.tokens?.refreshToken).toBe('refresh-token');
      expect(result.user.sub).toBe('user-1');
    });
    
    it('should return mfaRequired and mfaToken when user has totp enabled', async () => {
      vi.mocked(oneTimeTokenService.verifyToken).mockResolvedValue({ userId: 'user-1', authMethod: AuthMethod.MAGIC_LINK });
      vi.mocked(usersService.findById).mockResolvedValue({ ...mockUser, totpEnabled: true });
      vi.mocked(jwtService.signAsync).mockResolvedValue('mfa-token');

      const result = await service.verifyMagicLink('magic-token');

      expect(result.mfaRequired).toBe(true);
      expect(result.mfaToken).toBe('mfa-token');
    });

    it('should throw UnauthorizedException when user not found after valid token', async () => {
      vi.mocked(oneTimeTokenService.verifyToken).mockResolvedValue({ userId: 'user-1', authMethod: AuthMethod.MAGIC_LINK });
      vi.mocked(usersService.findById).mockResolvedValue(null);

      await expect(service.verifyMagicLink('magic-token')).rejects.toThrow(UnauthorizedException);
    });
  });
  
  describe('requestPasscode', () => {
    it('should send passcode email when user exists and return generic success', async () => {
      vi.mocked(usersService.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(oneTimeTokenService.createToken).mockResolvedValue({ token: '123456', expiresAt: new Date() });
      
      const result = await service.requestPasscode('test@example.com');
      
      expect(result).toEqual({ success: true });
      expect(oneTimeTokenService.createToken).toHaveBeenCalledWith('user-1', 'PASSCODE');
      expect(mailerService.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'test@example.com' }));
    });
    
    it('should return generic success when user does not exist', async () => {
      vi.mocked(usersService.findByEmail).mockResolvedValue(null);
      
      const result = await service.requestPasscode('unknown@example.com');
      
      expect(result).toEqual({ success: true });
      expect(mailerService.sendMail).not.toHaveBeenCalled();
    });
  });
  
  describe('verifyPasscode', () => {
    it('should issue tokens when passcode is valid and user has no totp', async () => {
      vi.mocked(oneTimeTokenService.verifyToken).mockResolvedValue({ userId: 'user-1', authMethod: AuthMethod.MAGIC_LINK });
      vi.mocked(usersService.findById).mockResolvedValue(mockUser);
      vi.mocked(jwtService.signAsync).mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
      
      const result = await service.verifyPasscode('123456');
      
      expect(result.tokens?.accessToken).toBe('access-token');
      expect(result.tokens?.refreshToken).toBe('refresh-token');
      expect(oneTimeTokenService.verifyToken).toHaveBeenCalledWith('123456');
    });
    
    it('should return mfaRequired and mfaToken when user has totp enabled', async () => {
      vi.mocked(oneTimeTokenService.verifyToken).mockResolvedValue({ userId: 'user-1', authMethod: AuthMethod.MAGIC_LINK });
      vi.mocked(usersService.findById).mockResolvedValue({ ...mockUser, totpEnabled: true });
      vi.mocked(jwtService.signAsync).mockResolvedValue('mfa-token');

      const result = await service.verifyPasscode('123456');

      expect(result.mfaRequired).toBe(true);
      expect(result.mfaToken).toBe('mfa-token');
    });

    it('should throw UnauthorizedException when user not found after valid token', async () => {
      vi.mocked(oneTimeTokenService.verifyToken).mockResolvedValue({ userId: 'user-1', authMethod: AuthMethod.MAGIC_LINK });
      vi.mocked(usersService.findById).mockResolvedValue(null);

      await expect(service.verifyPasscode('123456')).rejects.toThrow(UnauthorizedException);
    });
  });
});