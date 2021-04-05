import React, { Component } from 'react';
import { Row, Col, Button, Icon } from 'rsuite';
import { withRouter } from 'react-router';

import ConfirmationModal from './../../components/ConfirmationModal';
import ClientAPI from './../../api/client';
import AdvisorForm from './AdvisorForm';

class Edit extends Component {
    handleCancel = () => {
        this
            .props
            .history
            .push('/advisors');
    }

    handleSubmit = async (advisor) => {
        if (!advisor.email || !advisor.advisor_name || !advisor.advisor_phone || !advisor.company_name || !advisor.website) {
            alert('Please enter required information (marked with *).')
            return;
        }

        try {
            await ClientAPI.updateAdvisor(
                advisor
            );
            this
                .props
                .history
                .push('/advisors');
        } catch (error) {
            console.log("error", error);
            alert("There has been an error updating the advisor...")
        }
    }

    render() {
        return (
            <AdvisorForm
                onCancel={this.handleCancel}
                onSubmit={this.handleSubmit} 
                mode="edit" 
                id={this.props.match.params.id}/>
        );
    }
}

export default withRouter(Edit);

