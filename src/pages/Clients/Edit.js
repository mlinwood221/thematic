import React, { Component } from 'react';
import { Row, Col, Button, Icon } from 'rsuite';
import { withRouter } from 'react-router';

import ClientDetailForm from './DetailForm';
import ConfirmationModal from './../../components/ConfirmationModal';
import ClientAPI from './../../api/client';

class Edit extends Component {
    state = {
        isLoadingClient: false,
        client: {
            preferences: {
                activities_to_avoid: [],
                ideas_to_support: []
            }
        },
        isConfirmDeleteVisible: false
    }

    componentDidMount() {
        this.getClient(this.props.match.params.id);
    }

    getClient = async (id) => {
        this.setState({ isLoadingClient: true });

        try {
            let res = await ClientAPI.details({ id: parseInt(id) });
            this.setState({ client: res.data.client });
        } catch (error) {
            console.log("error", error)
            alert("There has been an error...")
        } finally {
            this.setState({ isLoadingClient: false });
            return;
        }
    }

    handleCancel = () => {
        this
            .props
            .history
            .push('/clients/detail/' + this.state.client.id);
    }

    handleSuccess = (clientID) => {
        this
            .props
            .history
            .push('/clients/detail/' + clientID);
    }

    handleShowDeleteConfirm = () => {
        this.setState({ isConfirmDeleteVisible: true });
    }

    handleHideDeleteConfirm = () => {
        this.setState({ isConfirmDeleteVisible: false });
    }

    handleDeleteConfirm = async () => {
        try {
            await ClientAPI.remove({
                id: parseInt(this.state.client.id)
            });
            alert("Client deleted successfully");
            this
                .props
                .history
                .push('/clients');
        } catch (error) {
            console.log("error", error);
            alert("There has been an error deleting the client...")
        }
    }

    render() {
        return (
            <div>
                <span
                    className="plain-link"
                    onClick={() => this.props.history.push('/clients/detail/' + this.state.client.id)}>&#60; Client profile</span>

                <Row>
                    <Col xs={20} xsOffset={2} md={20} mdOffset={2}>
                        <h1 className="page-title">Edit Client Info</h1>

                        <Button
                            appearance="link"
                            className="btn --text page-action-btn --danger"
                            onClick={this.handleShowDeleteConfirm}>
                            <Icon
                                icon="trash-o"
                                style={{
                                    fontSize: '20px',
                                    transform: 'translate(-4px, -1px)'
                                }} />
                            Delete this client
                        </Button>

                        {this.state.isLoadingClient && <p>Loading client info...</p>}
                        {(!this.state.isLoadingClient && !this.state.client) && <p>Could not get client info. Please try again.</p>}
                        {(!this.state.isLoadingClient && this.state.client) && <ClientDetailForm
                            mode="edit"
                            client={this.state.client}
                            onSuccess={this.handleSuccess}
                            onCancel={this.handleCancel} />}

                        {/* Delete confirmation */}
                        {this.state.isConfirmDeleteVisible && <ConfirmationModal
                            text="Are you sure you want to delete this client?"
                            onConfirm={this.handleDeleteConfirm}
                            onClose={this.handleHideDeleteConfirm} />}
                    </Col>
                </Row>
            </div>
        );
    }
}

export default withRouter(Edit);