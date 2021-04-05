import React, { memo, Component } from 'react';
import ReactPDF, { PDFViewer, PDFDownloadLink, Document, Page, Text, Image, View, StyleSheet } from '@react-pdf/renderer';
import { createGlobalStyle } from "styled-components";
import { getColorByScore } from './../../service/util/score';
import {SECTORS} from './../../service/data/sectors';
const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Notable');
  body {
  }
`

const ACTIVITIES = { 
    // "palm_oil":  "Palm Oil",
    "weapons": "Controversial Weapons",
    // "gambling": "Gambling",
    "nuclear": "Nuclear",
    // "fur_leather": "Fur and Leather",
    // "alcohol": "Alcohol",
    // "gmo": "GMO", 
    "animal_testing": "Animal Testing",
    "tobacco": "Tobacco",
    "coal": "Coal",
    // "pesticides": "Pesticides",
    // "adult": "Adult Entertainment",
    "military_contract": "Military Contract"
}

// const ACTIVITIES = {
//     "predatory_lending": "Predatory Lending",
//     "alcohol": "Alcohol",
//     "tobacco": "Tobacco",
//     "adult_entertainment": "Adult Entertainment",
//     "weapons_involvement": "Weapons Involvement",
//     "gambling": "Gambling",
//     "nuclear_power": "Nuclear Power",
//     "gmo": "GMO"
// }

const IDEAS = {
    "gender_equality": "Gender Equality",
    "low_carbon": "Low Carbon",
    "artificial_intelligence": "Artificial Intelligence",
    "fintech": "Fintech",
    "biotechnology": "Biotechnology",
    "renewable_energy": "Renewable Energy",
    "smart_cities": "Smart Cities",
    "better_health": "Better Health"
}

// const SECTORS = {
//     "energy": "Energy",
//     "materials": "Materials",
//     "industrials": "Industrials",
//     "consumer_discretionary": "Consumer Discretionary",
//     "consumer_staples": "Consumer Staples",
//     "healthcare": "Healthcare",
//     "financials": "Financials",
//     "information_technology": "Information Technology",
//     "telecommunication_services": "Telecommunication Services",
//     "utilities": "Utilities",
//     "real_estate": "Real Estate"
// }

const styles = StyleSheet.create({
    page: {
        padding: 10,
    },
    section1: {
        flexDirection: 'row',
        width: '100%',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e9e9e9',
    },
    s1_left: {
        width: '60%',
        padding: 12,
    },
    s1_right: {
        padding: 12,
        width: '40%',
        backgroundColor: '#fafafa',
    },
    title: {
        color: '#2b2b2b',
        textTransform: 'uppercase',
        fontSize: 17,
    },
    normal_text: {
        color: '#2b2b2b',
        fontSize: 11,
        paddingTop: 3,
    },
    subtitle: {
        borderBottomWidth: 1,
        borderBottomColor: '#2b2b2b',
        borderBottomStyle: 'solid',
        textTransform: 'uppercase',
        fontSize: 12,
        marginTop: 10,
        paddingBottom: 7,
    },
    s1_left_part_inner_title: {
        color: '#2b2b2b',
        fontSize: 10,
        marginTop: 7,
        marginBottom: 3,
        textTransform: "uppercase",
    },
    s1_left_part_images: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    image: {
        width: "20%",
        paddingBottom: 7,
        paddingRight: 7,
    },
    s1_right_title: {
        fontSize: 14,
        color: "#2b2b2b",
    },
    short_underline: {
        width: 15,
        height: 1,
        marginTop: 3,
        marginBottom: 8,
        backgroundColor: '#2b2b2b'
    },
    s1_right_single: {
        borderBottomWidth: 1,
        borderBottomColor: '#515151',
        borderBottomStyle: 'solid',
        flexDirection: 'row',
        marginBottom: 5,
        paddingBottom: 1,
    },
    s1_right_single_l: {
        fontSize: 10,
        color: '#2b2b2b',
        width: '50%',
        textAlign: 'left',
    },
    s1_right_single_r: {
        fontSize: 10,
        color: '#2b2b2b',
        width: '50%',
        textAlign: 'right',
        fontWeight: 'bold'
    },
    s1_right_part_divider: {
        height: 22,
        width: 100,
    },
    section2: {
        marginTop: 5,
        flexDirection: 'column',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#e9e9e9',
    },
    s2_header: {
        backgroundColor: '#fafafa',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 15,
    },
    s2_header_l: {
        paddingRight: 15,
    },
    big_number: {
        fontWeight: 'black',
        fontSize: 24,
        textAlign: 'left',
    },
    big_number_desc: {
        color: "#3cd517",
        fontSize: 8,
        textAlign: 'left'
    },
    header_text: {
        color: "#2b2b2b",
        fontSize: 18,
    },
    s2_box: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: '#e9e9e9',
        paddingLeft: 12,
        paddingTop: 1,
        paddingBottom: 8,
        paddingRight: 8,
    },
    s2_box_header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
    },
    mid_number: {
        fontWeight: 'black',
        fontSize: 16,
    },
    mid_number_text: {
        fontSize: 12,
        paddingLeft: 8,
        color: "#2b2b2b",
    },
    s2_box_small_text: {
        fontSize: 10,
        color: "#2b2b2b",
        paddingTop: 3,
        paddingLeft: 2,
        paddingBottom: 5,
    },
    s2_box_bottom: {
        paddingLeft: 15,
        flexDirection: 'row',
        flexWrap: "wrap"
    },
    s2_box_bottom_single: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingRight: 17,
    },
    s2_box_bottom_last: {
        flexDirection: 'row',
        paddingLeft: 2,
        paddingTop: 3,
    },
    s2_box_bottom_single_last: {
        flexDirection: 'row',
        paddingRight: 17,
    },
    box_last_l: {
        fontSize: 10,
        color: "#2b2b2b",
    },
    box_last_r: {
        fontSize: 10,
        paddingLeft: 3,
        color: "#2b2b2b",
    },
    small_number: {
        fontWeight: 'black',
        fontSize: 11,
    },
    small_number_text: {
        fontSize: 11,
        paddingLeft: 3,
        color: "#2b2b2b",
    },
    s2_footer: {
        flexDirection: 'row',
        padding: 12,
    },
    s2_f_box: {
        width: '28%',
    },
    s2_f_box_divider: {
        width: '8%',
    },
    s2_f_box_title: {
        fontSize: 13,
        paddingBottom: 4,
        marginLeft: -1,
    },
    s2_f_box_single: {
        flexDirection: 'row',
        paddingBottom: 2,
    },
    s2_f_box_single_l: {
        fontSize: 9,
        textAlign: 'left',
        width: '50%',
    },
    s2_f_box_single_r: {
        fontSize: 9,
        textAlign: 'right',
        width: '50%',
    },
    disclaimer: {
        fontSize: 8,
        position: "absolute",
        left: 20,
        bottom: 15
    }
});

{/* <View style={styles.section}>
    <Text>{JSON.stringify(props.data)}</Text>
</View>
    <View style={styles.section}>
        <Text>{JSON.stringify(props.suggestion)}</Text>
    </View> */}

const PDFSuggestions = (props) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.disclaimer}>Information in this document is subject to change. This document is generated on {new Date().toJSON().slice(0, 10).replace(/-/g, '/')} (Year/Month/Day).</Text>
            <View style={styles.section1}>
                <View style={styles.s1_left}>
                    <Text style={styles.normal_text}>Personalized investment idea</Text>
                    <Text style={styles.subtitle}>Key Client Preferences</Text>
                    <View style={styles.s1_left_part}>
                        <Text style={styles.s1_left_part_inner_title}>Activities to avoid</Text>
                        <View style={styles.s1_left_part_images}>
                            {
                                (props.data.keyPreferences.activitiesToAvoid && props.data.keyPreferences.activitiesToAvoid.length > 0) ?
                                    props.data.keyPreferences.activitiesToAvoid.map((a, k) => <Image
                                        key={k}
                                        src={`/img/act/${a}.png`}
                                        style={styles.image}
                                    />)
                                    : <Text style={styles.small_number_text}>No activities to avoid.</Text>
                            }
                        </View>
                    </View>{/* END LEFT PART INNER SECTION 1 */}

                    <View style={styles.s1_left_part}>
                        <Text style={styles.s1_left_part_inner_title}>Ideas and causes to support</Text>
                        <View style={styles.s1_left_part_images}>
                            {
                                (props.data.keyPreferences.ideasToSupport && props.data.keyPreferences.ideasToSupport.length > 0) ?
                                    props.data.keyPreferences.ideasToSupport.map((i, k) => <Image
                                        key={k}
                                        src={`/img/ideas/${i}.png`}
                                        style={styles.image}
                                    />)
                                    : <Text style={styles.small_number_text}>No ideas and causes to support.</Text>
                            }
                        </View>
                    </View>{/* END LEFT PART INNER SECTION 1 */}

                </View>{/* END LEFT PART SECTION 1 */}
                <View style={styles.s1_right}>
                    <View style={styles.s1_right_part}>
                        <Text style={styles.s1_right_title}>Client Info</Text>
                        <View style={styles.short_underline}></View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Name and surname:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.clientInfo.name}</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Address:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.clientInfo.address}</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Birth date:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.clientInfo.dob}</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Retirement year:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.clientInfo.retirement}</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Budget:</Text>
                            <Text style={styles.s1_right_single_r}>${props.data.clientInfo.budget}</Text>
                        </View>
                        <View style={styles.s1_right_part_divider}></View>
                    </View>{/* END RIGHT PART INNER SECTION 1 */}
                    <View style={styles.s1_right_part}>
                        <Text style={styles.s1_right_title}>Portfolio Info</Text>
                        <View style={styles.short_underline}></View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Suggestion types:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.portfolioInfo.suggestionTypes.map((a, k) => a.toUpperCase())}</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Asset classes:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.portfolioInfo.assetClasses.map((a, k) => a)}</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Risk:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.portfolioInfo.risk}</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Sector restrictions:</Text>
                            <Text style={styles.s1_right_single_r}>{
                                props.data.portfolioInfo.sectorRestrictions ?
                                    props.data.portfolioInfo.sectorRestrictions.map((a, k) => a[0].toUpperCase() + a.substring(1).replaceAll("_", " ") + (props.data.portfolioInfo.sectorRestrictions.length === k + 1 ? "" : ", "))
                                    : "/"
                            }</Text>
                        </View>
                        <View style={styles.s1_right_single}>
                            <Text style={styles.s1_right_single_l}>Security restrictions:</Text>
                            <Text style={styles.s1_right_single_r}>{props.data.portfolioInfo.securityRestrictions.map((a, k) => a + (props.data.portfolioInfo.securityRestrictions.length === k + 1 ? "" : ", "))}</Text>
                        </View>

                    </View>{/* END RIGHT PART INNER SECTION 1 */}
                </View>{/* END RIGHT PART SECTION 1 */}
            </View>{/* END SECTION 1 */}

            <View style={styles.section2}>
                <View style={styles.s2_header}>
                    <View style={styles.s2_header_l}>
                        <Text style={{ ...styles.big_number, ...{ color: getColorByScore(props.data.suggestions[0].score) } }}>{props.data.suggestions[0].score.toFixed(2)}</Text>
                        <Text style={styles.big_number_desc}>Match score</Text>
                    </View>
                    <Text style={styles.header_text}>{props.data.suggestions[0].name} ({props.data.suggestions[0].ticker})</Text>
                </View>{/* END HEADER SECTION 2 */}

                <View style={styles.s2_box}>
                    <View style={styles.s2_box_header}>
                        <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[0].score_breakdown.activity_involvement_score) } }}>{props.data.suggestions[0].score_breakdown.activity_involvement_score.toFixed(2)}</Text>
                        <Text style={styles.mid_number_text}>Activities to avoid score</Text>
                    </View>
                    <Text style={styles.s2_box_small_text}>Involvements in restricted activities:</Text>
                    <View style={styles.s2_box_bottom}>
                        {
                            props.data.suggestions[0].score_breakdown.restricted_activity_involvements ?
                                props.data.suggestions[0].score_breakdown.restricted_activity_involvements.map((a, k) =>
                                    <View key={k} style={styles.s2_box_bottom_single}>
                                        <Text style={{ ...styles.small_number, ...{ color: getColorByScore(a.involvement, true) } }}>{a.involvement.toFixed(2)}%</Text>
                                        <Text style={styles.small_number_text}>{ACTIVITIES[a.negative_activity]}</Text>
                                    </View>)
                                : <Text style={styles.small_number_text}>No restricted activity involvements.</Text>
                        }
                    </View>{/* END BOX BOTTOM */}
                </View>{/*END SECTION 2 SINGLE BOX */}

                <View style={styles.s2_box}>
                    <View style={styles.s2_box_header}>
                        <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[0].score_breakdown.idea_involvement_score) } }}>{props.data.suggestions[0].score_breakdown.idea_involvement_score.toFixed(2)}</Text>
                        <Text style={styles.mid_number_text}>Ideas and Causes to Support Score</Text>
                    </View>
                    <Text style={styles.s2_box_small_text}>Involvements in relevant ideas and causes:</Text>
                    <View style={styles.s2_box_bottom}>
                        {
                            props.data.suggestions[0].score_breakdown.relevant_idea_involvements ?
                                props.data.suggestions[0].score_breakdown.relevant_idea_involvements.map((i, k) =>
                                    <View key={k} style={styles.s2_box_bottom_single}>
                                        <Text style={{ ...styles.small_number, ...{ color: getColorByScore(i.involvement) } }}>{i.involvement.toFixed(2)}%</Text>
                                        <Text style={styles.small_number_text}>{IDEAS[i.idea]}</Text>
                                    </View>
                                    // {/* END BOX BOTTOM SINGLE */ }
                                )
                                : <Text style={styles.small_number_text}>No relevant idea involvements.</Text>
                        }
                    </View>{/* END BOX BOTTOM */}
                </View>{/*END SECTION 2 SINGLE BOX */}

                {/* <View style={styles.s2_box}>
                    <View style={styles.s2_box_header}>
                        <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestion.score_breakdown.sector_involvement_score) } }}>{props.data.suggestion.score_breakdown.sector_involvement_score.toFixed(2)}</Text>
                        <Text style={styles.mid_number_text}>Restricted Sectors Score</Text>
                    </View>
                    {
                        (props.data.suggestion.score_breakdown.restricted_sector_involvements && props.data.suggestion.score_breakdown.restricted_sector_involvements.length) > 0 ?
                            <View>
                                <Text style={styles.s2_box_small_text}>Restricted sector involvements:</Text>
                                <View style={styles.s2_box_bottom}>
                                    {
                                        props.data.suggestion.score_breakdown.restricted_sector_involvements.map((s, k) =>
                                            <View key={k} style={styles.s2_box_bottom_single}>
                                                <Text style={{ ...styles.small_number, ...{ color: getColorByScore(s.involvement) } }}>{s.involvement.toFixed(2)}%</Text>
                                                <Text style={styles.small_number_text}>{SECTORS[s.sector]}</Text>
                                            </View>
                                        )
                                    }
                                </View>
                            </View>
                            : <Text style={styles.s2_box_small_text}>There is no involvement in restricted sectors</Text>

                    }
                </View> */}

                <View style={styles.s2_box}>
                    <View style={styles.s2_box_header}>
                        <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[0].score_breakdown.risk_score) } }}>{props.data.suggestions[0].score_breakdown.risk_score.toFixed(2)}</Text>
                        <Text style={styles.mid_number_text}>Risk Matching Score</Text>
                    </View>
                    <View style={styles.s2_box_bottom_last}>
                        <View style={styles.s2_box_bottom_single_last}>
                            <Text style={styles.box_last_l}>Sharpe Ratio:</Text>
                            <Text style={styles.box_last_r}>{props.data.suggestions[0].risk_metrics.sharpe_ratio}</Text>
                        </View>{/* END BOX BOTTOM SINGLE */}
                        <View style={styles.s2_box_bottom_single_last}>
                            <Text style={styles.box_last_l}>Sortino Ratio:</Text>
                            <Text style={styles.box_last_r}>{props.data.suggestions[0].risk_metrics.sortino_ratio}</Text>
                        </View>{/* END BOX BOTTOM SINGLE */}
                        <View style={styles.s2_box_bottom_single_last}>
                            <Text style={styles.box_last_l}>Beta:</Text>
                            <Text style={styles.box_last_r}>{props.data.suggestions[0].risk_metrics.beta.toFixed(3)}</Text>
                        </View>{/* END BOX BOTTOM SINGLE */}
                        <View style={styles.s2_box_bottom_single_last}>
                            <Text style={styles.box_last_l}>Morningstar Risk Level:</Text>
                            <Text style={styles.box_last_r}>{props.data.suggestions[0].risk_metrics.morningstar_risk_level}/5</Text>
                        </View>{/* END BOX BOTTOM SINGLE */}
                    </View>{/* END BOX BOTTOM */}
                </View>{/*END SECTION 2 SINGLE BOX */}

                <View style={styles.s2_footer}>
                    <View style={styles.s2_f_box}>
                        <Text style={styles.s2_f_box_title}>Performance</Text>
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>6 Months: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].performance_stats.month6ChangePercent ? props.data.suggestions[0].performance_stats.month6ChangePercent : "N/A"}%</Text>
                        </View>
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>YTD: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].performance_stats.ytdChangePercent ? props.data.suggestions[0].performance_stats.ytdChangePercent : "N/A"}%</Text>
                        </View>
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>1 Year: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].performance_stats.year1ChangePercent ? props.data.suggestions[0].performance_stats.year1ChangePercent : "N/A"}% </Text>
                        </View>
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>2 Years: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].performance_stats.year2ChangePercent ? props.data.suggestions[0].performance_stats.year2ChangePercent : "N/A"}% </Text>
                        </View>
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>5 Years: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].performance_stats.year5ChangePercent ? props.data.suggestions[0].performance_stats.year5ChangePercent : "N/A"}% </Text>
                        </View>
                    </View>
                    <View style={styles.s2_f_box_divider}></View>
                    <View style={styles.s2_f_box}>
                        <Text style={styles.s2_f_box_title}>Top Holdings</Text>
                        {
                            props.data.suggestions[0].top_holdings.map((h, k) =>
                                <View key={k} style={styles.s2_f_box_single}>
                                    <Text style={styles.s2_f_box_single_l}>{h.symbol}: </Text>
                                    <Text style={styles.s2_f_box_single_r}>{h.weight.slice(0, 4)}% </Text>
                                </View>
                            )
                        }
                    </View>{/* END FOOTER BOX SECTION 2 */}
                    <View style={styles.s2_f_box_divider}></View>
                    <View style={styles.s2_f_box}>
                        <Text style={styles.s2_f_box_title}>Other Info</Text>
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>Expense Ratio: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].expense_ratio === -1 ? "N/A" : (props.data.suggestions[0].expense_ratio + "%")} </Text>
                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>Inception Date: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].inception_date} </Text>
                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>Dividend Yield: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].dividend_yield <= -1 ? "N/A" : props.data.suggestions[0].dividend_yield.toFixed(3) + "%"} </Text>
                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>Parent Firm Name: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].parent.firm_name} </Text>
                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                        <View style={styles.s2_f_box_single}>
                            <Text style={styles.s2_f_box_single_l}>Parent Firm Total Net Assets: </Text>
                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[0].parent.total_net_assets === -1 ? "N/A" : "$" + props.data.suggestions[0].parent.total_net_assets + " bil."} </Text>
                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                    </View>{/* END FOOTER BOX SECTION 2 */}
                </View>{/*END SECTION 2 FOOTER */}
            </View>{/* END SECTION 2 */}
        </Page>
        {
            props.data.suggestions.length > 1 &&

            props.data.suggestions.map((a, k) => {
                // Skip first
                if (k != 0) {
                    if (k % 2 != 0) {
                        return <Page key={k} size="A4" style={styles.page}>
                            <Text style={styles.disclaimer}>Information in this document is subject to change. This document is generated on {new Date().toJSON().slice(0, 10).replace(/-/g, '/')} (Year/Month/Day).</Text>
                            <View style={styles.section2}>
                                <View style={styles.s2_header}>
                                    <View style={styles.s2_header_l}>
                                        <Text style={{ ...styles.big_number, ...{ color: getColorByScore(props.data.suggestions[k].score) } }}>{props.data.suggestions[k].score.toFixed(2)}</Text>
                                        <Text style={styles.big_number_desc}>Match score</Text>
                                    </View>
                                    <Text style={styles.header_text}>{props.data.suggestions[k].name} ({props.data.suggestions[k].ticker})</Text>
                                </View>{/* END HEADER SECTION 2 */}

                                <View style={styles.s2_box}>
                                    <View style={styles.s2_box_header}>
                                        <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[k].score_breakdown.activity_involvement_score) } }}>{props.data.suggestions[k].score_breakdown.activity_involvement_score.toFixed(2)}</Text>
                                        <Text style={styles.mid_number_text}>Activities to avoid score</Text>
                                    </View>
                                    <Text style={styles.s2_box_small_text}>Involvements in restricted activities:</Text>
                                    <View style={styles.s2_box_bottom}>
                                        {
                                            props.data.suggestions[k].score_breakdown.restricted_activity_involvements ?
                                                props.data.suggestions[k].score_breakdown.restricted_activity_involvements.map((a, k) =>
                                                    <View key={k} style={styles.s2_box_bottom_single}>
                                                        <Text style={{ ...styles.small_number, ...{ color: getColorByScore(a.involvement, true) } }}>{a.involvement.toFixed(2)}%</Text>
                                                        <Text style={styles.small_number_text}>{ACTIVITIES[a.negative_activity]}</Text>
                                                    </View>)
                                                : <Text style={styles.small_number_text}>No restricted activity involvements.</Text>
                                        }
                                    </View>{/* END BOX BOTTOM */}
                                </View>{/*END SECTION 2 SINGLE BOX */}

                                <View style={styles.s2_box}>
                                    <View style={styles.s2_box_header}>
                                        <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[k].score_breakdown.idea_involvement_score) } }}>{props.data.suggestions[k].score_breakdown.idea_involvement_score.toFixed(2)}</Text>
                                        <Text style={styles.mid_number_text}>Ideas and Causes to Support Score</Text>
                                    </View>
                                    <Text style={styles.s2_box_small_text}>Involvements in relevant ideas and causes:</Text>
                                    <View style={styles.s2_box_bottom}>
                                        {
                                            props.data.suggestions[k].score_breakdown.relevant_idea_involvements ?
                                                props.data.suggestions[k].score_breakdown.relevant_idea_involvements.map((i, k) =>
                                                    <View key={k} style={styles.s2_box_bottom_single}>
                                                        <Text style={{ ...styles.small_number, ...{ color: getColorByScore(i.involvement) } }}>{i.involvement.toFixed(2)}%</Text>
                                                        <Text style={styles.small_number_text}>{IDEAS[i.idea]}</Text>
                                                    </View>
                                                    // {/* END BOX BOTTOM SINGLE */ }
                                                )
                                                : <Text style={styles.small_number_text}>No relevant idea involvements.</Text>
                                        }
                                    </View>{/* END BOX BOTTOM */}
                                </View>{/*END SECTION 2 SINGLE BOX */}

                                <View style={styles.s2_box}>
                                    <View style={styles.s2_box_header}>
                                        <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[k].score_breakdown.risk_score) } }}>{props.data.suggestions[k].score_breakdown.risk_score.toFixed(2)}</Text>
                                        <Text style={styles.mid_number_text}>Risk Matching Score</Text>
                                    </View>
                                    <View style={styles.s2_box_bottom_last}>
                                        <View style={styles.s2_box_bottom_single_last}>
                                            <Text style={styles.box_last_l}>Sharpe Ratio:</Text>
                                            <Text style={styles.box_last_r}>{props.data.suggestions[k].risk_metrics.sharpe_ratio}</Text>
                                        </View>{/* END BOX BOTTOM SINGLE */}
                                        <View style={styles.s2_box_bottom_single_last}>
                                            <Text style={styles.box_last_l}>Sortino Ratio:</Text>
                                            <Text style={styles.box_last_r}>{props.data.suggestions[k].risk_metrics.sortino_ratio}</Text>
                                        </View>{/* END BOX BOTTOM SINGLE */}
                                        <View style={styles.s2_box_bottom_single_last}>
                                            <Text style={styles.box_last_l}>Beta:</Text>
                                            <Text style={styles.box_last_r}>{props.data.suggestions[k].risk_metrics.beta.toFixed(3)}</Text>
                                        </View>{/* END BOX BOTTOM SINGLE */}
                                        <View style={styles.s2_box_bottom_single_last}>
                                            <Text style={styles.box_last_l}>Morningstar Risk Level:</Text>
                                            <Text style={styles.box_last_r}>{props.data.suggestions[k].risk_metrics.morningstar_risk_level}/5</Text>
                                        </View>{/* END BOX BOTTOM SINGLE */}
                                    </View>{/* END BOX BOTTOM */}
                                </View>{/*END SECTION 2 SINGLE BOX */}

                                <View style={styles.s2_footer}>
                                    <View style={styles.s2_f_box}>
                                        <Text style={styles.s2_f_box_title}>Performance</Text>
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>6 Months: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].performance_stats.month6ChangePercent ? props.data.suggestions[k].performance_stats.month6ChangePercent : "N/A"}%</Text>
                                        </View>
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>YTD: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].performance_stats.ytdChangePercent ? props.data.suggestions[k].performance_stats.ytdChangePercent : "N/A"}%</Text>
                                        </View>
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>1 Year: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].performance_stats.year1ChangePercent ? props.data.suggestions[k].performance_stats.year1ChangePercent : "N/A"}% </Text>
                                        </View>
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>2 Years: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].performance_stats.year2ChangePercent ? props.data.suggestions[k].performance_stats.year2ChangePercent : "N/A"}% </Text>
                                        </View>
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>5 Years: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].performance_stats.year5ChangePercent ? props.data.suggestions[k].performance_stats.year5ChangePercent : "N/A"}% </Text>
                                        </View>
                                    </View>
                                    <View style={styles.s2_f_box_divider}></View>
                                    <View style={styles.s2_f_box}>
                                        <Text style={styles.s2_f_box_title}>Top Holdings</Text>
                                        {
                                            props.data.suggestions[k].top_holdings.map((h, k) =>
                                                <View key={k} style={styles.s2_f_box_single}>
                                                    <Text style={styles.s2_f_box_single_l}>{h.symbol}: </Text>
                                                    <Text style={styles.s2_f_box_single_r}>{h.weight.slice(0, 4)}% </Text>
                                                </View>
                                            )
                                        }
                                    </View>{/* END FOOTER BOX SECTION 2 */}
                                    <View style={styles.s2_f_box_divider}></View>
                                    <View style={styles.s2_f_box}>
                                        <Text style={styles.s2_f_box_title}>Other Info</Text>
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>Expense Ratio: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].expense_ratio === -1 ? "N/A" : (props.data.suggestions[k].expense_ratio + "%")} </Text>
                                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>Inception Date: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].inception_date} </Text>
                                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>Dividend Yield: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].dividend_yield <= -1 ? "N/A" : props.data.suggestions[k].dividend_yield.toFixed(3) + "%"} </Text>
                                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>Parent Firm Name: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].parent.firm_name} </Text>
                                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                        <View style={styles.s2_f_box_single}>
                                            <Text style={styles.s2_f_box_single_l}>Parent Firm Total Net Assets: </Text>
                                            <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k].parent.total_net_assets === -1 ? "N/A" : "$" + props.data.suggestions[k].parent.total_net_assets + " bil."} </Text>
                                        </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                    </View>{/* END FOOTER BOX SECTION 2 */}
                                </View>{/*END SECTION 2 FOOTER */}
                            </View>
                            {
                                props.data.suggestions[k + 1] &&
                                <View style={styles.section2}>
                                    <View style={styles.s2_header}>
                                        <View style={styles.s2_header_l}>
                                            <Text style={{ ...styles.big_number, ...{ color: getColorByScore(props.data.suggestions[k + 1].score) } }}>{props.data.suggestions[k + 1].score.toFixed(2)}</Text>
                                            <Text style={styles.big_number_desc}>Match score</Text>
                                        </View>
                                        <Text style={styles.header_text}>{props.data.suggestions[k + 1].name} ({props.data.suggestions[k + 1].ticker})</Text>
                                    </View>{/* END HEADER SECTION 2 */}

                                    <View style={styles.s2_box}>
                                        <View style={styles.s2_box_header}>
                                            <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[k + 1].score_breakdown.activity_involvement_score) } }}>{props.data.suggestions[k + 1].score_breakdown.activity_involvement_score.toFixed(2)}</Text>
                                            <Text style={styles.mid_number_text}>Activities to avoid score</Text>
                                        </View>
                                        <Text style={styles.s2_box_small_text}>Involvements in restricted activities:</Text>
                                        <View style={styles.s2_box_bottom}>
                                            {
                                                props.data.suggestions[k + 1].score_breakdown.restricted_activity_involvements ?
                                                    props.data.suggestions[k + 1].score_breakdown.restricted_activity_involvements.map((a, k) =>
                                                        <View key={k} style={styles.s2_box_bottom_single}>
                                                            <Text style={{ ...styles.small_number, ...{ color: getColorByScore(a.involvement, true) } }}>{a.involvement.toFixed(2)}%</Text>
                                                            <Text style={styles.small_number_text}>{ACTIVITIES[a.negative_activity]}</Text>
                                                        </View>)
                                                    : <Text style={styles.small_number_text}>No restricted activity involvements.</Text>
                                            }
                                        </View>{/* END BOX BOTTOM */}
                                    </View>{/*END SECTION 2 SINGLE BOX */}

                                    <View style={styles.s2_box}>
                                        <View style={styles.s2_box_header}>
                                            <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[k + 1].score_breakdown.idea_involvement_score) } }}>{props.data.suggestions[k + 1].score_breakdown.idea_involvement_score.toFixed(2)}</Text>
                                            <Text style={styles.mid_number_text}>Ideas and Causes to Support Score</Text>
                                        </View>
                                        <Text style={styles.s2_box_small_text}>Involvements in relevant ideas and causes:</Text>
                                        <View style={styles.s2_box_bottom}>
                                            {
                                                props.data.suggestions[k + 1].score_breakdown.relevant_idea_involvements ?
                                                    props.data.suggestions[k + 1].score_breakdown.relevant_idea_involvements.map((i, k) =>
                                                        <View key={k} style={styles.s2_box_bottom_single}>
                                                            <Text style={{ ...styles.small_number, ...{ color: getColorByScore(i.involvement) } }}>{i.involvement.toFixed(2)}%</Text>
                                                            <Text style={styles.small_number_text}>{IDEAS[i.idea]}</Text>
                                                        </View>
                                                        // {/* END BOX BOTTOM SINGLE */ }
                                                    )
                                                    : <Text style={styles.small_number_text}>No relevant idea involvements.</Text>
                                            }
                                        </View>{/* END BOX BOTTOM */}
                                    </View>{/*END SECTION 2 SINGLE BOX */}

                                    <View style={styles.s2_box}>
                                        <View style={styles.s2_box_header}>
                                            <Text style={{ ...styles.mid_number, ...{ color: getColorByScore(props.data.suggestions[k + 1].score_breakdown.risk_score) } }}>{props.data.suggestions[k + 1].score_breakdown.risk_score.toFixed(2)}</Text>
                                            <Text style={styles.mid_number_text}>Risk Matching Score</Text>
                                        </View>
                                        <View style={styles.s2_box_bottom_last}>
                                            <View style={styles.s2_box_bottom_single_last}>
                                                <Text style={styles.box_last_l}>Sharpe Ratio:</Text>
                                                <Text style={styles.box_last_r}>{props.data.suggestions[k + 1].risk_metrics.sharpe_ratio}</Text>
                                            </View>{/* END BOX BOTTOM SINGLE */}
                                            <View style={styles.s2_box_bottom_single_last}>
                                                <Text style={styles.box_last_l}>Sortino Ratio:</Text>
                                                <Text style={styles.box_last_r}>{props.data.suggestions[k + 1].risk_metrics.sortino_ratio}</Text>
                                            </View>{/* END BOX BOTTOM SINGLE */}
                                            <View style={styles.s2_box_bottom_single_last}>
                                                <Text style={styles.box_last_l}>Beta:</Text>
                                                <Text style={styles.box_last_r}>{props.data.suggestions[k + 1].risk_metrics.beta.toFixed(3)}</Text>
                                            </View>{/* END BOX BOTTOM SINGLE */}
                                            <View style={styles.s2_box_bottom_single_last}>
                                                <Text style={styles.box_last_l}>Morningstar Risk Level:</Text>
                                                <Text style={styles.box_last_r}>{props.data.suggestions[k + 1].risk_metrics.morningstar_risk_level}/5</Text>
                                            </View>{/* END BOX BOTTOM SINGLE */}
                                        </View>{/* END BOX BOTTOM */}
                                    </View>{/*END SECTION 2 SINGLE BOX */}

                                    <View style={styles.s2_footer}>
                                        <View style={styles.s2_f_box}>
                                            <Text style={styles.s2_f_box_title}>Performance</Text>
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>6 Months: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].performance_stats.month6ChangePercent ? props.data.suggestions[k + 1].performance_stats.month6ChangePercent : "N/A"}%</Text>
                                            </View>
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>YTD: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].performance_stats.ytdChangePercent ? props.data.suggestions[k + 1].performance_stats.ytdChangePercent : "N/A"}%</Text>
                                            </View>
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>1 Year: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].performance_stats.year1ChangePercent ? props.data.suggestions[k + 1].performance_stats.year1ChangePercent : "N/A"}% </Text>
                                            </View>
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>2 Years: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].performance_stats.year2ChangePercent ? props.data.suggestions[k + 1].performance_stats.year2ChangePercent : "N/A"}% </Text>
                                            </View>
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>5 Years: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].performance_stats.year5ChangePercent ? props.data.suggestions[k + 1].performance_stats.year5ChangePercent : "N/A"}% </Text>
                                            </View>
                                        </View>
                                        <View style={styles.s2_f_box_divider}></View>
                                        <View style={styles.s2_f_box}>
                                            <Text style={styles.s2_f_box_title}>Top Holdings</Text>
                                            {
                                                props.data.suggestions[k + 1].top_holdings.map((h, k) =>
                                                    <View key={k} style={styles.s2_f_box_single}>
                                                        <Text style={styles.s2_f_box_single_l}>{h.symbol}: </Text>
                                                        <Text style={styles.s2_f_box_single_r}>{h.weight.slice(0, 4)}% </Text>
                                                    </View>
                                                )
                                            }
                                        </View>{/* END FOOTER BOX SECTION 2 */}
                                        <View style={styles.s2_f_box_divider}></View>
                                        <View style={styles.s2_f_box}>
                                            <Text style={styles.s2_f_box_title}>Other Info</Text>
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>Expense Ratio: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].expense_ratio === -1 ? "N/A" : (props.data.suggestions[k + 1].expense_ratio + "%")} </Text>
                                            </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>Inception Date: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].inception_date} </Text>
                                            </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>Dividend Yield: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].dividend_yield <= -1 ? "N/A" : props.data.suggestions[k + 1].dividend_yield.toFixed(3) + "%"} </Text>
                                            </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>Parent Firm Name: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].parent.firm_name} </Text>
                                            </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                            <View style={styles.s2_f_box_single}>
                                                <Text style={styles.s2_f_box_single_l}>Parent Firm Total Net Assets: </Text>
                                                <Text style={styles.s2_f_box_single_r}>{props.data.suggestions[k + 1].parent.total_net_assets === -1 ? "N/A" : "$" + props.data.suggestions[k + 1].parent.total_net_assets + " bil."} </Text>
                                            </View>{/* END SINGLE FOOTER BOX SECTION 2 */}
                                        </View>{/* END FOOTER BOX SECTION 2 */}
                                    </View>{/*END SECTION 2 FOOTER */}
                                </View>
                            }
                        </Page>
                    }
                }
            })
        }
    </Document>
);

export default PDFSuggestions;