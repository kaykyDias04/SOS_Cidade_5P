export const BAIRROS_RECIFE = [
  'Afogados',
  'Água Fria',
  'Arruda',
  'Beberibe',
  'Boa Viagem',
  'Boa Vista',
  'Brasília Teimosa',
  'Campo Grande',
  'Casa Amarela',
  'Caxangá',
  'Coelhos',
  'Cordeiro',
  'Derby',
  'Dois Irmãos',
  'Encruzilhada',
  'Espinheiro',
  'Graças',
  'Ibura',
  'Imbiribeira',
  'IPSEP',
  'Iputinga',
  'Jaqueira',
  'Jardim São Paulo',
  'Madalena',
  'Mustardinha',
  'Parnamirim',
  'Pina',
  'Prado',
  'Recife (Centro)',
  'Rosarinho',
  'San Martin',
  'Santo Amaro',
  'São José',
  'Tamarineira',
  'Tejipió',
  'Torre',
  'Torreão',
  'Várzea',
];

export const BAIRRO_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'Boa Viagem': { latitude: -8.1192, longitude: -34.9011 },
  'Recife Antigo': { latitude: -8.0628, longitude: -34.8711 },
  'Casa Amarela': { latitude: -8.0242, longitude: -34.9202 },
  Aflitos: { latitude: -8.0492, longitude: -34.9002 },
  Graças: { latitude: -8.0532, longitude: -34.9042 },
  Espinheiro: { latitude: -8.0452, longitude: -34.9022 },
  Torre: { latitude: -8.0782, longitude: -34.9102 },
  'Boa Vista': { latitude: -8.0648, longitude: -34.8831 },
  'Água Fria': { latitude: -7.9972, longitude: -34.9202 },
  Várzea: { latitude: -8.0552, longitude: -34.9502 },
};

export const DEFAULT_COORDS = { latitude: -8.0578, longitude: -34.9029 };

export function getCoords(bairro: string): { latitude: number; longitude: number } {
  const key = Object.keys(BAIRRO_COORDS).find((candidate) =>
    bairro?.toLowerCase().includes(candidate.toLowerCase())
  );
  if (key) return BAIRRO_COORDS[key];
  return {
    latitude: DEFAULT_COORDS.latitude + (Math.random() - 0.5) * 0.06,
    longitude: DEFAULT_COORDS.longitude + (Math.random() - 0.5) * 0.06,
  };
}
