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
} from "@patternfly/react-core";
import KieRestService from "./Services/KieRestService";

interface ComfortPricingState {
    loyalty: string;
    comfort: boolean;
    error: {
        isActive: boolean;
        header?: string;
        message?: string;
    };
    info: {
        isActive: boolean;
    };
    comfortFee?: any;
    firedRules: any;
}

class ComfortPricing extends Component<any, ComfortPricingState> {
    service: KieRestService;
    constructor(props: any) {
        super(props);
        this.state = {
            loyalty: "Bronze",
            comfort: false,
            error: {
                isActive: false,
            },
            info: {
                isActive: true,
            },
            firedRules: undefined,
        };
        this.service = new KieRestService("http://localhost:8080", "authoring-lab_1.0.0-SNAPSHOT");
    }

    onChangeLoyalty = (loyalty: string) => {
        this.setState({ loyalty });
        this.resetTransientState();
    };

    onChangeComfort = (comfort: any) => {
        this.setState({ comfort });
        this.resetTransientState();
    };

    resetTransientState = () => {
        this.setState({
            firedRules: undefined,
            comfortFee: undefined,
        });
    };

    submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = `{
            "commands":[
              {
                "insert":{
                  "object":{
                    "com.ad364.authoring_lab.User":{
                      "loyaltylevel":"${this.state.loyalty}"
                    }
                  },
                  "return-object":false
                }
              },
              {
                "insert":{
                  "object":{
                    "com.ad364.authoring_lab.Reservation":{
                      "upgradecomfort": "${this.state.comfort}"
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
        const firedRules = kieResultsArray[0].value;

        const comfortFee = kieResultsArray[1].value
            .filter((kieObject: any) => kieObject["com.ad364.authoring_lab.ComfortFee"])
            .map((kieObject: any) => kieObject["com.ad364.authoring_lab.ComfortFee"]);

        this.setState({
            comfortFee: comfortFee[0],
            firedRules,
        });
    };

    render() {
        const { info, error, firedRules, comfortFee } = this.state;

        const loyaltyLevels = ["Bronze", "Silver", "Gold", "None", "Default"];

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
                        This page expects Red Hat Decision Manager application ID: <b>authoring-lab_1.0.0-SNAPSHOT</b>.
                    </Alert>
                )}
                <TextContent>
                    <Text component="h1" className="centered">
                        <b>Pricing Calculator</b>
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
                            <FormGroup label="Extra Services" fieldId="comfort_upgrade">
                                <Checkbox
                                    label="Upgrade Comfort Package?"
                                    aria-label="comfort_upgrade"
                                    id="comfort_upgrade"
                                    onChange={this.onChangeComfort}
                                    isChecked={this.state.comfort}
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
                                Fee amount: {comfortFee ? "$" + comfortFee.amount : "none"}
                            </Text>
                        </TextContent>
                    </div>
                )}
            </React.Fragment>
        );
    }
}

export default ComfortPricing;
