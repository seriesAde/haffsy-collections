export function paymentSummary(order, invoice, payments) {
    const snapshot = invoice || order?.invoiceSnapshot || { amount: 0 };
    const paidCents = payments.filter(payment => payment.status === 'Verified')
        .reduce((sum, payment) => sum + Math.round(payment.amount * 100), 0);
    const totalCents = Math.round((snapshot.amount || 0) * 100) + Math.round((order.deliveryFee || 0) * 100);
    return {
        paid: paidCents / 100,
        total: totalCents / 100,
        balance: Math.max(0, totalCents - paidCents) / 100,
        paymentStatus: paidCents >= totalCents && order.feeConfirmed ? 'Paid' : paidCents > 0 ? 'Partial' : 'Unpaid'
    };
}
