import React, { Component } from 'react';
import {
    Button,
    ButtonToolbar,
    Form,
    FormGroup,
    ControlLabel,
    HelpBlock,
    Row,
    Col,
    Toggle,
    SelectPicker,
    TagGroup,
    FormControl,
    DatePicker
} from 'rsuite';

import AdvisorInfoForm from './../../components/AdvisorInfoForm';
import ClientAPI from './../../api/client';

const newAdvisorInfo = () => {
    return {
        email: '',
        password: '',
        company_name: '',
        advisor_name: '',
        advisor_phone: '',
        website: '',
        logo: '',
    };
}

class AdvisorForm extends Component {
    advisorInfoForm = React.createRef();

    state = {
        isLoadingAdvisor: false,
        advisor: this.props.mode === 'create' ? newAdvisorInfo() : {},
    }

    componentDidMount() {
        if(this.props.mode === 'edit'){
            this.getAdvisor(this.props.id);
        }
    }

    handleInfoChange = (value, event) => {
        let advisor = this.state.advisor;
        advisor[event.target.name] = value;
        this.setState({advisor});
    }

    handleActive = (value, event) => {
        let advisor = this.state.advisor;
        advisor[event.target.name] = value;
        this.setState({ advisor });
    }
    
    getAdvisor = async (id) => {
        this.setState({ isLoadingAdvisor: true });

        try {
            let res = await ClientAPI.advisorDetails({ id: parseInt(id) });
            this.setState({ advisor: res.data.advisor });
        } catch (error) {
            console.log("error", error)
            alert("There has been an error...")
        } finally {
            this.setState({ isLoadingAdvisor: false });
            return;
        }
    }

    render() {
        const advisorInfo  = this.state.advisor;
        const submitBtnLabel = "Update";

        return (
            <div>
                <Col xs={20} xsOffset={2} md={20} mdOffset={2}>
                <Form>
                    {/* Personal info */}
                    <div className="card mb-30">
                        <h3 className="card-title">Advisor Info</h3>
                        <Row className="mb-20">
                        <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                            <FormGroup>
                                <ControlLabel>Email*:</ControlLabel>
                                <FormControl
                                    value={advisorInfo.email}
                                    name="email"
                                    onChange={this.handleInfoChange}/>
                            </FormGroup>
                        </Col>
                        {
                            this.props.mode === 'create' &&
                            <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Password*:</ControlLabel>
                                    <FormControl
                                        value={advisorInfo.password}
                                        type="password"
                                        name="password"
                                        onChange={this.handleInfoChange}/>
                                </FormGroup>
                            </Col>
                        }
                        <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                            <FormGroup>
                                <ControlLabel>Is account active</ControlLabel>
                                <HelpBlock
                                    style={{
                                        width: '70%',
                                        float: 'left'
                                    }}>Inactive accounts cannot log in</HelpBlock>
                                <Toggle
                                    checked={advisorInfo.is_active}
                                    onChange={(value) => this.handleActive(value, {
                                        target: {
                                            name: 'is_active'
                                        }
                                    })} />
                            </FormGroup>
                        </Col>
                        </Row>
                        <Row className="mb-20">
                        <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                            <FormGroup>
                                <ControlLabel>Company Name*:</ControlLabel>
                                <FormControl
                                    value={advisorInfo.company_name}
                                    name="company_name"
                                    onChange={this.handleInfoChange}/>
                            </FormGroup>
                        </Col>

                        <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                            <FormGroup>
                                <ControlLabel>Advisor Name*:</ControlLabel>
                                <FormControl
                                    value={advisorInfo.advisor_name}
                                    name="advisor_name"
                                    onChange={this.handleInfoChange}/>
                            </FormGroup>
                        </Col>

                        <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                            <FormGroup>
                                <ControlLabel>Advisor Phone*:</ControlLabel>
                                <FormControl
                                    value={advisorInfo.advisor_phone}
                                    name="advisor_phone"
                                    onChange={this.handleInfoChange}/>
                            </FormGroup>
                        </Col>

                        <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                            <FormGroup>
                                <ControlLabel>Website*:</ControlLabel>
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
                </Form >

                <FormGroup className="mt-10 text-center">
                    <ButtonToolbar>
                        <Button
                            appearance="primary"
                            className="btn --purple mr-20"
                            style={{
                                width: '260px'
                            }}
                            onClick={()=>{this.props.onSubmit(this.state.advisor)}}>
                            {this.state.isLoading
                                ? 'Loading...'
                                : submitBtnLabel}
                        </Button>
                        <Button
                            appearance="default"
                            className="btn --secondary"
                            onClick={this.props.onCancel}>Cancel</Button>
                    </ButtonToolbar>
                </FormGroup>
                </Col>
            </div >
        );
    }
}

export default AdvisorForm;