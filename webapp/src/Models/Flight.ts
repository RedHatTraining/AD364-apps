import Discount from "./Discount";

interface Flight {
    date: Date;
    flightId: string;
    basePrice: number;
    carrier: string;
    discounts?: Discount[];
    note?: string;
}

export default Flight;
