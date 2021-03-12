import React, { Component } from 'react';
import { Row, Col } from 'rsuite';
import { withRouter } from 'react-router';

import ClientDetailForm from './DetailForm';

class Create extends Component {
    state = {
        newClient: {}
    }

    handleCancel = () => {
        this.setState({
            newClient: {}
        }, () => {
            this
                .props
                .history
                .push('/clients');
        });
    }

    handleSuccess = (clientID) => {
        this
            .props
            .history
            .push('/clients/detail/' + clientID);
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={20} xsOffset={2} md={20} mdOffset={2}>
                        <h1 className="page-title">Add New Client</h1>

                        <ClientDetailForm mode="create" onSuccess={this.handleSuccess} onCancel={this.handleCancel} />
                    </Col>
                </Row>
            </div>
        );
    }
}

export default withRouter(Create);