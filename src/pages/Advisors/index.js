import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Row, Col, Button, Modal } from 'rsuite';

import AdvisorsTable from './Table';
import ClientAPI from './../../api/client';

class Advisors extends Component {
    state = {
        isLoadingAdvisors: false,
    }

    componentDidMount() {
        this.getAdvisors();
    }

    getAdvisors = async () => {
        this.setState({ isLoadingAdvisors: true });

        try {
            this.setState({ isLoading: true });
            let res = await ClientAPI.listAdvisors();
            this.setState({ advisors: res.data.advisors });
        } catch (error) {
            alert('Error getting your advisors');
            console.log('Error getting advisors: ', error);
        } finally {
            this.setState({ isLoadingAdvisors: false });
        }
    }

    handleAddAdvisor = () => {
        this
            .props
            .history
            .push('/advisors/new');
    }

    handleSelectAdvisor = (advisor, action) => {
        if (action === 'edit') {
            this
                .props
                .history
                .push('/advisors/edit/' + advisor.id);
        }
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={20} xsOffset={2} md={16} mdOffset={4}>
                        <h1 className="page-title">Advisors</h1>
                        <Button
                            appearance="link"
                            className="btn --text page-action-btn"
                            onClick={this.handleAddAdvisor}>
                            + Add new advisor
                        </Button>

                        {this.state.isLoadingAdvisors && <p>Loading your advisors..</p>}
                        {(!this.state.isLoadingAdvisors && (!this.state.advisors || this.state.advisors.length === 0)) && <p>No advisors available. Add an advisor using the button on the right.</p>}
                        {(!this.state.isLoadingAdvisors && this.state.advisors && this.state.advisors.length > 0) && <AdvisorsTable data={this.state.advisors} onSelect={this.handleSelectAdvisor} />}
                    </Col>
                </Row>
            </div>
        );
    }
}

export default withRouter(Advisors);