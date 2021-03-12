import React from 'react';
import {Modal, Button, Icon} from 'rsuite';

const ConfirmationModal = (props) => {
    return (
        <div>
            <Modal backdrop="static" show={true} onHide={props.onClose} size="xs">
                <Modal.Body>
                    <Icon
                        icon="remind"
                        style={{
                        color: '#ffb300',
                        fontSize: 24
                    }}/> {'  '}
                    {props.text
                        ? props.text
                        : 'Are you sure?'}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onConfirm} appearance="primary">
                        Confirm
                    </Button>
                    <Button onClick={props.onClose} appearance="subtle">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ConfirmationModal;