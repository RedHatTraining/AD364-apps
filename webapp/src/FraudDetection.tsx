import React, { Component } from "react";
import {
    Alert,
    AlertActionCloseButton,
    Form,
    FormGroup,
    Button,
    TextContent,
    Flex,
    FlexItem,
    TextInput,
    Checkbox,
    Card,
    CardBody,
    CardHeader,
} from "@patternfly/react-core";

import KieDMNService from "./Services/KieDMNService";
import ErrorCircleOIcon from "@patternfly/react-icons/dist/js/icons/error-circle-o-icon";
import OkIcon from "@patternfly/react-icons/dist/js/icons/ok-icon";

interface FraudDetectionState {
    lastMinute: boolean;
    recentlyAcquiredLP: number;
    recentlyAcquiredLPValid: boolean;
    firstTimeFlyer: boolean;
    paidLP: number;
    paidLPValid: boolean;
    paidMoney: number;
    paidMoneyValid: boolean;
    submitButtonValid: boolean;
    fraudAction?: {
        freezeAccount: boolean;
        score: number;
        permitTransaction: boolean;
    };
    error: {
        isActive: boolean;
        header?: string;
        message?: string;
    };
}

class FraudDetection extends Component<any, FraudDetectionState> {
    service: KieDMNService;
    constructor(props: any) {
        super(props);
        this.state = {
            lastMinute: false,
            recentlyAcquiredLP: 0,
            recentlyAcquiredLPValid: true,
            firstTimeFlyer: false,
            paidLP: 0,
            paidLPValid: true,
            paidMoney: 0,
            paidMoneyValid: true,
            submitButtonValid: true,
            error: {
                isActive: false,
            },
        };
        this.service = new KieDMNService("dmn-review");
    }

    onChangeFlightLastMinute = (lastMinute: boolean) => {
        this.setState({
            lastMinute,
        });
    };

    onChangeFirstTimeFlier = (firstTimeFlyer: boolean) => {
        this.setState({
            firstTimeFlyer,
        });
    };

    submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { lastMinute, firstTimeFlyer, paidLP, paidMoney, recentlyAcquiredLP } = this.state;
        const payload = `"dmn-context":{
            "Account": {
              "recentlyAcquiredLP": ${recentlyAcquiredLP},
              "flightHistory": ${firstTimeFlyer ? "[]" : this.getDummyFlightArray()}
            },
            "Flight": {
              "isLastMinute": ${lastMinute}
            },
            "Payment": {
              "charged": ${paidMoney},
              "paidInLP": ${paidLP}
            }
        }`;
        try {
            const res = await this.service.fireDMN(payload);
            const decisionResults = res.result["dmn-evaluation-result"]["dmn-context"]["Determine Fraud Action"];
            if (decisionResults === undefined) {
                console.error(
                    "Could not find 'Determine Fraud Action' object in the dmn context;" +
                        "is the DMN decision node correctly named?",
                );
                throw new Error();
            }
            this.setState({
                fraudAction: {
                    freezeAccount: decisionResults.freezeAccount,
                    score: decisionResults.score,
                    permitTransaction: decisionResults.permitTransaction,
                },
            });
        } catch (e) {
            console.error(e);
            this.setState({
                error: {
                    isActive: true,
                    header: "Fetching fraud score failed",
                    message: `Trying to execute ${this.service.containerName}. Check console for further information.`,
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

    getDummyFlightArray = (): string => {
        return "[{\"isLastMinute\": true}]";
    };

    onChangeAcquiredLP = async (val: string) => {
        const recentlyAcquiredLPValid = this.isPositiveNum(val);
        await this.setState({ recentlyAcquiredLP: Number(val), recentlyAcquiredLPValid });
        this.validateSubmitButton();
    };

    validateSubmitButton = () => {
        const { recentlyAcquiredLPValid, paidLPValid, paidMoneyValid } = this.state;
        this.setState({
            submitButtonValid: recentlyAcquiredLPValid && paidLPValid && paidMoneyValid,
        });
    };

    onChangePaidLP = async (val: string) => {
        const paidLPValid = this.isPositiveNum(val);
        await this.setState({ paidLP: Number(val), paidLPValid });
        this.validateSubmitButton();
    };

    onChangePaidMoney = async (val: string) => {
        const paidMoneyValid = this.isPositiveNum(val);
        await this.setState({ paidMoney: Number(val), paidMoneyValid });
        this.validateSubmitButton();
    };

    isPositiveNum = (val: string): boolean => {
        const numVal = Number(val);
        return !isNaN(numVal) && numVal >= 0;
    };

    determineCardClassName = (): string => {
        const { fraudAction } = this.state;
        if (fraudAction === undefined) return "";
        if (fraudAction?.score < 0.3) return "border-top-blue";
        if (fraudAction?.score < 0.6) return "border-top-yellow";
        return "border-top-red";
    };

    render() {
        const { error, fraudAction } = this.state;

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
                    <h1 className="centered">Fraud Detection System</h1>
                </TextContent>
                <br />
                <Form onSubmit={this.submit}>
                    <Flex>
                        <FlexItem>
                            <FormGroup label="Recently acquired loyalty points" fieldId="account-info">
                                <TextInput
                                    aria-label="Recently acquired loyalty points"
                                    id="acc-lp"
                                    css=""
                                    onChange={this.onChangeAcquiredLP}
                                    value={this.state.recentlyAcquiredLP}
                                    isValid={this.state.recentlyAcquiredLPValid}
                                    type="number"
                                />
                            </FormGroup>
                            <FormGroup label="Paid in loyalty points" fieldId="account-info">
                                <TextInput
                                    aria-label="Paid in loyalty points"
                                    id="acc-lp"
                                    css=""
                                    onChange={this.onChangePaidLP}
                                    value={this.state.paidLP}
                                    isValid={this.state.paidLPValid}
                                    type="number"
                                />
                            </FormGroup>
                            <FormGroup
                                label="Paid in money"
                                helperText="Please provide your full name"
                                fieldId="account-info"
                            >
                                <TextInput
                                    aria-label="Paid in money"
                                    id="acc-lp"
                                    css=""
                                    onChange={this.onChangePaidMoney}
                                    value={this.state.paidMoney}
                                    isValid={this.state.paidMoneyValid}
                                    type="number"
                                />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem>
                            <FormGroup label="Flight and customer information" fieldId="flight-info">
                                <Checkbox
                                    label="Is flight last minute?"
                                    aria-label="flight-lm"
                                    id="flight-lm"
                                    onChange={this.onChangeFlightLastMinute}
                                    isChecked={this.state.lastMinute}
                                />
                                <Checkbox
                                    label="New customer?"
                                    aria-label="new customer"
                                    id="customer-new"
                                    onChange={this.onChangeFirstTimeFlier}
                                    isChecked={this.state.firstTimeFlyer}
                                />
                            </FormGroup>
                        </FlexItem>
                    </Flex>
                    <span>
                        <Button css="" type="submit" isDisabled={!this.state.submitButtonValid} variant="primary">
                            Get score
                        </Button>
                    </span>
                </Form>
                {fraudAction && (
                    <>
                        <Card className={this.determineCardClassName()} style={{ margin: "20px", float: "left" }}>
                            <CardHeader>Fraud action recommendation</CardHeader>
                            <CardBody>
                                <TextContent className="align-icons">
                                    <p>
                                        Allow transaction:{" "}
                                        {fraudAction.permitTransaction ? (
                                            <OkIcon size="md" color="var(--pf-global--success-color--200)" />
                                        ) : (
                                            <ErrorCircleOIcon size="md" color="var(--pf-global--danger-color--100)" />
                                        )}
                                    </p>
                                    <p>
                                        Freeze account:{" "}
                                        {fraudAction.freezeAccount ? (
                                            <OkIcon size="md" color="var(--pf-global--danger-color--100)" />
                                        ) : (
                                            <ErrorCircleOIcon size="md" color="var(--pf-global--success-color--200)" />
                                        )}
                                    </p>
                                    <p>Fraud score: {fraudAction.score}</p>
                                </TextContent>
                            </CardBody>
                        </Card>
                    </>
                )}
            </>
        );
    }
}

export default FraudDetection;
