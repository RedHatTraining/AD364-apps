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
    Text,
    TextVariants,
    Flex,
    FlexItem,
} from "@patternfly/react-core";
import KieRestService from "./Services/KieRestService";

interface PricingTestState {
    loyalty: string;
    seat: number;
    error: {
        isActive: boolean;
        header?: string;
        message?: string;
    };
    BookingAction?: any;
    executionTime?: number;
}

class PricingTest extends Component<any, PricingTestState> {
    service: KieRestService;
    constructor(props: any) {
        super(props);
        this.state = {
            loyalty: "Bronze",
            error: {
                isActive: false,
            },
            seat: 1,
        };
        this.service = new KieRestService("http://localhost:8080", "flow-review");
    }

    onChangeLoyalty = (loyalty: string) => {
        this.setState({ loyalty });
        this.resetTransientState();
    };

    onChangeSeat = (seat: any) => {
        this.setState({ seat });
        this.resetTransientState();
    };

    resetTransientState = () => {
        this.setState({
            BookingAction: undefined,
        });
    };

    submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = `{
            "commands":[
              {
                "insert":{
                  "object":{
                    "com.ad364.flow_review.Customer":{
                      "loyaltyLevel":"${this.state.loyalty}"
                    }
                  },
                  "return-object":false
                }
              },
              {
                "insert":{
                  "object":{
                    "com.ad364.flow_review.BookingAction":{
                      "seat": "${this.state.seat}"
                    }
                  },
                  "return-object":true
                }
              },
              {
                "fire-all-rules":{
                  "out-identifier": "firedRules"
                }
              },
              {
                "get-objects": {
                  "out-identifier": "objects"
                }
              },
              { 
                "dispose": {}
              }
            ]
            }`;

        try {
            const t0 = performance.now();
            const resp = await this.service.fireRules(payload);
            const t1 = performance.now();
            this.setState({ executionTime: t1 - t0 });
            this.parseKieServerData(resp);
        } catch (err) {
            console.error(err);
            this.resetTransientState();
            this.setState({
                error: {
                    isActive: true,
                    header: "Fetching pricing information failed",
                    message: `Got the following error trying to execute ${this.service.containerName}: ${err}. 
                        Check console for further information.`,
                },
            });
        }
    };

    closeAlert = () => {
        this.setState({
            error: {
                isActive: false,
            },
        });
    };

    parseKieServerData = (data: any) => {
        const kieResultsArray = data.result["execution-results"]["results"];

        const BookingActionList = kieResultsArray[1].value
            .filter((kieObject: any) => kieObject["com.ad364.flow_review.BookingAction"])
            .map((kieObject: any) => kieObject["com.ad364.flow_review.BookingAction"]);

        this.setState({
            BookingAction: BookingActionList[0],
        });
    };

    render() {
        const { error, BookingAction, executionTime } = this.state;

        const loyaltyLevels = ["Bronze", "Silver", "Gold", "None"];
        // Get range of 1..49 (assignable seats)
        const seatList = [...Array(48).keys()].map((num) => num + 1);

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
                    <Text component="h1" className="centered">
                        <b>Pricing Performance Test</b>
                    </Text>
                </TextContent>
                <br />
                <Form onSubmit={this.submit}>
                    <Flex>
                        <FlexItem>
                            <FormGroup label="Loyalty Level" fieldId="loyalty_lvl">
                                <FormSelect
                                    value={this.state.loyalty}
                                    onChange={this.onChangeLoyalty}
                                    id="loyalty"
                                    aria-label="FormSelect Input"
                                >
                                    {loyaltyLevels.map((curr, index) => (
                                        <FormSelectOption key={index} value={curr} label={curr} />
                                    ))}
                                </FormSelect>
                            </FormGroup>
                        </FlexItem>
                        <FlexItem>
                            <FormGroup label="Seat Choice" fieldId="seat_choice">
                                <FormSelect
                                    value={this.state.seat}
                                    onChange={this.onChangeSeat}
                                    id="seat_choice"
                                    aria-label="seat FormSelect Input"
                                >
                                    {seatList.map((curr, index) => (
                                        <FormSelectOption key={index} value={curr} label={String(curr)} />
                                    ))}
                                </FormSelect>
                            </FormGroup>
                        </FlexItem>
                    </Flex>
                    <span>
                        <Button css="" type="submit" variant="primary">
                            Submit
                        </Button>
                    </span>
                </Form>
                {BookingAction !== undefined && (
                    <div>
                        <TextContent className="margin-separator">
                            <Text component={TextVariants.p} className="text-container">
                                Fee amount: {BookingAction.price ? "$" + BookingAction.price : "Booking invalid"}
                            </Text>
                            <Text component={TextVariants.p} className="text-container">
                                Time to completion: {executionTime} ms
                            </Text>
                        </TextContent>
                    </div>
                )}
            </>
        );
    }
}

export default PricingTest;
