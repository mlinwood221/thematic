import React from 'react';
import { Container, Content, Footer, Row, Col } from 'rsuite';

const PublicLayout = ({ children }) => (
    <Container>
        <Content>
            {children}
        </Content>
        <Footer>
            <Row className="text-center pb-20">
                <Col xs={20} xsOffset={2} md={12} mdOffset={6}>
                    Thematic | 2020
                </Col>
            </Row>
        </Footer>
    </Container>
);

export default PublicLayout;