import React, { Component } from "react";
import {
    Alert,
    AlertActionCloseButton,
    Form,
    FormGroup,
    Button,
    TextContent,
    Text,
    TextVariants,
    Flex,
    FlexItem,
    TextInput,
} from "@patternfly/react-core";
import KieRestService from "./Services/KieRestService";

class BarRequest {
    guestName: string;
    totalAlcohol: number;
    requestTime: string;
    status: string;
	constructor(guestName: string, alcAmount: number, requestTime: string, status: string) {
		this.guestName = guestName;
		this.totalAlcohol = alcAmount;
		this.requestTime = requestTime;
		this.status = status;
	}
}

interface OpenBarState {
    guestName: string;
    alcAmount: number;
    requestTime: string;
	previousRequests: Array<BarRequest>;
    error: {
        isActive: boolean;
        header?: string;
        message?: string;
    };
    info: {
        isActive: boolean;
    };
    requestStatus?: any;
    firedRules: any;
}

class EventPlanning extends Component<any, OpenBarState> {
    service: KieRestService;
    constructor(props: any) {
        super(props);
        this.state = {
            guestName: "Alice",
            alcAmount: 10,
            requestTime: "",
			previousRequests: [],
            error: {
                isActive: false,
            },
            info: {
                isActive: true,
            },
            firedRules: undefined,
        };
        this.service = new KieRestService("http://localhost:8080", "OpenBar_1.0.0-SNAPSHOT");
    }

    onChangeGuestName = (guestName: string) => {
        this.setState({ guestName });
        this.resetTransientState();
    };

    onChangeAlcAmount = (alcAmount: any) => {
        this.setState({ alcAmount });
        this.resetTransientState();
    };
	
	addPreviousRequest = (prevReq: BarRequest) => {
		let previousRequests = this.state.previousRequests.slice();
		previousRequests.push(prevReq);
		this.setState({ previousRequests });
	};

    resetTransientState = () => {
        this.setState({
            firedRules: undefined,
            requestStatus: undefined,
        });
    };

    submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
		
		var dateFormat = require('dateformat');
		let barRequest = new BarRequest(this.state.guestName, this.state.alcAmount, dateFormat(Date.now(), "yyyy-mm-dd'T'hh:MM:ss.lo"), "requested");
		var brString = JSON.stringify(barRequest);
		
		var dynPayload = `
		{
		  "lookup": "default-kie-session",
		  "commands":[
		`;
		
		console.log("prevReqeusts: "+ this.state.previousRequests.length);
		this.state.previousRequests.forEach(function (br) {
			dynPayload = dynPayload.concat(`{"insert": {"object": {"com.eventplanning.dataobjects.BarRequest": `).concat(JSON.stringify(br)).concat(`}}},
`);
		});
		
		dynPayload = dynPayload.concat(`{"insert": {"object": {"com.eventplanning.dataobjects.BarRequest": ${brString}}}},
			{"set-focus": {"name": "open-bar"}},
			{"fire-all-rules" : {"max" : 100,"out-identifier" : "firedRules"}},
			{"get-objects" : {"class-object-filter" : {"string" : "java.lang.Object"}, "out-identifier" : "output"}}
		  ]
		}`);

        this.service
            .fireRules(dynPayload)
            .then(this.parseKieServerData)
            .catch((err) => {
                console.error(err);
                this.resetTransientState();
                this.setState({
                    error: {
                        isActive: true,
                        header: "Fetching comfort pricing failed",
                        message: `Got the following error trying to execute ${this.service.containerName}: ${err}. 
                        Check console for further information.`,
                    },
                });
            });
    };

    closeAlert = () => {
        this.setState({
            error: {
                isActive: false,
            },
            info: {
                isActive: false,
            },
        });
    };

    parseKieServerData = (data: any) => {
        const kieResultsArray = data.result["execution-results"]["results"];
        const firedRules = kieResultsArray.find((firedRules: any) => firedRules.key === 'firedRules').value;
		
        const barRequest = kieResultsArray.find((requestStatus: any) => requestStatus.key === 'output').value[0]["com.eventplanning.dataobjects.BarRequest"];
		
		this.addPreviousRequest(new BarRequest(barRequest.guestName, barRequest.totalAlcohol, barRequest.requestTime, barRequest.status))

        const requestStatus = barRequest.status;
        console.info(requestStatus);

        this.setState({
            requestStatus: requestStatus,
            firedRules,
        });
    };

    render() {
        const { info, error, firedRules, requestStatus } = this.state;

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
                {info.isActive && (
                    <Alert
                        css=""
                        className="popup"
                        variant="info"
                        title="Application ID Note"
                        action={<AlertActionCloseButton onClose={this.closeAlert} />}
                    >
                        This page expects Red Hat Decision Manager application ID: <b>{this.service.containerName}</b>.
                    </Alert>
                )}
                <TextContent>
                    <Text component="h1" className="centered">
                        <b>Drink Request</b>
                    </Text>
                </TextContent>
                <br />
                <Form onSubmit={this.submit}>
                    <Flex>
                        <FlexItem>
                            <FormGroup label="Guest name" fieldId="guestName">
                                <TextInput
                                    value={this.state.guestName}
                                    type="text"
                                    onChange={this.onChangeGuestName}
                                    css=""
                                    aria-label="text input example"
                                />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem>
                            <FormGroup label="Alcohol amount" fieldId="children">
                                <TextInput
                                    value={this.state.alcAmount}
                                    type="text"
                                    onChange={this.onChangeAlcAmount}
                                    css=""
                                    aria-label="text input example"
                                />
                            </FormGroup>
                        </FlexItem>
                    </Flex>
                    <span>
                        <Button css="" type="submit" variant="primary">
                            Submit
                        </Button>
                    </span>
                </Form>
                {firedRules !== undefined && (
                    <div>
                        <TextContent className="margin-separator">
                            <Text component={TextVariants.p} className="text-container">
                                Number of fired rules: {firedRules}
                            </Text>
                            <Text component={TextVariants.p} className="text-container">
                                Bar Request: {requestStatus ? requestStatus : "none"}
                            </Text>
                        </TextContent>
                    </div>
                )}
				<table>
				  <tr><th>Name</th><th>Amount</th><th>Time</th><th>Status</th></tr>
				  {this.state.previousRequests.map((br) => (
				    <tr><th>{br.guestName}</th><th>{br.totalAlcohol}</th><th>{br.requestTime}</th><th>{br.status}</th></tr>
				  ))}
				</table>
            </React.Fragment>
        );
    }
}

export default EventPlanning;
