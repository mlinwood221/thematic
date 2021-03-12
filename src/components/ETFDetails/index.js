import React from 'react';
import {List} from 'rsuite';
import moment from 'moment';

const ETFDetails = (props) => {
    return (
        <div>
            <List>
                <List.Item>
                    <strong className="mr-10">Firm name</strong>
                    <span>
                        {props.data.parent.firm_name}
                    </span>
                </List.Item>
                <List.Item>
                    <strong className="mr-10">Market</strong>
                    <span>
                        {props.data.parent.market}
                    </span>
                </List.Item>
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
                    <strong className="mr-10">Total net assets</strong>
                    <span>
                        {(props.data.parent.total_net_assets === -1) && 'n/a'}
                        {(props.data.parent.total_net_assets !== -1) && `USD${props.data.parent.total_net_assets}bil`}
                    </span>
                </List.Item>
                <List.Item>
                    <strong className="mr-10">Fund flows</strong>
                    <span>
                        {(props.data.parent.fund_flows === -1) && 'n/a'}
                        {(props.data.parent.fund_flows !== -1) && `USD${props.data.parent.fund_flows}bil`}
                    </span>
                </List.Item>
                <List.Item>
                    <strong className="mr-10">Asset growth rate</strong>
                    <span>
                        {(props.data.parent.asset_growth_rate === -1) && 'n/a'}
                        {(props.data.parent.asset_growth_rate !== -1) && `${props.data.parent.asset_growth_rate}%`}
                    </span>
                </List.Item>
                <List.Item>
                    <strong className="mr-10">Number of funds</strong>
                    <span>
                        {(props.data.parent.number_of_funds === -1) && 'n/a'}
                        {(props.data.parent.number_of_funds !== -1) && props.data.parent.number_of_funds}                        
                    </span>
                </List.Item>
                <List.Item>
                    <strong className="mr-10">Manager Retention Rate</strong>
                    <span>
                        {(props.data.parent.manager_retention_rate === -1) && 'n/a'}
                        {(props.data.parent.manager_retention_rate !== -1) && `${props.data.parent.manager_retention_rate}%`}
                    </span>
                </List.Item>
            </List>
        </div>
    );
};

export default ETFDetails;