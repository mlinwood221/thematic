import React from 'react';
import { Modal, Button, Row, Col } from 'rsuite';

const index = (props) => {
    return (
        <div>
            <Modal backdrop={true} show={true} onHide={props.onClose} size="lg">
                <Modal.Body>
                    <div className="IdeaDetail" style={{ overflowX: "hidden" }}>
                        <h1 className="icon"><i className={props.idea.icon} /></h1>
                        <h1>{props.idea.name}</h1>
                        <p className="description">
                            {props.idea.description}
                        </p>
                        <Row>
                            <Col xs={20} xsOffset={2} md={12} mdOffset={0}>
                                <img src={`themes-img/${props.idea.img}`} alt={props.idea.name} />
                            </Col>
                            <Col xs={20} xsOffset={2} md={12} mdOffset={0}>
                                <h2>Why is this important?</h2>
                                <ul>
                                    {props
                                        .idea
                                        .facts
                                        .map((f, k) => (
                                            <li key={k}>
                                                {f.fact}

                                                <span>
                                                    [<a href={f.link} target="_blank" rel="noopener noreferrer">{f.source}</a>]
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onClose} appearance="subtle">
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default index;