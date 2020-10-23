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
} from "@patternfly/react-core";


import KieQuarkusService from "./Services/KieQuarkusService";

import { getFlightData, getFlightName } from "./Utils/FlightData";
import Flight from "./Models/Flight";
import { RestService } from "./Services/RestService";

interface LastMinuteState {
    loyalty: string;
    comfort: boolean;
    flight?: Flight;
    error: {
        isActive: boolean;
        header?: string;
        message?: string;
    };
    comfortFee?: any;
    firedRules: any;
}

class LastMinute extends Component<any, LastMinuteState> {
    service: KieQuarkusService;
    constructor(props: any) {
        super(props);
        this.state = {
            loyalty: "Bronze",
            comfort: false,
            error: {
                isActive: false,
            },
            firedRules: undefined,
        };
        this.service = new KieQuarkusService("http://localhost:8090");
    }

    onChangeFlight = (flightId: string) => {
        const flights = getFlightData().filter((flight: Flight) => {
            return flight.flightId === flightId
        });
        this.setState({flight: flights[0]});
        this.resetTransientState();
    };

    resetTransientState = () => {
        this.setState({
            firedRules: undefined,
        });
    };

    submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = JSON.stringify(this.state.flight);
        this.service
            .fireRules(payload)
            .then(this.parseKieServerData)
            .catch((err) => {
                console.error(err);
                this.resetTransientState();
                this.setState({
                    error: {
                        isActive: true,
                        header: "Fetching comfort pricing failed",
                        message: `${err}. Check console for further information.`,
                    },
                });
            });
    };

    closeAlert = () => {
        this.setState({
            error: {
                isActive: false,
            }
        });
    };

    parseKieServerData = (data: any) => {
        console.log(data);
    };

    render() {
        const { flight, error, firedRules, comfortFee } = this.state;

        const flightData = getFlightData();

        return (
            <React.Fragment>
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
                    </Flex>
                    <span>
                        <Button css="" type="submit" variant="primary">
                            Get price
                        </Button>
                    </span>
                </Form>
                {flight !== undefined && (
                    <div style={{marginTop: "10px"}}>
                        <p><b>Flight date: </b>{flight.date.toString()}</p>
                        <p><b>Flight Carrier: </b>{flight.carrier}</p>
                        <p><b>{getFlightName(flight.flightId)}</b></p>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

export default LastMinute;
