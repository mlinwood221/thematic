import React, { Component } from 'react';
import { Row, Col } from 'rsuite';
import { withRouter } from 'react-router';

import ClientDetailForm from './DetailForm';

class PortfolioAnalyser extends Component {
    state = {
    }

    handleCancel = () => {
        this
            .props
            .history
            .push('/clients');
    }

    handleSuccess = (data) => {
        localStorage.setItem("analyse", JSON.stringify(data))
        this
            .props
            .history
            .push('/clients/detail/analyse');
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={20} xsOffset={2} md={20} mdOffset={2}>
                        <h1 className="page-title">Analyse Portfolio</h1>

                        <ClientDetailForm mode="create" onSuccess={this.handleSuccess} onCancel={this.handleCancel} />
                    </Col>
                </Row>
            </div>
        );
    }
}

export default withRouter(PortfolioAnalyser);