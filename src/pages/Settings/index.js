import React, { Component } from 'react';
import {
    Row, Col, Form, Button,
    ButtonToolbar, FormGroup, ControlLabel, FormControl, Toggle, HelpBlock
} from 'rsuite';
import ClientAPI from '../../api/client';
import { loadStripe } from '@stripe/stripe-js';

import ConfirmationModal from './../../components/ConfirmationModal';

const STRIPE_KEY_ENV = {
    'development': 'pk_test_51Gqa8xBpTdIKBxjSDQvIrvvLFJWVJFtjlzi7BjVncZo6ABUuZ9i0OfDbD0kh42ZsSvefdEV09fiCylJ9585X1rIc00529sWAGs',
    'production': 'pk_live_fhtrf9tH0B33TxabqoDI5l1K00orfFPlch'
};

const stripePromise = loadStripe(STRIPE_KEY_ENV[process.env.REACT_APP_ENVIRONMENT]);

const newClientInfo = () => {
    return {
        email: '',
        password: '',
        new_password: '',
        new_password2: ''
    };
}

class Settings extends Component {
    state = {
        isConfirmSubscriptionModalVisible: false,
        clientInfo: newClientInfo(),
        advisorInfo: {},
        message: '',
        isLoading: false
    }

    componentDidMount() {
        this.fetchCurrent();
    }

    fetchCurrent = async () => {
        try {
            this.setState({ isLoading: true });
            let res = await ClientAPI.current();
            let clientInfo = this.state.clientInfo;
            clientInfo.email = res.data.email;

            this.setState({
                advisorInfo: res.data,
                clientInfo
            });
        } catch (error) {
            console.log("error")
            alert("There has been an error...")
        } finally {
            this.setState({ isLoading: false });
            return;
        }
    }

    handleInfoChange = (value, event) => {
        let clientInfo = this.state.clientInfo;
        clientInfo[event.target.name] = value;
        this.setState({ clientInfo });
    }

    handleShowSubscriptionModal = () => {
        this.setState({isConfirmSubscriptionModalVisible: true});
    }
    
