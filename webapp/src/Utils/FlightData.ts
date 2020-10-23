import Flight from "../Models/Flight";

export function getFlightData():Flight[] {
    return [
        getFlight("JBT224", 40, "JBTravel"),
        getFlight("JBT112", 60, "JBTravel", getFutureDate(5)),
        getFlight("JBT330", 250, "JBTravel", getFutureDate(15)),
    ];
}

function getFlight(flightId: string, basePrice: number, carrier: string, date=new Date()): Flight {
    return {
        flightId,
        basePrice,
        carrier,
        date
    }
}   

function getFutureDate(numOfDays: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + numOfDays);
    return date;
}

export function getFlightName(flightId: string): string {
    const mapping = new Map<string, string>();
    mapping.set("JBT224", "Mumbai to Bangalore");
    mapping.set("JBT112", "Brno to London");
    mapping.set("JBT330", "Raleigh to Texas");
    return mapping.get(flightId) || "Not found" ;
}

