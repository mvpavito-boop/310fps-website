// Server-only values supplied by the owner. Missing details block the release check.
export function legalOperator() {
  return {
    name: process.env.LEGAL_OPERATOR_NAME?.trim() || '',
    inn: process.env.LEGAL_OPERATOR_INN?.trim() || '',
    registration: process.env.LEGAL_OPERATOR_REGISTRATION?.trim() || '',
    address: process.env.LEGAL_OPERATOR_ADDRESS?.trim() || '',
    email: process.env.LEGAL_OPERATOR_EMAIL?.trim() || '',
  };
}

export function legalOperatorComplete(operator = legalOperator()) {
  return Object.values(operator).every(Boolean) && /^\d{10}(\d{2})?$/.test(operator.inn)
    && /^\d{13}(\d{2})?$/.test(operator.registration) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(operator.email);
}
