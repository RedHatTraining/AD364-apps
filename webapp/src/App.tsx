import React from "react";
import Structure from "./MainStructure";
import WelcomePage from "./Welcome";
import ComfortPricing from "./ComfortPricing";
import SummerSpecial from "./SummerSpecial";
import LastMinute from "./LastMinute";
import EventPlanning from "./EventPlanning";

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
                    <Route path="/summer" exact>
                        <SummerSpecial />
                    </Route>
                    <Route path="/last-minute" exact>
                        <LastMinute />
                    </Route>
                    <Route path="/event-planning" exact>
                        <EventPlanning />
                    </Route>
                </Structure>
            </Switch>
        </Router>
    );
};

export default App;
