import { apiRequest } from '@/services/http';
import { usersAPI } from '@/services/userService';

jest.mock('@/services/http', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = jest.mocked(apiRequest);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usersAPI', () => {
  it('41 - create encaminha o payload público sem alterá-lo', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 201, data: {} } as never);
    const payload = {
      email: 'gestor@example.com',
      name: 'Gestor',
      password: '123456',
      role: 'GESTOR',
      acceptedTerms: true,
      acceptedPrivacy: true,
    };

    await usersAPI.create(payload);

    expect(mockedApiRequest).toHaveBeenCalledWith('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('listagem de usuários aplica filtro de papel quando informado', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: [] } as never);

    await usersAPI.list('DENUNCIANTE');

    expect(mockedApiRequest).toHaveBeenCalledWith('/users?role=DENUNCIANTE');
  });

  it('cria gestor pelo endpoint administrativo dedicado sem aceitar papel do cliente', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: {} } as never);
    const payload = {
      email: 'gestor@example.com',
      name: 'Gestor',
      password: '123456',
    };

    await usersAPI.createGestor(payload);

    expect(mockedApiRequest).toHaveBeenCalledWith('/users/gestores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });
});
