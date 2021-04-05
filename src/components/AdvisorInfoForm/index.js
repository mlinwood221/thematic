import React, {Component} from 'react';
import {
    Row,
    Col,
    FormGroup,
    ControlLabel,
    FormControl,
    Toggle,
    HelpBlock,
    DatePicker,
    Form
} from 'rsuite';

class index extends Component {
    state = {
        advisorInfo: this.props.info
    }

    handleInfoChange = (value, event) => {
        console.log("JARANE", this.state.advisorInfo, event.target.name, value);
        let advisorInfo = this.state.advisorInfo;
        advisorInfo[event.target.name] = value;
        this.setState({advisorInfo});
    }

    render() {
        console.log("PA JEL SE DObIJE STA MAJKU MU", this.state.advisorInfo, this.props.info);
        const advisorInfo = this.props.info;

        return (
            <div>
                <Row className="mb-20">
                    <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Company Name:</ControlLabel>
                            <FormControl
                                value={advisorInfo.company_name}
                                name="company_name"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>

                    <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Advisor Name:</ControlLabel>
                            <FormControl
                                value={advisorInfo.advisor_name}
                                name="advisor_name"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>

                    <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Advisor Phone:</ControlLabel>
                            <FormControl
                                value={advisorInfo.advisor_phone}
                                name="advisor_phone"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>

                    <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Website:</ControlLabel>
                            <FormControl
                                value={advisorInfo.website}
                                name="website"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>

                    <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <FormGroup>
                            <ControlLabel>Logo URL:</ControlLabel>
                            <FormControl
                                value={advisorInfo.logo}
                                name="logo"
                                onChange={this.handleInfoChange}/>
                        </FormGroup>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default index;