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
} from "@patternfly/react-core";

import KieDMNService from "./Services/KieDMNService";

interface FraudDetectionState {
    lastMinute: boolean;
    recentlyAcquiredLP: number;
    recentlyAcquiredLPValid: boolean;
    firstTimeFlyer: boolean;
    paidLP: number;
    paidLPValid: boolean;
    paidMoney: number;
    paidMoneyValid: boolean;
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
            console.log(res);
        } catch (e) {
            console.log(e);
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

    onChangeAcquiredLP = (val: string) => {
        const recentlyAcquiredLPValid = this.isPositiveNum(val);
        this.setState({ recentlyAcquiredLP: Number(val), recentlyAcquiredLPValid });
    };

    onChangePaidLP = (val: string) => {
        const paidLPValid = this.isPositiveNum(val);
        this.setState({ paidLP: Number(val), paidLPValid });
    };

    onChangePaidMoney = (val: string) => {
        const paidMoneyValid = this.isPositiveNum(val);
        this.setState({ paidMoney: Number(val), paidMoneyValid });
    };

    isPositiveNum = (val: string): boolean => {
        const numVal = Number(val);
        return !isNaN(numVal) && numVal >= 0;
    };

    render() {
        const { error } = this.state;

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
                        <Button css="" type="submit" variant="primary">
                            Get price
                        </Button>
                    </span>
                </Form>
                {false && (
                    <>
                        {/* result here 
                        
                        
                        
                        */}
                    </>
                )}
            </>
        );
    }
}

export default FraudDetection;
