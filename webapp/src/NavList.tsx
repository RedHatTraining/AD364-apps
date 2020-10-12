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
                </NavList>
            </Nav>
        );
    }
}

export default NavDefaultList;
