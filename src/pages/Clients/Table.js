import React from 'react';
import { Table } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

const ClientsTable = (props) => {
    return (
        <div>
            <Table
                data={props.data}
                height={600}
            // onRowClick={data => {
            //     props.onSelect(data);
            // }}
            >
                <Column width={100} align="center">
                    <HeaderCell>Type</HeaderCell>
                    <Cell>
                        {(rowData) => {
                            return <strong
                                style={rowData.type === 0 ? { color: "#f84aa2" } : { color: "#6565da" }}
                            >{rowData.type === 0 ? "LEAD" : "CLIENT"}</strong>;
                        }}
                    </Cell>
                </Column>

                <Column flexGrow={2}>
                    <HeaderCell>First Name</HeaderCell>
                    <Cell dataKey="first_name" />
                </Column>

                <Column flexGrow={2}>
                    <HeaderCell>Last Name</HeaderCell>
                    <Cell dataKey="last_name" />
                </Column>

                <Column flexGrow={2}>
                    <HeaderCell>Created Date</HeaderCell>
                    <Cell>
                        {(rowData) => {
                            return new Date(rowData.created_on).toLocaleDateString();
                        }}
                    </Cell>
                </Column>

                <Column flexGrow={2}>
                    <HeaderCell>Latest Update</HeaderCell>
                    <Cell>
                        {(rowData) => {
                            return new Date(rowData.updated_on).toLocaleDateString();
                        }}
                    </Cell>
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

                <Column flexGrow={1}>
                    <HeaderCell></HeaderCell>
                    <Cell style={{ textAlign: "center" }}>
                        {rowData => {
                            return (
                                <span className="btn --text" onClick={() => props.onSelect(rowData)}>
                                    View
                                </span>
                            );
                        }}
                    </Cell>
                </Column>
            </Table>
        </div>
    );
};

export default ClientsTable;