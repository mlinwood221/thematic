import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Row, Col, Button, Modal } from 'rsuite';

import ClientsTable from './Table';
import ClientAPI from './../../api/client';

class Clients extends Component {
    state = {
        isLoadingClients: false,
        isLeadVisible: false
    }

    componentDidMount() {
        console.log(this.props.location.search);
        if(this.props.location && this.props.location.search==="?succesfully_subscribed=true"){
            console.log("jesmol usli");
            this.updateSubscription()
        } 
        this.getClients();
    }

    updateSubscription = async () => {
        try {
            let res = await ClientAPI.current();
            let id = res.data.id
            let uRes = await ClientAPI.updateSubscription({id: id, subscribed: true});
            if(uRes.data.message === "success") {
                window.alert("Your subscription has been confirmed. Thank you!");
            }
        } catch (error) {
            console.log("error")
            alert("There has been an error...")
        } finally {
            this.setState({ isLoading: false });
            return;
        }   
    }

    getClients = async () => {
        this.setState({ isLoadingClients: true });

        try {
            this.setState({ isLoading: true });
            let res = await ClientAPI.list();
            this.setState({ clients: res.data.clients });
        } catch (error) {
            alert('Error getting your clients');
            console.log('Error getting clients: ', error);
        } finally {
            this.setState({ isLoadingClients: false });
        }
    }

    handleAddClient = () => {
        this
            .props
            .history
            .push('/clients/new');
    }

    handleSelectClient = (client, action) => {
        if (action === 'edit') {
            this
                .props
                .history
                .push('/clients/edit/' + client.id);
        }
        else {
            this
                .props
                .history
                .push('/clients/detail/' + client.id);
        }
    }

    handleShowLead = () => {
        this
            .props
            .history
            .push('/questionnaire');
    }

    handleHideLead = () => {
        this.setState({ isLeadVisible: false });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={20} xsOffset={2} md={16} mdOffset={4}>
                        <h1 className="page-title">Clients</h1>
                        <Button
                            appearance="link"
                            className="btn --text page-action-btn"
                            onClick={this.handleAddClient}>
                            + Add new client
                        </Button>

                        {this.state.isLoadingClients && <p>Loading your clients..</p>}
                        {(!this.state.isLoadingClients && (!this.state.clients || this.state.clients.length === 0)) && <p>No clients available. Add a client using the button on the right.</p>}
                        {(!this.state.isLoadingClients && this.state.clients && this.state.clients.length > 0) && <ClientsTable data={this.state.clients} onSelect={this.handleSelectClient} />}
                    </Col>
                </Row>

                {this.state.isLeadVisible && <Modal
                    show={true}
                    onHide={this.handleHideLead}
                    size="md"
                    className="score-breakdown">
                    <Modal.Header>
                        <Modal.Title
                            style={{
                                textAlign: 'center',
                                fontSize: '20px'
                            }}>
                            Turn prospects into clients with personalized <br></br> form directly from your website</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ paddingBottom: "0" }}>
                        <video controls autoplay style={{
                            width: "100%"
                        }} ref="vidRef" src={`video/lead_quick_720.mov`} type="video/mp4" />
                        <Button onClick={this.handleHideLead} style={{ textAlign: "center", width: "100%", marginTop: "20px" }}>Close</Button>
                    </Modal.Body>
                </Modal>}
            </div>
        );
    }
}

export default withRouter(Clients);