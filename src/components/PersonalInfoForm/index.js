import React, {Component} from 'react';
import {
    Row,
    Col,
    FormGroup,
    ControlLabel,
    FormControl,
    Toggle,
    HelpBlock,
    DatePicker
} from 'rsuite';

class index extends Component {
    state = {
        clientInfo: this.props.info
    }

    handleInfoChange = (value, event) => {
        let clientInfo = this.state.clientInfo;
        clientInfo[event.target.name] = value;
        this.setState({clientInfo});
    }

    render() {
        const clientInfo = this.state.clientInfo;

        return (
            <div>
                <Row className="mb-20">
                    <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Email Address</ControlLabel>
                            <FormControl
                                value={clientInfo.email}
                                name="email"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                </Row>

                <Row className="mb-20">
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>First name*</ControlLabel>
                            <FormControl
                                value={clientInfo.first_name}
                                name="first_name"
                                type="text"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Last name*</ControlLabel>
                            <FormControl
                                value={clientInfo.last_name}
                                name="last_name"
                                type="text"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Birth Date*</ControlLabel>
                            <DatePicker
                                value={new Date(clientInfo.date_of_birth)}
                                format="MM-DD-YYYY"
                                onSelect={(value) => this.handleInfoChange(value.toISOString(), {
                                target: {
                                    name: 'date_of_birth'
                                }
                            })}
                                onOk={(value) => this.handleInfoChange(value.toISOString(), {
                                target: {
                                    name: 'date_of_birth'
                                }
                            })}
                                style={{
                                width: '100%'
                            }}/> {/* <HelpBlock tooltip>Required</HelpBlock> */}
                        </FormGroup>
                    </Col>
                </Row>

                <Row className="mb-20">
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Address</ControlLabel>
                            <FormControl
                                value={clientInfo.address}
                                name="address"
                                type="text"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>City</ControlLabel>
                            <FormControl
                                value={clientInfo.city}
                                name="city"
                                type="text"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>State</ControlLabel>
                            <FormControl
                                value={clientInfo.state}
                                name="state"
                                type="text"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                </Row>

                <Row className="mb-20">
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Budget*</ControlLabel>
                            <FormControl
                                value={clientInfo.budget}
                                name="budget"
                                type="number"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Planned retirement date*</ControlLabel>
                            <DatePicker
                                value={new Date(clientInfo.retirement_date)}
                                format="MM-DD-YYYY"
                                onSelect={(value) => this.handleInfoChange(value.toISOString(), {
                                target: {
                                    name: 'retirement_date'
                                }
                            })}
                                onOk={(value) => this.handleInfoChange(value.toISOString(), {
                                target: {
                                    name: 'retirement_date'
                                }
                            })}
                                style={{
                                width: '100%'
                            }}/> {/* <HelpBlock tooltip>Required</HelpBlock> */}
                        </FormGroup>
                    </Col>
                    <Col xs={20} xsOffset={2} md={7} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Monthly income</ControlLabel>
                            <HelpBlock
                                style={{
                                width: '60%',
                                float: 'left'
                            }}>The client has regular monthly income</HelpBlock>
                            <Toggle
                                checked={clientInfo.monthly_income}
                                onChange={(value) => this.handleInfoChange(value, {
                                target: {
                                    name: 'monthly_income'
                                }
                            })}/>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default index;