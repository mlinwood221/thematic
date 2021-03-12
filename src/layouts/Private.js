import React from 'react';
import { Container, Sidebar, Header, Content } from 'rsuite';

import AppSidenav from './../components/Sidenav';

const PrivateLayout = ({ children }) => (
    <Container className="App-Private">
        <Sidebar width="auto">
            <AppSidenav />
        </Sidebar>
        <Container>
            <Header>
                <img src="/strelica.png" alt="Thematic logo" className="logo" />
            </Header>
            <Content>{children}</Content>
        </Container>
    </Container>
);

export default PrivateLayout;