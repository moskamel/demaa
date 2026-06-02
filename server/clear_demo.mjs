const { default: p } = await import('./lib/prisma.js')
const user = await p.user.findUnique({ where: { email: 'demo@deema.ai' } })
if (!user) { console.log('no demo user'); process.exit(0) }
const mem = await p.teamMembership.findFirst({ where: { userId: user.id } })
const orgId = mem?.organizationId
if (orgId) {
  const stores = await p.store.findMany({ where: { organizationId: orgId } })
  for (const s of stores) {
    await p.shipment.deleteMany({ where: { order: { storeId: s.id } } }).catch(() => {})
    await p.orderItem.deleteMany({ where: { order: { storeId: s.id } } })
    await p.order.deleteMany({ where: { storeId: s.id } })
    await p.product.deleteMany({ where: { storeId: s.id } })
  }
  await p.notification.deleteMany({ where: { organizationId: orgId } })
  await p.aiMemory.deleteMany({ where: { organizationId: orgId } })
  await p.customer.deleteMany({ where: { organizationId: orgId } })
  await p.coupon.deleteMany({ where: { organizationId: orgId } })
  await p.conversation.deleteMany({ where: { organizationId: orgId } })
}
console.log('Demo data cleared')
process.exit(0)
