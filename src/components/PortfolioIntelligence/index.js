import React from 'react';
import {Col, Whisper, Tooltip} from 'rsuite';

const comingSoonTooltip = <Tooltip>Coming soon</Tooltip>;

const PortfolioIntelligence = (props) => {
    return (
        <div>
            <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                <div className="card portfolio-int-card">
                    <h2>
                        <span className="circle --green"></span>
                        Budget</h2>
                    <p>{props.data.budget}</p>

                    <span className="action">
                        <Whisper placement="top" trigger="click" speaker={comingSoonTooltip}>
                            <span className="plain-link">
                                &#62; Switch to direct indexing anyway</span>
                        </Whisper>
                    </span>
                </div>
            </Col>

            <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                <div className="card portfolio-int-card">
                    <h2>
                        <span className="circle --purple"></span>
                        Investment Priority</h2>
                    <p>{props.data.investment_priority}</p>

                    <span className="action">
                        <Whisper placement="top" trigger="click" speaker={comingSoonTooltip}>
                            <span className="plain-link">
                                &#62; See more suggestions</span>
                        </Whisper>
                    </span>
                </div>
            </Col>

            <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                <div className="card portfolio-int-card">
                    <h2>
                        <span className="circle --red"></span>
                        Causes and Ideas</h2>
                    <p>{props.data.causes_and_ideas}</p>

                    <span className="action">
                        <Whisper placement="top" trigger="click" speaker={comingSoonTooltip}>
                            <span className="plain-link">
                                &#62; See more ETFs supporting these causes</span>
                        </Whisper>
                    </span>
                </div>
            </Col>

            <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                <div className="card portfolio-int-card">
                    <h2>
                        <span className="circle --yellow"></span>
                        Activities to Avoid</h2>
                    <p>{props.data.activities_to_avoid}</p>

                    <span className="action">
                        <Whisper placement="top" trigger="click" speaker={comingSoonTooltip}>
                            <span className="plain-link">
                                &#62; See more ETFs avoiding these activities</span>
                        </Whisper>
                    </span>
                </div>
            </Col>
        </div>
    );
};

export default PortfolioIntelligence;