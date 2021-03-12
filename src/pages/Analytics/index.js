import React, { Component, useEffect } from 'react';
import { Row, Col, Placeholder } from 'rsuite';
import ReactPDF, { PDFViewer, PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useLocation } from "react-router-dom";


const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#ffffff'
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        '@media max-width: 400': {
            flexDirection: 'column',
        },
    },
    header: {
        backgroundColor: "#F4F4F4",
        color: "#004352",
        margin: 10,
        padding: 10,
        alignItems: 'stretch',
        flexGrow: 1
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    underline: {
        borderBottomWidth: 1,
        borderBottomColor: '#004352',
        borderBottomStyle: 'solid',
    }
});


const MyDocument = () => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text>Some name</Text>
                    <Text style={styles.underline}>Key Features:</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text>Section #1</Text>
            </View>
            <View style={styles.section}>
                <Text>Section #2</Text>
            </View>
        </Page>
    </Document>
);

const Analytics = (props) => {
    const location = useLocation();

    useEffect(() => {
        console.log(location.pathname); // result: '/secondpage'
        console.log(location.search); // result: '?query=abc'
        console.log(location.state.pdfData); // result: 'some_value'
    });

    return (
        <div>
            <Row>
                <Col xs={20} xsOffset={2} md={16} mdOffset={4}>
                    <h1 className="page-title">Analytics</h1>

                    <div className="card mt-25">
                        <PDFViewer style={{ width: "100%", height: "1200px" }}>
                            <Document>
                                <Page size="A4" style={styles.page}>
                                    <View style={styles.container}>
                                        <View style={styles.header}>
                                            <Text>Some name</Text>
                                            <Text style={styles.underline}>Key Features:</Text>
                                        </View>
                                    </View>
                                    <View style={styles.section}>
                                        <Text>{JSON.stringify(location.state.pdfData)}</Text>
                                    </View>
                                    <View style={styles.section}>
                                        <Text>{JSON.stringify(location.state.suggestion)}</Text>
                                    </View>
                                </Page>
                            </Document>
                        </PDFViewer>
                        {/* <Placeholder.Paragraph
                            rows={5}
                            active /> */}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Analytics;