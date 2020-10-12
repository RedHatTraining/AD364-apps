import React, { Component } from "react";
import rhtLogo from "./assets/training_black.png";

import { TextContent, Text } from "@patternfly/react-core";

export default class WelcomePage extends Component {
    render() {
        return (
            <TextContent>
                <Text component="h1" className="centered">
                    <b>Welcome to the AD364 Application</b>
                </Text>
                <div className="centered">
                    <img src={rhtLogo} alt="Red Hat Training Logo" />
                </div>
                <Text component="p">
                    This front end application serves as a visualization for a deployed Red Hat Decision Manager back
                    end application.
                </Text>
                <Text component="p">
                    Please choose a link on the left to test your Red Hat Decision Manager applications.
                </Text>
            </TextContent>
        );
    }
}