    handleSubscribe = async () => {
        try {
            this.setState({ isLoading: true });
            let res = await ClientAPI.paymentSession(this.state.advisorInfo.customer_id);

            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId: res.data.session_id,
            });
            // console.log(res.data.session_id);
        } catch (error) {
            console.log("error")
            alert("There has been an error...")
        } finally {
            this.setState({ isLoading: false });
            return;
        }
    }

    handleHideSubscriptionModal = () => {
        this.setState({isConfirmSubscriptionModalVisible: false});
    }

    handleCancelSubscription = async () => {
        try {
            console.log(this.state.advisorInfo)
            let res = await ClientAPI.cancelSubscription({id: this.state.advisorInfo.id ,subscription_id: this.state.advisorInfo.subscription_id});
            if(res.data.message === "success") {
                window.alert("Your subscription has been successfully canceled.");
            }

            let advisorInfo = this.state.advisorInfo;
            advisorInfo.subscribed=false;
            advisorInfo.subscription_id="";
            this.setState(advisorInfo);
        } catch (error) {
            console.log("error")
            alert("There has been an error...")
        } finally {
            this.setState({ isLoading: false });
            return;
        }
    }

    handleSubmit = async () => {
        if (this.state.clientInfo.password == '' ||
            this.state.clientInfo.new_password == '' ||
            this.state.clientInfo.new_password2 == '') {
            alert("All fields are required");
            return;
        }

        if (this.state.clientInfo.new_password !=
            this.state.clientInfo.new_password2) {
            alert("Passwords do not match");
            return;
        }

        try {
            let res = await ClientAPI.updatePassword(this.state.clientInfo)
            this.setState({ message: "Successfully updated" })
        } catch (error) {
            alert("Error updating your info")
        } finally {
            this.setState({ clientInfo: newClientInfo() });
        }
    }

    getPackage = (id) => {
        if (id === 0)
            return "Thematic Standard"
        if (id === 1)
            return "Thematic Prospect"
        if (id === 2)
            return "Thematic Collaborate"
    }

    parseDate = (date) => {
        let d = new Date(date)
        return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
    }

    toDate = (str) => {
        if(!str) return new Date()
        return new Date(str)
    }

    render() {
        const clientInfo = this.state.clientInfo;

        return (
            <Row>
                <Col xs={20} xsOffset={2} md={16} mdOffset={4}>
                    <div>
                        <Form>
                            <div className="card mb-30">
                                <h3 className="card-title">Settings</h3>

                                <Row className="mb-20">
                                    <Col xs={20} xsOffset={2} md={10} mdOffset={0}>
                                        <FormGroup>
                                            <ControlLabel>Email: <strong style={{ color: "rgb(135, 136, 141)", textTransform: "lowercase" }}>{this.state.isLoading ? "Loading" : this.state.advisorInfo.email}</strong></ControlLabel>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row className="mb-20">
                                    <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                        <FormGroup>
                                            <ControlLabel>Current Password</ControlLabel>
                                            <FormControl
                                                value={clientInfo.password}
                                                name="password"
                                                type="password"
                                                onChange={this.handleInfoChange} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                        <FormGroup>
                                            <ControlLabel>New Password</ControlLabel>
                                            <FormControl
                                                value={clientInfo.new_password}
                                                name="new_password"
                                                type="password"
                                                onChange={this.handleInfoChange} />
                                        </FormGroup>
                                    </Col>
                                    <Col xs={20} xsOffset={0} md={8} mdOffset={0}>
                                        <FormGroup>
                                            <ControlLabel>Confirm New Password</ControlLabel>
                                            <FormControl
                                                value={clientInfo.new_password2}
                                                name="new_password2"
                                                type="password"
                                                onChange={this.handleInfoChange} />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={20} xsOffset={0} md={8} mdOffset={0}>
                                        <FormGroup className="mt-10">
                                            <Button
                                                appearance="secondary"
                                                className="btn mr-20"
                                                onClick={this.handleSubmit}>
                                                Save New Password
                                            </Button>
                                            <p style={{ marginTop: "10px" }}>
                                                {this.state.message ? this.state.message : ""}
                                            </p>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <hr></hr>
                                    <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                    <FormGroup>
                                        <ControlLabel>Package: <strong style={{ color: "rgb(135, 136, 141)" }}>{this.state.isLoading ? "Loading" : this.getPackage(this.state.advisorInfo.package)}</strong></ControlLabel>
                                        {
                                            !this.state.advisorInfo.subscribed &&
                                            <ControlLabel>Valid until: 
                                            {
                                                this.toDate() > this.toDate(this.state.advisorInfo.trial_ending_on) ? <strong style={{ color: "rgb(135, 136, 141)" }}>{this.state.isLoading ? "Loading" : "Expired"}</strong>
                                                : <strong style={{ color: "rgb(135, 136, 141)" }}>{this.state.isLoading ? "Loading" : this.parseDate(this.state.advisorInfo.trial_ending_on)}</strong>
                                            }
                                            </ControlLabel>
                                        }
                                    </FormGroup>
                                    {
                                        (this.state.advisorInfo.subscribed && this.state.advisorInfo.subscription_id.length===0) &&
                                        <p>Subscription will be propagated and link to manage subscription will appear here within 24 hours</p>
                                    }
                                    {
                                        (this.state.advisorInfo.subscribed && this.state.advisorInfo.subscription_id.length>0) &&
                                        <Button
                                            appearance="secondary"
                                            className="btn mr-20"
                                            onClick={this.handleCancelSubscription}>
                                                Cancel Subscription
                                        </Button>
                                    }
                                    {
                                        !this.state.advisorInfo.subscribed &&
                                        <Button
                                            appearance="primary"
                                            className="btn --purple mr-20"
                                            onClick={() => {
                                                console.log(this.toDate(), this.toDate(this.state.advisorInfo.trial_ending_on))
                                                if(this.toDate() < this.toDate(this.state.advisorInfo.trial_ending_on))
                                                    this.handleShowSubscriptionModal()
                                                else this.handleSubscribe()
                                            }}>
                                                Subscribe
                                        </Button>
                                    }
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </div>
                </Col>
                {this.state.isConfirmSubscriptionModalVisible && <ConfirmationModal
                    text="Your Thematic Standard package has not expired yet. If you proceed, you will be billed and the period will be extended for +1 month on top of your current expiration date. Are you sure you want to proceed?"
                    onConfirm={this.handleSubscribe}
                    onClose={this.handleHideSubscriptionModal} />}
            </Row>
        );
    }
};

export default Settings;