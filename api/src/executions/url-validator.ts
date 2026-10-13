import { BadRequestException } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

function isPrivateIp(address: string): boolean {
  if (address === '::1' || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80:')) return true;
  if (!isIP(address) || address.includes(':')) return false;
  const [a, b] = address.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
}

export async function assertPublicUrl(value: string): Promise<string> {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new BadRequestException('Use uma URL HTTP/HTTPS publica sem credenciais.');
  }
  if (url.hostname === 'localhost') throw new BadRequestException('Enderecos locais nao sao permitidos.');
  try {
    const addresses = await lookup(url.hostname, { all: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
      throw new BadRequestException('A URL aponta para uma rede privada ou reservada.');
    }
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException('Nao foi possivel resolver o host informado.');
  }
  url.hash = '';
  return url.toString();
}
