import React from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import 'rsuite/dist/styles/rsuite-default.css';

import { PublicRoute, PrivateRoute } from './routeGuards';
import Login from './pages/Login';
import Clients from './pages/Clients';
import CreateClient from './pages/Clients/Create';
import ClientDetail from './pages/Clients/Detail';
import EditClient from './pages/Clients/Edit';
import Prospects from './pages/Prospects';
import Questionnaire from './pages/Questionnaire';
import EmbeddedQuestionnaire from './pages/EmbeddedQuestionnaire';
import Analytics from './pages/Analytics';
import PortfolioAnalyser from './pages/PortfolioAnalyser';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import './styles/global.scss';

function App() {
  return (
    <div className="App"> 
      <HashRouter>
        <Switch>
          <Route exact path="/">
            <Redirect to="/clients" />
          </Route>

          <PublicRoute path="/login" component={Login} />
          <Route exact path="/embed/questionnaire/:id" component={EmbeddedQuestionnaire} />

          <PrivateRoute exact path="/clients" component={Clients} />
          <PrivateRoute exact path="/clients/new" component={CreateClient} />
          <PrivateRoute exact path="/clients/detail/:id" component={ClientDetail} />
          <PrivateRoute exact path="/clients/edit/:id" component={EditClient} />

          <PrivateRoute exact path="/questionnaire" component={Questionnaire} />

          <PrivateRoute exact path="/analyse" component={PortfolioAnalyser} />

          <PrivateRoute exact path="/prospects" component={Prospects} />
          <PrivateRoute exact path="/analytics" component={Analytics} />
          <PrivateRoute exact path="/settings" component={Settings} />

          <Route component={NotFound} />
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;