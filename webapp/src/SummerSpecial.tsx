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
    Checkbox,
    TextInput,
} from "@patternfly/react-core";

import KieRestService from "./Services/KieRestService";

interface SummerSpecialState {
    numberOfAdults: string;
    numberOfChildren: string;
    discount: string;
    error: {
        isActive: boolean;
        header?: string;
        message?: string;
    };
    info: {
        isActive: boolean;
    };
    amount?: any;
    firedRules: any;
}

class SummerSpecial extends Component<any, SummerSpecialState> {
    service: KieRestService;
    constructor(props: any) {
        super(props);
        this.state = {
            numberOfAdults: "0",
            numberOfChildren: "0",
            discount: "NONE",
            error: {
                isActive: false,
            },
            info: {
                isActive: true,
            },
            firedRules: undefined,
        };
        this.service = new KieRestService("http://localhost:8080", "drl-review_1.0.0-SNAPSHOT");
    }

    onChangeNumberOfAdults = (numberOfAdults: string) => {
        this.setState({ numberOfAdults });
        //this.resetTransientState();
    };

    onChangeNumberOfChildren = (numberOfChildren: string) => {
        this.setState({ numberOfChildren });
        //this.resetTransientState();
    };

    onChangeDiscount = (discount: string) => {
        this.setState({ discount });
        //this.resetTransientState();
    };

    // resetTransientState = () => {
    //     this.setState({
    //         firedRules: undefined,
    //         numberOfAdults: "0",
    //         numberOfChildren: "0",
    //         discount: "NONE"
    //     });
    // };

    submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = `{
            "commands":[
              {
                "insert":{
                  "object":{
                    "com.ad364.drl_review.Ticket":{
                      "numberOfAdults":"${this.state.numberOfAdults}",
                      "numberOfChildren":"${this.state.numberOfChildren}",
                      "discount": "${this.state.discount}"
                    }
                  },
                  "return-object":false
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
        this.service
            .fireRules(payload)
            .then(this.parseKieServerData)
            .catch((err) => {
                console.error(err);
                //this.resetTransientState();
                this.setState({
                    error: {
                        isActive: true,
                        header: "Fetching pricing failed",
                        message: `Got the following error trying to execute ${this.service.containerName}: ${err}. Check console for further information.`,
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
        console.log(JSON.stringify(data,null,2));
        const kieResultsArray = data.result["execution-results"]["results"];
        const firedRules = kieResultsArray[0].value;

        const Ticket = kieResultsArray[1].value
            .filter((kieObject: any) => kieObject["com.ad364.drl_review.Ticket"])
            .map((kieObject: any) => kieObject["com.ad364.drl_review.Ticket"]);

            console.log(JSON.stringify(Ticket,null,2));

        this.setState({
            amount: Ticket[0].amount,
            firedRules,
        });
    };

    render() {
        const { info, error, firedRules, amount } = this.state;

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
                        This page expects Red Hat Decision Manager application ID: <b>drl-review_1.0.0-SNAPSHOT</b>.
                    </Alert>
                )}
                <TextContent>
                    <Text component="h1" className="centered">
                        <b>Summer Special Pricing</b>
                    </Text>
                </TextContent>
                <br />
                <Form onSubmit={this.submit}>
                    <Flex>
                        <FlexItem>
                            <FormGroup label="No. of Adults" fieldId="adults">
                                <TextInput value={this.state.numberOfAdults} 
                                type="text" 
                                onChange={this.onChangeNumberOfAdults} 
                                css="" aria-label="text input example"
                                />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem>
                            <FormGroup label="No. of Children" fieldId="children">
                            <TextInput value={this.state.numberOfChildren} 
                                type="text" 
                                onChange={this.onChangeNumberOfChildren} 
                                css="" aria-label="text input example"
                            />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem>
                            <FormGroup label="Discount Code" fieldId="discount">
                            <TextInput value={this.state.discount} 
                                type="text" 
                                onChange={this.onChangeDiscount} 
                                css="" aria-label="text input example"
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
                                Total Amount: {amount ? "$" + amount : "0.00"}
                            </Text>
                        </TextContent>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

export default SummerSpecial;
