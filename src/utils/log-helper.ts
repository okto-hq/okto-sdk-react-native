import type { AuthDetails } from '../types';

export function getTokenStringStartEnd(token: string) {
  const startChars = token.substring(0, 4);
  const endChars = token.substring(token.length - 4);
  return `${startChars}...${endChars}`;
}

export function getAuthDetailsPrettyString(authDetails: AuthDetails) {
  let output = `\n\t\tAuth Token: ${getTokenStringStartEnd(authDetails.authToken)}\n`;
  output += `\t\tRefresh Token: ${getTokenStringStartEnd(authDetails.refreshToken)}\n`;
  output += `\t\tDevice Token: ${getTokenStringStartEnd(authDetails.deviceToken)}\n`;
  return output;
}
