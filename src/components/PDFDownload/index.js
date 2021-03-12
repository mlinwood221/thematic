import React, { memo, Component } from 'react';
import ReactPDF, { PDFViewer, PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import PDFSuggestions from './../../components/PDFSuggestions';

/*
CURRENTLY NOT USING THIS COMPONENT
*/
const Link = (props) => {
    return (
        <PDFDownloadLink
            style={{ width: "80%", paddingTop: "8px", position: "relative" }}
            className="rs-btn rs-btn-link btn --outline mb-20"
            fileName={`${props.data.clientInfo.name}`}
            document={<PDFSuggestions {...props} />}
        >
            <span style={{
                position: "absolute",
                top: -11,
                right: -11,
                backgroundColor: "#f84aa2",
                borderRadius: "1000px",
                color: "white",
                width: "25px",
                height: "25px",
                paddingTop: "2px"
            }}>1</span>
            Download PDF Report
        </PDFDownloadLink>
    );
};

export const PDFDownload = memo(Link, (prevProps, newProps) => {
    if (prevProps == newProps) {
        return true
    }
    return false
    //compare props and if no change, return true, else false
})