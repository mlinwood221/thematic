import React from 'react';
import {Row, Col} from 'rsuite';

const index = (props) => {
    return (
        <div className="Holdings-Table">
            <Row
                style={{
                position: 'sticky',
                top: '0',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px',
                backgroundColor: 'white',
                zIndex: '100'
            }}>
                <Col xs={20} xsOffset={2} md={3} mdOffset={0}>
                    <strong>Symbol</strong>
                </Col>
                <Col xs={20} xsOffset={2} md={15} mdOffset={0}>
                    <strong>Name</strong>
                </Col>
                <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                    <strong>Weight</strong>
                </Col>
            </Row>

            {props
                .holdings
                .map((h, k) => {
                    if (Number(h.weight.substr(0, h.weight.length - 1)) < 0) {
                        return null;
                    }

                    return (
                        <div className="holding" key={k}>
                            <div
                                className="holding-field"
                                style={{
                                width: '12.5%'
                            }}>{h.symbol}</div>
                            <div
                                className="holding-field"
                                style={{
                                width: '62.5%'
                            }}>{h.name}</div>
                            <div
                                className="holding-field"
                                style={{
                                width: '25%'
                            }}>{h.weight}</div>
                        </div>
                    )
                })}
        </div>
    );
};

export default index;