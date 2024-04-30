import type { ExecuteRawTransaction } from '../types';

export function solanaTransaction(
  transaction: any,
  signers: string[],
  network_name: string
): ExecuteRawTransaction {
  return {
    network_name,
    transaction: {
      instructions: JSON.stringify(transaction.instructions),
      signers: signers,
    },
  };
}
