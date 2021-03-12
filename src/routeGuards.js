import React from 'react';
import {Route, Redirect} from 'react-router-dom';

import PublicLayout from './layouts/Public';
import PrivateLayout from './layouts/Private';


export const PublicRoute = ({
    component: Component,
    ...rest
}) => {
    if (localStorage.getItem('t__isAuthenticated')) {
        return (<Redirect to="/clients"/>);
    }

    return (
        <Route
            {...rest}
            render={matchProps => (
            <PublicLayout>
                <Component {...matchProps}/>
            </PublicLayout>
        )}/>
    )
};

export const PrivateRoute = ({
    component: Component,
    ...rest
}) => {
    if (!localStorage.getItem('t__isAuthenticated')) {
        return (<Redirect to="/login"/>);
    }

    return (
        <Route
            {...rest}
            render={matchProps => (
            <PrivateLayout>
                <Component {...matchProps}/>
            </PrivateLayout>
        )}/>
    )
};