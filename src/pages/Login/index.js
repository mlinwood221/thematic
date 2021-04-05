import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Row, Col, Button, Input } from 'rsuite';
import ClientAPI from './../../api/client';

class Login extends Component {
    state = {
        email: '',
        password: ''
    }

    componentDidMount = () => {
        let uType = localStorage.getItem('t__user-type')

        if(uType === "ADMIN"){
            this
                .props
                .history
                .push('/advisors');
            return
        } else if (uType === "ADVISOR") {
            this
                .props
                .history
                .push('/clients');
            return
        }
    }

    handleLogin = async () => {
        if (!this.state.email || !this.state.password) {
            alert('Please enter valid credentials provided to you by Thematic.');
            return;
        }

        try {
            let res = await ClientAPI.login({ email: this.state.email, password: this.state.password });
            localStorage.setItem('t__isAuthenticated', true);
            localStorage.setItem('t__demo-user', JSON.stringify({ auth_key: res.data.token }));
        } catch (error) {
            console.log("Please enter valid credentials provided to you by Thematic.")
            alert("Invalid credentials")
        } finally {
            try {
                let res = await ClientAPI.current();
                let type = res.data.user_type

                localStorage.setItem('t__user-type', type)

                if(type === "ADMIN"){
                    this
                        .props
                        .history
                        .push('/advisors');
                    return
                } else {
                    this
                        .props
                        .history
                        .push('/clients');
                    return
                }
            } catch (error) {
                console.log("error")
                alert("There has been an error...")
            }
        }
    };

    render() {
        return (
            <div className="LoginPage">
                <Row>
                    <Col xs={20} xsOffset={2} md={10} mdOffset={6} className="text-center mt-50">
                        <div className="card">
                            <h3>Welcome to Thematic</h3>
                            <p
                                style={{
                                    margin: '0 auto',
                                    width: '90%'
                                }}>To get started, enter your credentials.</p>

                            <Input
                                style={{
                                    width: 300,
                                    margin: '10px auto 0',
                                    textAlign: 'center'
                                }}
                                placeholder="Email"
                                value={this.state.email}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        if (!this.state.email || !this.state.password)
                                            return;
                                        this.handleLogin()
                                    }
                                }}
                                onChange={email => this.setState({ email })} />
                            <Input
                                style={{
                                    width: 300,
                                    margin: '10px auto 0',
                                    textAlign: 'center'
                                }}
                                type="password"
                                placeholder="Password"
                                value={this.state.password}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        if (!this.state.email || !this.state.password)
                                            return;
                                        this.handleLogin()
                                    }
                                }}
                                onChange={password => this.setState({ password })} />
                            <Button
                                appearance="primary"
                                disabled={!this.state.email || !this.state.password}
                                className="btn --primary mt-25"
                                onClick={this.handleLogin}>
                                Login to dashboard
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
};

export default withRouter(Login);