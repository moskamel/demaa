// Shantaweb platform integration
// API documentation: https://shantaweb.com/api (requires partner access)

export async function cancelOrder(_domain: string, _token: string, _externalId: string): Promise<void> {
  // TODO: implement when Shantaweb provides partner API docs
  throw new Error('Shantaweb cancel API not yet available')
}

export async function fulfillOrder(
  _domain: string,
  _token: string,
  _externalId: string,
  _trackingNumber?: string,
  _carrier?: string,
): Promise<void> {
  // TODO: implement when Shantaweb provides partner API docs
  throw new Error('Shantaweb fulfillment API not yet available')
}
