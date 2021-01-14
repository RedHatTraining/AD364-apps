import React from "react";
import { Nav, NavItem, NavList } from "@patternfly/react-core";

import { Link } from "react-router-dom";

class NavDefaultList extends React.Component {
    render() {
        return (
            <Nav css="" theme="dark">
                <NavList>
                    <NavItem id="home" isActive={window.location.pathname.endsWith("/")}>
                        <Link to="/">Home</Link>
                    </NavItem>
                    <NavItem id="comfort" isActive={window.location.pathname.endsWith("/comfort")}>
                        <Link to="/comfort">Comfort Upgrade Pricing</Link>
                    </NavItem>
                    <NavItem id="summer" isActive={window.location.pathname.endsWith("/summer")}>
                        <Link to="/summer">Summer Special Package</Link>
                    </NavItem>
                    <NavItem id="last-minute" isActive={window.location.pathname.endsWith("/last-minute")}>
                        <Link to="/last-minute">Last Minute Pricing</Link>
                    </NavItem>
                    <NavItem id="fraud-detection" isActive={window.location.pathname.endsWith("/fraud-detection")}>
                        <Link to="/fraud-detection">Fraud Detection</Link>
                    </NavItem>
                    <NavItem id="pricing-page" isActive={window.location.pathname.endsWith("/pricing-test")}>
                        <Link to="/pricing-test">Pricing Performance Test</Link>
                    </NavItem>
                </NavList>
            </Nav>
        );
    }
}

export default NavDefaultList;
