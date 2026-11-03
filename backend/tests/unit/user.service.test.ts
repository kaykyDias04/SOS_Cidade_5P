import bcrypt from 'bcryptjs';

jest.mock('../../src/lib/prisma', () => ({ prisma: {} }));

import { UserRepository } from '../../src/repositories/user.repository';
import { UserService } from '../../src/services/user.service';

const criar = jest.spyOn(UserRepository.prototype, 'create');

describe('UserService.createUser: cadastro público', () => {
  beforeEach(() => {
    criar.mockImplementation(async (dados) => ({ id: 10, ...dados }) as any);
  });

  it('UN-USUARIO-01: senha com 5 caracteres é recusada e nada é gravado', async () => {
    await expect(
      new UserService().createUser({ email: 'a@sos.com', name: 'A', password: '12345' }),
    ).rejects.toThrow('A senha deve ter no mínimo 6 caracteres.');
    expect(criar).not.toHaveBeenCalled();
  });

  it('UN-USUARIO-02: cadastro sem senha é recusado', async () => {
    await expect(new UserService().createUser({ email: 'a@sos.com', name: 'A' })).rejects.toThrow(
      'A senha deve ter no mínimo 6 caracteres.',
    );
    expect(criar).not.toHaveBeenCalled();
  });

  it('UN-USUARIO-03: senha com exatamente 6 caracteres é aceita (valor-limite)', async () => {
    await new UserService().createUser({ email: 'a@sos.com', name: 'A', password: '123456' });

    expect(criar).toHaveBeenCalledTimes(1);
  });

  it('UN-USUARIO-04: role GESTOR pedida no cadastro público vira DENUNCIANTE', async () => {
    await new UserService().createUser({
      email: 'quer.ser.gestor@sos.com',
      name: 'B',
      password: 'senha123',
      role: 'GESTOR',
    });

    expect(criar).toHaveBeenCalledWith(expect.objectContaining({ role: 'DENUNCIANTE' }));
  });

  it('UN-USUARIO-05: a senha é gravada como hash bcrypt, nunca em texto puro', async () => {
    await new UserService().createUser({ email: 'c@sos.com', name: 'C', password: 'senha123' });

    const gravada = criar.mock.calls[0][0].password;
    expect(gravada).not.toBe('senha123');
    expect(bcrypt.compareSync('senha123', gravada)).toBe(true);
  });
});
