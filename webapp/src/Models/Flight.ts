import Discount from './Discount';

export default interface Flight {
    date: Date,
    flightId: string,
    basePrice: number,
    carrier: string,
    discounts?: Discount[],
    note?: string
};
