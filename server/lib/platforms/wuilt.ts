// Wuilt platform integration
// API documentation: https://docs.wuilt.com/api (requires partner access)

export async function cancelOrder(_domain: string, _token: string, _externalId: string): Promise<void> {
  // TODO: implement when Wuilt provides partner API docs
  throw new Error('Wuilt cancel API not yet available')
}

export async function fulfillOrder(
  _domain: string,
  _token: string,
  _externalId: string,
  _trackingNumber?: string,
  _carrier?: string,
): Promise<void> {
  // TODO: implement when Wuilt provides partner API docs
  throw new Error('Wuilt fulfillment API not yet available')
}
