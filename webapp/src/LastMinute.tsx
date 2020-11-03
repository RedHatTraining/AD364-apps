import React, { Component } from "react";
import {
    Alert,
    AlertActionCloseButton,
    Form,
    FormGroup,
    FormSelect,
    FormSelectOption,
    Button,
    TextContent,
    Flex,
    FlexItem,
    TextInput,
} from "@patternfly/react-core";

import KieQuarkusService from "./Services/KieQuarkusService";

import { getFlightData, getFlightName } from "./Utils/FlightData";
import Flight from "./Models/Flight";

interface LastMinuteState {
    flight: Flight;
    note?: string;
    error: {
        isActive: boolean;
        header?: string;
        message?: string;
    };
}

class LastMinute extends Component<any, LastMinuteState> {
    service: KieQuarkusService;
    constructor(props: any) {
        super(props);
        this.state = {
            flight: getFlightData()[0],
            error: {
                isActive: false,
            },
        };
        this.service = new KieQuarkusService();
    }

    onChangeFlight = (flightId: string) => {
        const flights = getFlightData().filter((flight: Flight) => {
            return flight.flightId === flightId;
        });
        this.setState({ flight: flights[0] });
    };

    submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { note, flight } = this.state;
        flight.note = note;
        flight.discounts = undefined;
        this.service
            .fireRules(JSON.stringify(flight))
            .then(this.parseKieServerData)
            .catch((err) => {
                console.error(err);
                this.setState({
                    error: {
                        isActive: true,
                        header: "Fetching pricing failed",
                        message: `${err}. Check console for further information.`,
                    },
                });
            });
    };

    closeAlert = () => {
        this.setState({
            error: {
                isActive: false,
            },
        });
    };

    onNoteChange = (note: string) => {
        this.setState({ note });
    };

    parseKieServerData = (data: Flight) => {
        console.log(data);
        this.setState({ flight: data });
    };

    render() {
        const { flight, error } = this.state;

        const flightData = getFlightData();

        return (
            <>
                {error.isActive && (
                    <Alert
                        css=""
                        className="popup"
                        variant="danger"
                        title={error.header}
                        action={<AlertActionCloseButton onClose={this.closeAlert} />}
                    >
                        {error.message}
                    </Alert>
                )}
                <TextContent>
                    <h1 className="centered">Last Minute Offers</h1>
                </TextContent>
                <br />
                <Form onSubmit={this.submit}>
                    <Flex>
                        <FlexItem>
                            <FormGroup label="Select Flight" fieldId="flight_fg">
                                <FormSelect
                                    value={flight?.flightId}
                                    onChange={this.onChangeFlight}
                                    id="flight"
                                    aria-label="FormSelect Input"
                                >
                                    {flightData.map((curr: Flight, index: number) => (
                                        <FormSelectOption key={index} value={curr.flightId} label={curr.flightId} />
                                    ))}
                                </FormSelect>
                            </FormGroup>
                        </FlexItem>
                        <FlexItem>
                            <FormGroup label="Note for us" fieldId="note">
                                <TextInput
                                    value={this.state.note || ""}
                                    type="text"
                                    onChange={this.onNoteChange}
                                    css=""
                                    aria-label="text input example"
                                />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem>
                            <div>
                                <p>
                                    <b>Flight date: </b>
                                    {flight.date.toString()}
                                </p>
                                <p>
                                    <b>Flight Carrier: </b>
                                    {flight.carrier}
                                </p>
                                <p>
                                    <b>Destination: </b>
                                    {getFlightName(flight.flightId)}
                                </p>
                            </div>
                        </FlexItem>
                    </Flex>
                    <span>
                        <Button css="" type="submit" variant="primary">
                            Get price
                        </Button>
                    </span>
                </Form>
                {flight.discounts !== undefined && (
                    <>
                        <p className="text-container">Base price: ${flight.basePrice}</p>
                        <p className="text-container">
                            Discounted price: $
                            {(1 -
                                flight.discounts
                                    .map((e) => e.amount)
                                    .reduce((previous, current) => previous + current, 0)) *
                                flight.basePrice}
                        </p>
                    </>
                )}
            </>
        );
    }
}

export default LastMinute;
