import React from "react";
import Structure from "./MainStructure";
import WelcomePage from "./Welcome";
import ComfortPricing from "./ComfortPricing";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App = () => {
    return (
        <Router>
            <Switch>
                <Structure>
                    <Route path="/" exact>
                        <WelcomePage />
                    </Route>
                    <Route path="/comfort" exact>
                        <ComfortPricing />
                    </Route>
                </Structure>
            </Switch>
        </Router>
    );
};

export default App;
