export const DEPARTMENTS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlantico', 'Bolivar', 'Boyaca',
  'Caldas', 'Caqueta', 'Casanare', 'Cauca', 'Cesar', 'Choco',
  'Cordoba', 'Cundinamarca', 'Guainia', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Narino', 'Norte de Santander', 'Putumayo',
  'Quindio', 'Risaralda', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca',
  'Vaupes', 'Vichada',
];

export const BANKS = [
  'Bancolombia', 'Davivienda', 'BBVA', 'Banco de Bogota', 'Banco de Occidente',
  'Banco AV Villas', 'Banco Popular', 'Banco Agrario', 'Banco Falabella',
  'Scotiabank Colpatria', 'RappiPay', 'Nequi', 'Daviplata',
];

export const ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Ahorros' },
  { value: 'CHECKING', label: 'Corriente' },
  { value: 'WALLET', label: 'Digital' },
];

export const DNI_TYPES = [
  { value: 'CC', label: 'Cedula de Ciudadania' },
  { value: 'CE', label: 'Cedula de Extranjeria' },
  { value: 'PS', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
];

// Fallback: ciudades por departamento para cuando el backend no responde
// La fuente de verdad es el backend (GET /api/v1/locations/departments)
export const CITIES_BY_DEPARTMENT = {
  'Antioquia': ['Medellin', 'Envigado', 'Itagui', 'Bello', 'Apartado'],
  'Atlantico': ['Barranquilla', 'Soledad', 'Malambo'],
  'Bogota D.C.': ['Bogota D.C.', 'Bogota'],
  'Bogotá D.C.': ['Bogotá D.C.', 'Bogotá'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Barrancabermeja'],
  'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tulua'],
  'Bolivar': ['Cartagena', 'Turbaco'],
  'Boyaca': ['Tunja', 'Duitama', 'Sogamoso'],
  'Caldas': ['Manizales', 'Villamaria'],
  'Cauca': ['Popayan'],
  'Cesar': ['Valledupar'],
  'Cordoba': ['Monteria', 'Caucasia'],
  'Cundinamarca': ['Soacha', 'Girardot', 'Zipaquira', 'Chia'],
  'Huila': ['Neiva', 'Pitalito'],
  'La Guajira': ['Riohacha', 'Maicao'],
  'Magdalena': ['Santa Marta', 'Cienaga'],
  'Meta': ['Villavicencio', 'Acacias'],
  'Narino': ['Pasto', 'Tumaco'],
  'Norte de Santander': ['Cucuta', 'Ocana'],
  'Quindio': ['Armenia', 'Calarca'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
  'Sucre': ['Sincelejo', 'Corozal'],
  'Tolima': ['Ibague', 'Melgar'],
};
