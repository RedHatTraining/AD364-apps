import React from "react";
import { Brand, Page, PageHeader, PageSidebar, PageSection } from "@patternfly/react-core";

import imgBrand from "./assets/training_white.png";
import NavList from "./NavList";

interface VerticalPageState {
    isNavOpen: boolean;
}

class VerticalPage extends React.Component<{}, VerticalPageState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isNavOpen: true,
        };
        this.onNavToggle = this.onNavToggle.bind(this);
    }

    protected onNavToggle() {
        this.setState({
            isNavOpen: !this.state.isNavOpen,
        });
    }

    render() {
        const { isNavOpen } = this.state;
        const logoProps = {
            href: "/",
        };
        const Header = (
            <PageHeader
                logo={<Brand src={imgBrand} alt="Patternfly Logo" />}
                logoProps={logoProps}
                showNavToggle
                isNavOpen={isNavOpen}
                onNavToggle={this.onNavToggle}
                style={{ borderTop: "2px solid #c00" }}
            />
        );
        const Sidebar = <PageSidebar nav={<NavList />} isNavOpen={isNavOpen} theme="dark" />;

        return (
            <Page header={Header} sidebar={Sidebar} style={{ minHeight: 800 }}>
                <PageSection>{this.props.children}</PageSection>
            </Page>
        );
    }
}

export default VerticalPage;
