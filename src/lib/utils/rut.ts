export const cleanRut = (rut: string): string => {
  const cleaned = typeof rut === 'string' ? rut.replace(/[^0-9kK]/g, '').toUpperCase() : '';
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
};

export const isValidRut = (rut: string): boolean => {
  if (!/^[0-9]+-[0-9kK]$/.test(rut)) return false;

  const [body, dv] = rut.split('-');
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }

  const calculatedDv = 11 - (sum % 11);
  const expectedDv = calculatedDv === 11 ? '0' : calculatedDv === 10 ? 'K' : String(calculatedDv);

  return dv.toUpperCase() === expectedDv;
};

export const formatRutForDisplay = (rut: string): string => {
  if (!rut) return '';
  const [body, dv] = rut.split('-');
  if (!body) return rut;

  const formattedBody = new Intl.NumberFormat('es-CL').format(parseInt(body, 10));
  return dv ? `${formattedBody}-${dv}` : formattedBody;
};
