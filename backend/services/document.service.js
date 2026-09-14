export function totals(lines, taxRate) {
    const cents = lines.reduce((sum, line) => sum + Math.round(line.price * 100) * line.quantity, 0);
    if (!Number.isSafeInteger(cents) || cents > 10000000000) throw Object.assign(new Error('Document amount exceeds the supported limit.'), {
        status: 400
    });
    const tax = Math.round(cents * taxRate / 100);
    return {
        subtotal: cents / 100,
        tax: tax / 100,
        amount: (cents + tax) / 100
    };
}
export const stages = {
    Delivery: ['Packing', 'Sent out', 'Received'],
    Pickup: ['Packing', 'Ready for pickup', 'Collected']
};
export function canTransition(method, from, to) {
    const sequence = stages[method];
    return Boolean(sequence && sequence.indexOf(from) >= 0 && sequence[sequence.indexOf(from) + 1] === to);
}
