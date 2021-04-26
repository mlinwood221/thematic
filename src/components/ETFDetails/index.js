import React from 'react';
import {List} from 'rsuite';
import moment from 'moment';

const ETFDetails = (props) => {
    return (
        <div>
            <List>
                <List.Item>
                    <strong className="mr-10">Expense ratio</strong>
                    <span>
                        {(props.data.expense_ratio === -1) && 'n/a'}
                        {(props.data.expense_ratio !== -1) && `${props.data.expense_ratio}%`}
                    </span>
                </List.Item>
                <List.Item>
                    <strong className="mr-10">Inception date</strong>
                    <span>
                        {!props.data.inception_date && <span>n/a</span>}
                        {moment(props.data.inception_date).format('DD MMM YYYY') === "01 Jan 0001" && <span>n/a</span>}
                        {moment(props.data.inception_date).format('DD MMM YYYY') !== "01 Jan 0001" && <span>{moment(props.data.inception_date).format('DD MMM YYYY')}</span>}
                    </span>
                </List.Item>
                <List.Item>
                    <a style={{cursor:"pointer"}} onClick={ () => {props.onOpenParent(props.data)}}><strong className="mr-10">View parent firm information</strong></a>
                </List.Item>
            </List>
        </div>
    );
};

export default ETFDetails;