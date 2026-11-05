import { TokenType } from './token-type.enum.js';

describe('TokenType', () => {
  it('should define token types', () => {
    expect(TokenType.ACCESS).toBe('ACCESS');
    expect(TokenType.REFRESH).toBe('REFRESH');
    expect(TokenType.ID).toBe('ID');
    expect(TokenType.API_KEY).toBe('API_KEY');
  });
});
