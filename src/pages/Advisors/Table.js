import React from 'react';
import { Table } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

const AdvisorsTable = (props) => {
    return (
        <div>
            <Table
                data={props.data}
                height={600}
            // onRowClick={data => {
            //     props.onSelect(data);
            // }}
            >
                <Column flexGrow={2}>
                    <HeaderCell>Company Name</HeaderCell>
                    <Cell dataKey="company_name" />
                </Column>

                <Column flexGrow={2}>
                    <HeaderCell>Advisor Name</HeaderCell>
                    <Cell dataKey="advisor_name" />
                </Column>

                <Column flexGrow={2}>
                    <HeaderCell>Website</HeaderCell>
                    <Cell dataKey="website" />
                </Column>

                <Column flexGrow={2}>
                    <HeaderCell>Phone</HeaderCell>
                    <Cell dataKey="advisor_phone" />
                </Column>

                <Column flexGrow={1}>
                    <HeaderCell></HeaderCell>
                    <Cell style={{ textAlign: "center" }}>
                        {rowData => {
                            return (
                                <span className="btn --text" onClick={() => props.onSelect(rowData, 'edit')}>
                                    Edit
                                </span>
                            );
                        }}
                    </Cell>
                </Column>
            </Table>
        </div>
    );
};

export default AdvisorsTable;