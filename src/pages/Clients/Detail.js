import React, { Component } from "react";
import { withRouter } from "react-router";
import {
  Button,
  Icon,
  Row,
  Col,
  Whisper,
  Tooltip,
  Progress,
  Drawer,
  Modal,
} from "rsuite";
import moment from "moment";
import ReactPDF, {
  PDFViewer,
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import PerformanceChart from "./../../components/PerformanceChart";
import PortfolioIntelligence from "./../../components/PortfolioIntelligence";
import MatchSuggestion from "./../../components/MatchSuggestion";
import ScoreBreakdown from "./../../components/ScoreBreakdown";
import ETFDetails from "./../../components/ETFDetails";
import HoldingsTable from "./../../components/HoldingsTable";
import { PDFDownload } from "./../../components/PDFDownload";
import ClientAPI from "./../../api/client";
import { getColorByScore } from "./../../service/util/score";
import PDFSuggestions from "./../../components/PDFSuggestions";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import FinanceAPI from "./../../api/financial";

class Detail extends Component {
  state = {
    client: {},
    pdfData: {},
    isLoadingClient: false,
    isLoadingStats: false,
    generatingPDF: false,
    currentStats: {},
    suggestions: {},
    isLoadingSuggestions: false,
    selectedSuggestionIndex: 0,
    areMoreSuggestionsVisible: false,
    isScoreBreakdownVisible: false,
    areHoldingsVisible: false,
    isAnalysisVisible: false,
    areDetailsVisible: false,
    isSuggestionCardVisible: false,
    mode: "client",
  };

  componentDidMount() {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (this.props.match.params.id === "analyse") {
      this.setState({ mode: "analyse" }, () => {
        let params = JSON.parse(localStorage.getItem("analyse"));
        params.id = 1;

        let currAdv = JSON.parse(localStorage.getItem("t__demo-user"));

        if (currAdv.auth_key === "c4ca4238a0b923820dcc509a6f75849b") {
          params.id = 17;
        }

        if (!params) {
          this.props.history.push("/analyse");
        }
        this.getSuggestion(params);
      });
    } else {
      this.getClient(this.props.match.params.id);
    }
  }

  getClient = async (id) => {
    try {
      this.setState({ isLoadingClient: true });
      let res = await ClientAPI.details({ id: parseInt(id) });
      this.setState(
        {
          client: res.data.client,
        },
        () => {
          this.getSuggestion(res.data.client);
        }
      );
    } catch (error) {
      console.log("error");
      alert("There has been an error...");
    } finally {
      this.setState({ isLoadingClient: false });
      return;
    }
  };

  getSuggestion = async (client) => {
    const suggestionRequest = {
      id: client.id,
      suggestion_types: ["etf"],
      ideas_to_support: client.default_portfolio_params.ideas_to_support,
      index_types: client.default_portfolio_params.index_types,
      sector_restrictions: client.default_portfolio_params.sector_restrictions,
      etf_pool: client.default_portfolio_params.etf_pool,
      security_restrictions:
        client.default_portfolio_params.security_restrictions,
      budget: client.budget,
      risk_level: client.default_portfolio_params.risk_level,
    };

    if (client.activities_to_avoid) {
      suggestionRequest.activities_to_avoid = client.activities_to_avoid;
    }

    try {
      this.setState({ isLoadingSuggestions: true });
      let res = await ClientAPI.fetchSuggestion(suggestionRequest);
      this.setState({ suggestions: res.data });
    } catch (error) {
      console.log("error");
      // alert("There has been an error...")
      this.setState({
        suggestions: {
          etf_suggestions: backup_data,
        },
      });
    } finally {
      this.setState({ isLoadingSuggestions: false });
      return;
    }
  };

  handleEdit = () => {
    this.props.history.push("/clients/edit/" + this.state.client.id);
  };

  handleMoreSuggestions = () => {
    this.setState({
      isSuggestionCardVisible: !this.state.isSuggestionCardVisible,
    });
  };

  handleExportForAnalysis = async (currentSuggestion) => {
    if (this.state.currentStats.ticker !== currentSuggestion.etf.ticker) {
      let stats = await this.getStockStats(currentSuggestion.etf.ticker);
      this.setState({ currentStats: stats });
    }

    this.setState({ isAnalysisVisible: true });
  };

  handleHideExportForAnalysis = () => {
    this.setState({ isAnalysisVisible: false });
  };

  handleShowMoreSuggestions = () => {
    this.setState({ areMoreSuggestionsVisible: true });
  };

  handleHideMoreSuggestions = () => {
    this.setState({ areMoreSuggestionsVisible: false });
  };

  getStockStats = async (ticker) => {
    this.setState({ isLoadingStats: true });
    let stats = {};

    try {
      let res = await FinanceAPI.fetchStatsIEX({ symbol: ticker });
      stats = {
        ticker: ticker,
        year5ChangePercent: (res.data.year5ChangePercent * 100).toFixed(2),
        year2ChangePercent: (res.data.year2ChangePercent * 100).toFixed(2),
        year1ChangePercent: (res.data.year1ChangePercent * 100).toFixed(2),
        ytdChangePercent: (res.data.ytdChangePercent * 100).toFixed(2),
        month6ChangePercent: (res.data.month6ChangePercent * 100).toFixed(2),
      };
    } catch (error) {
      alert("Problem getting stock stats for " + ticker, "2017-01-01");
    }

    this.setState({ isLoadingStats: false });
    return stats;
  };

  handleOpenMorningstarParent = (currentSuggestion) => {
    const morningstarSE = {
      ARCA: "arcx",
      NASDAQ: "xnas",
      BATS: "bats",
    };

    console.log("PA DE VISE MAJKE TI", currentSuggestion);

    const ticker = currentSuggestion.ticker.toLowerCase();
    const stockExchange = currentSuggestion.stock_exchange;

    window.open(
      "https://www.morningstar.com/etfs/" +
        morningstarSE[stockExchange] +
        "/" +
        ticker +
        "/parent",
      "_blank"
    );
  }

  handleOpenWithMorningstar = (currentSuggestion) => {
    const morningstarSE = {
      ARCA: "arcx",
      NASDAQ: "xnas",
      BATS: "bats",
    };

    const ticker = currentSuggestion.etf.ticker.toLowerCase();
    const stockExchange = currentSuggestion.etf.stock_exchange;

    window.open(
      "https://www.morningstar.com/etfs/" +
        morningstarSE[stockExchange] +
        "/" +
        ticker +
        "/quote",
      "_blank"
    );

    this.handleHideExportForAnalysis();
  };

  handleSelectMatch = (selectedSuggestionIndex) => {
    this.setState(
      {
        selectedSuggestionIndex,
        areMoreSuggestionsVisible: false,
        isSuggestionCardVisible: false,
      },
      () => {
        const el = document.getElementById("bestMatchingResult");
        el.scrollIntoView();
      }
    );
  };

  handleShowScoreBreakdown = () => {
    this.setState({ isScoreBreakdownVisible: true });
  };

  handleHideScoreBreakdown = () => {
    this.setState({ isScoreBreakdownVisible: false });
  };

  handleShowDetails = () => {
    this.setState({ areDetailsVisible: true });
  };

  handleHideDetails = () => {
    this.setState({ areDetailsVisible: false });
  };

  handleShowHoldings = () => {
    this.setState({ areHoldingsVisible: true });
  };

  handleHideHoldings = () => {
    this.setState({ areHoldingsVisible: false });
  };

  handleGeneratePDFDocument = async (top5) => {
    this.setState({ generatingPDF: true });
    let documentData = await this.setPDFData(top5);
    const blob = await pdf(<PDFSuggestions data={documentData} />).toBlob();
    let docName =
      this.state.client.first_name && this.state.client.last_name
        ? this.state.client.first_name + "_" + this.state.client.last_name + "_"
        : "";
    if (top5) {
      docName += "top_5.pdf";
    } else {
      docName += documentData.suggestions[0].ticker + ".pdf";
    }
    saveAs(blob, docName);
    this.setState({ generatingPDF: false });
  };

  setPDFData = async (top5) => {
    let pdfData = {
      clientInfo: {},
      portfolioInfo: {},
      keyPreferences: {},
      suggestion: {},
      performanceStats: {},
    };

    let birthDate = new Date(this.state.client.date_of_birth);
    let retirementDate = new Date(this.state.client.retirement_date);

    pdfData.clientInfo = {
      name:
        this.state.client.first_name && this.state.client.last_name
          ? this.state.client.first_name + " " + this.state.client.last_name
          : "-",
      address: this.state.client.address ? this.state.client.address : "-",
      dob: birthDate
        ? birthDate.getMonth() +
          1 +
          "/" +
          birthDate.getDate() +
          "/" +
          birthDate.getFullYear()
        : "-",
      retirement: retirementDate.getFullYear()
        ? retirementDate.getFullYear()
        : "-",
      budget: this.state.client.budget ? this.state.client.budget : "-",
    };

    let risk = "";
    if (this.state.client.default_portfolio_params) {
      switch (this.state.client.default_portfolio_params.risk_level) {
        case 1:
          risk = "Very Low";
          break;
        case 2:
          risk = "Low";
          break;
        case 3:
          risk = "Medium";
          break;
        case 4:
          risk = "High";
          break;
        case 5:
          risk = "Very High";
          break;
        default:
          risk = "N/A";
          break;
      }
    }

    let sugTypes = [];
    let sectRest = [];
    let secRest = [];
    let ideas = [];

    if (this.state.client.default_portfolio_params) {
      sugTypes = this.state.client.default_portfolio_params.suggestion_types;
      sectRest = this.state.client.default_portfolio_params.sector_restrictions;
      secRest = this.state.client.default_portfolio_params
        .security_restrictions;
      ideas = this.state.client.default_portfolio_params.ideas_to_support;
    }

    pdfData.portfolioInfo = {
      suggestionTypes: sugTypes,
      assetClasses: ["US Equities"],
      risk: risk,
      sectorRestrictions: sectRest,
      securityRestrictions: secRest,
    };

    let activities = [];

    if (this.state.client.preferences) {
      activities = this.state.client.preferences.activities_to_avoid;
    }

    pdfData.keyPreferences = {
      activitiesToAvoid: activities,
      ideasToSupport: ideas,
    };

    // Ovo je situacija gdje sugestije embeddamo

    // If we did not select top 5, we want only current one to be included
    if (!top5) {
      if (this.state.suggestions.etf_suggestions) {
        if (
          this.state.suggestions.etf_suggestions[
            this.state.selectedSuggestionIndex
          ]
        ) {
          let tmp = this.state.suggestions.etf_suggestions[
            this.state.selectedSuggestionIndex
          ];

          let shortSuggestion = {
            ticker: tmp.etf.ticker,
            name: tmp.etf.name,
            score: tmp.score,
            score_breakdown: tmp.score_breakdown,
            stock_exchange: tmp.etf.stock_exchange,
            dividend_yield: tmp.etf.dividend_yield,
            expense_ratio: tmp.etf.expense_ratio,
            inception_date: tmp.etf.inception_date,
            risk_metrics: tmp.etf.risk_metrics,
            top_holdings: tmp.etf.holdings.slice(0, 5),
            parent: tmp.etf.parent,
            performance_stats: this.state.currentStats,
          };

          let inceptionDate = new Date(shortSuggestion.inception_date);
          shortSuggestion.inception_date =
            inceptionDate.getMonth() +
            1 +
            "/" +
            inceptionDate.getDate() +
            "/" +
            inceptionDate.getFullYear();

          pdfData.suggestions = [shortSuggestion];
        }
      }
    } else {
      if (this.state.suggestions.etf_suggestions) {
        let suggestions = [];
        let numOfRecords =
          this.state.suggestions.etf_suggestions.length < 5
            ? this.state.suggestions.etf_suggestions.length
            : 5;
        for (let i = 0; i < numOfRecords; i++) {
          let tmp = this.state.suggestions.etf_suggestions[i];

          let stats = await this.getStockStats(tmp.etf.ticker);

          let shortSuggestion = {
            ticker: tmp.etf.ticker,
            name: tmp.etf.name,
            score: tmp.score,
            score_breakdown: tmp.score_breakdown,
            stock_exchange: tmp.etf.stock_exchange,
            dividend_yield: tmp.etf.dividend_yield,
            expense_ratio: tmp.etf.expense_ratio,
            inception_date: tmp.etf.inception_date,
            risk_metrics: tmp.etf.risk_metrics,
            top_holdings: tmp.etf.holdings.slice(0, 5),
            parent: tmp.etf.parent,
            performance_stats: stats,
          };

          let inceptionDate = new Date(shortSuggestion.inception_date);
          shortSuggestion.inception_date =
            inceptionDate.getMonth() +
            1 +
            "/" +
            inceptionDate.getDate() +
            "/" +
            inceptionDate.getFullYear();

          suggestions.push(shortSuggestion);
        }
        pdfData.suggestions = suggestions;
      }
    }

    return pdfData;
  };

  render() {
    const comingSoonTooltip = <Tooltip>Coming soon</Tooltip>;
    let currentSuggestion = {
      etf: {},
      score: 0,
      portfolio_intelligence: {},
    };
    let isScoreBreakdownVisible = false;

    if (this.state.suggestions && this.state.suggestions.etf_suggestions) {
      currentSuggestion = this.state.suggestions.etf_suggestions[
        this.state.selectedSuggestionIndex
      ];
      isScoreBreakdownVisible = true;
    }

    return (
      <div>
        <span
          className="plain-link"
          onClick={() => this.props.history.push("/clients")}
        >
          &#60;{" "}
          {this.state.mode !== "analyse" ? "All clients" : "Portfolio Analyser"}
        </span>

        <Row>
          {this.state.mode !== "analyse" && (
            <Col xs={20} xsOffset={2} md={18} mdOffset={3}>
              <h1 className="page-title">Client</h1>
              <Button
                appearance="link"
                className="btn --outline page-action-btn"
                onClick={this.handleEdit}
              >
                Edit
              </Button>

              {/* <Whisper placement="top" trigger="click" speaker={comingSoonTooltip}>
                            <Button
                                appearance="link"
                                className="btn --outline page-action-btn mr-20">
                                Contact Client
                            </Button>
                        </Whisper> */}

              <div className="card client-info-card">
                <Col
                  xs={20}
                  xsOffset={2}
                  md={2}
                  mdOffset={0}
                  className="text-center"
                >
                  <img
                    alt="Client's profile"
                    className="client-info-card__profile-pic"
                    src="https://pngimage.net/wp-content/uploads/2018/05/default-user-image-png-7.png"
                  ></img>
                </Col>
                <Col xs={20} xsOffset={2} md={3} mdOffset={0} className="ml-10">
                  <p>
                    <strong className="text-dark">
                      {this.state.client.first_name}{" "}
                      {this.state.client.last_name}
                    </strong>
                  </p>
                  <p>#{this.state.client.id}</p>
                </Col>
                <Col
                  xs={20}
                  xsOffset={2}
                  md={3}
                  mdOffset={0}
                  className="text-center"
                >
                  <p>Client since</p>
                  <p className="text-dark">
                    {new Date(
                      this.state.client.created_on
                    ).toLocaleDateString()}
                  </p>
                </Col>
                <Col
                  xs={20}
                  xsOffset={2}
                  md={3}
                  mdOffset={0}
                  className="text-center"
                >
                  <p>Budget</p>
                  <p className="text-dark">${this.state.client.budget}</p>
                </Col>
                <Col
                  xs={20}
                  xsOffset={2}
                  md={3}
                  mdOffset={0}
                  className="text-center"
                >
                  <p>Recurring Deposit</p>
                  <p className="text-dark">n/a</p>
                </Col>
                <Col
                  xs={20}
                  xsOffset={2}
                  md={3}
                  mdOffset={0}
                  className="text-center"
                >
                  <p>Retirement</p>
                  <p className="text-dark">
                    In{" "}
                    {`${-moment().diff(
                      this.state.client.retirement_date,
                      "years"
                    )} years`}
                  </p>
                </Col>
                <Col
                  xs={20}
                  xsOffset={2}
                  md={3}
                  mdOffset={0}
                  className="text-center"
                >
                  <p>Wants to Support</p>
                  <p className="text-dark">
                    {this.state.client.default_portfolio_params
                      ? `${this.state.client.default_portfolio_params.ideas_to_support.length} causes`
                      : "n/a"}
                  </p>
                </Col>
                <Col
                  xs={20}
                  xsOffset={2}
                  md={3}
                  mdOffset={0}
                  className="text-center"
                >
                  <p>Wants to Avoid</p>
                  <p className="text-dark">
                    {this.state.client.preferences
                      ? `${this.state.client.preferences.activities_to_avoid.length} activities`
                      : "n/a"}
                  </p>
                </Col>
                {/* <Col xs={20} xsOffset={2} md={3} mdOffset={0} className="text-center">
                                <p className="plain-link --disabled fw-500">
                                    <Whisper placement="top" trigger="click" speaker={comingSoonTooltip}>
                                        <span>View Full Profile</span>
                                    </Whisper>
                                </p>
                            </Col> */}
              </div>
            </Col>
          )}

          <Col xs={20} xsOffset={2} md={18} mdOffset={3} className="mt-50">
            <h1 id="bestMatchingResult" className="page-title">
              {this.state.mode !== "analyse"
                ? "ETF Tactical Exposure Ideas"
                : "Best Matching Constituent"}
            </h1>

            {/* <Button
              disabled={false}
              appearance="link"
              onClick={this.handleShowMoreSuggestions}
              className="btn --outline page-action-btn"
            >
              {this.state.mode !== "analyse" ? "More Suggestions" : "View All"}
            </Button> */}

            {/* <Button
              disabled={!currentSuggestion.etf.id}
              appearance="link"
              style={{ position: "relative" }}
              onClick={() => {
                this.handleExportForAnalysis(currentSuggestion);
              }}
              className="btn --outline page-action-btn mr-20"
            >
              <span
                style={{
                  position: "absolute",
                  top: -11,
                  right: -11,
                  backgroundColor: "#f84aa2",
                  borderRadius: "1000px",
                  color: "white",
                  width: "25px",
                  height: "25px",
                }}
              >
                2
              </span>
              Export
            </Button> */}

            <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
              <div className="card --margin-zero performance-card">
                {this.state.isLoadingSuggestions && (
                  <p className="empty-state">
                    <Icon icon="spinner" pulse />
                    Loading suggestion for this client...
                  </p>
                )}

                {!this.state.isLoadingSuggestions &&
                  !currentSuggestion.etf.name && (
                    <p className="empty-state">
                      No matching result found. Try editing the parameters.
                    </p>
                  )}

                {!this.state.isLoadingSuggestions &&
                  currentSuggestion.etf.name && (
                    <div>
                      <h4
                        className="card-subtitle-large ml-10"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <Progress.Circle
                          style={{
                            width: "65px",
                          }}
                          className="mr-10"
                          percent={parseInt(currentSuggestion.score * 10)}
                          strokeColor={getColorByScore(currentSuggestion.score)}
                        />
                        <div>
                          <p
                            style={{
                              color: "#6565DA",
                              fontSize: "12px",
                              paddingBottom: "5px",
                            }}
                          >
                            Best Matching Idea
                          </p>
                          {`${currentSuggestion.etf.name} (${currentSuggestion.etf.ticker})`}

                          <div>
                            {/* <span
                              className="pink-link"
                              onClick={this.handleShowHoldings}
                              style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                marginLeft: "3px",
                                border: "1px solid",
                                padding: "4px",
                              }}
                            >
                              <i className="iconsminds-pie-chart"></i>
                              View holdingsss
                            </span>
                            <span
                              style={{
                                marginLeft: "5px",
                                marginRight: "2px",
                                fontSize: "15px",
                                color: "#adadad",
                              }}
                            >
                              |
                            </span>
                            <span
                              className="pink-link"
                              onClick={this.handleShowDetails}
                              style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                marginLeft: "3px",
                                border: "1px solid",
                                padding: "4px",
                              }}
                            >
                              <i className="iconsminds-project"></i>
                              View more details
                            </span> */}
                          </div>
                        </div>

                        {/* <div
                                            className="score-breakdown-invoker"
                                            onClick={this.handleShowScoreBreakdown}>
                                            <i className="iconsminds-pie-chart"></i>
                                            View score breakdown
                                        </div> */}
                      </h4>

                      {/* TODO: BRING THIS BACK */}
                      <PerformanceChart suggestion={currentSuggestion.etf} />

                      <div className="mt-10 pt-10 brdt-2-light"></div>

                      <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <div className="performance-metric brdr-2-light">
                          <h4>Expense Ratio</h4>
                          <h3>
                            {currentSuggestion.etf.expense_ratio === -1 && (
                              <span>n/a</span>
                            )}
                            {currentSuggestion.etf.expense_ratio !== -1 &&
                              `${currentSuggestion.etf.expense_ratio}%`}
                          </h3>
                        </div>
                      </Col>
                      <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <div className="performance-metric brdr-2-light">
                          <h4>Inception Date</h4>
                          <h3>
                            {!currentSuggestion.etf.inception_date && (
                              <span>n/a</span>
                            )}
                            {moment(
                              currentSuggestion.etf.inception_date
                            ).format("DD MMM YYYY") === "01 Jan 0001" && (
                              <span>n/a</span>
                            )}
                            {moment(
                              currentSuggestion.etf.inception_date
                            ).format("DD MMM YYYY") !== "01 Jan 0001" && (
                              <span>
                                {moment(
                                  currentSuggestion.etf.inception_date
                                ).format("DD MMM YYYY")}
                              </span>
                            )}
                          </h3>
                        </div>
                      </Col>
                      <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <div className="performance-metric brdr-2-light">
                          <h4>Dividend Yield</h4>
                          <h3>
                            {currentSuggestion.etf.dividend_yield ===
                              -10000 && <span>n/a</span>}
                            {currentSuggestion.etf.dividend_yield !==
                              -10000 && (
                              <span>{`${currentSuggestion.etf.dividend_yield.toFixed(
                                3
                              )}%`}</span>
                            )}
                          </h3>
                        </div>
                      </Col>
                      <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <div className="performance-metric brdr-2-light">
                          <h4>Sharpe Ratio</h4>
                          <h3>
                            {!currentSuggestion.etf.risk_metrics
                              .sharpe_ratio && <span>n/a</span>}
                            {currentSuggestion.etf.risk_metrics.sharpe_ratio ===
                              -10000 && <span>n/a</span>}
                            {currentSuggestion.etf.risk_metrics.sharpe_ratio &&
                              currentSuggestion.etf.risk_metrics.sharpe_ratio >
                                -10000 &&
                              currentSuggestion.etf.risk_metrics.sharpe_ratio}
                          </h3>
                        </div>
                      </Col>
                      <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <div className="performance-metric brdr-2-light">
                          <h4>Sortino Ratio</h4>
                          <h3>
                            {!currentSuggestion.etf.risk_metrics
                              .sortino_ratio && <span>n/a</span>}
                            {currentSuggestion.etf.risk_metrics.sortino_ratio.toFixed(
                              3
                            )}
                          </h3>
                        </div>
                      </Col>
                      <Col xs={20} xsOffset={2} md={4} mdOffset={0}>
                        <div className="performance-metric">
                          <h4>Beta</h4>
                          <h3>
                            {currentSuggestion.etf.risk_metrics.beta != -10000
                              ? currentSuggestion.etf.risk_metrics.beta.toFixed(
                                  3
                                )
                              : "n/a"}
                          </h3>
                        </div>
                      </Col>
                    </div>
                  )}
              </div>
              <div className="card --margin-zero more-info-card">
                <div
                  className="card suggestions"
                  style={{
                    display: this.state.isSuggestionCardVisible
                      ? "block"
                      : "none",
                  }}
                >
                  {this.state.suggestions.etf_suggestions &&
                    this.state.suggestions.etf_suggestions.length > 0 && (
                      <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                        <Col md={22} sm={18} xs={18}>
                          {" "}
                          <p style={{ color: "#6565da", fontSize: "16px" }}>
                            {this.state.mode !== "analyse"
                              ? "Top 20 best matching suggestions"
                              : "Scored Constituents"}
                          </p>
                        </Col>
                        <Col
                          md={2}
                          sm={6}
                          xs={6}
                          onClick={() => this.handleMoreSuggestions()}
                          style={{ cursor: "pointer" }}
                        >
                          <Icon icon="close" />
                        </Col>
                        {this.state.suggestions.etf_suggestions &&
                          this.state.suggestions.etf_suggestions.length ===
                            0 && (
                            <Col xs={20} xsOffset={2} md={18} mdOffset={3}>
                              <h1 className="page-title d-block">
                                Other Matches
                              </h1>
                              <p className="empty-state">
                                There are no other matches for this client at
                                the moment.
                              </p>
                            </Col>
                          )}
                        {this.state.suggestions.etf_suggestions.map((s, k) => (
                          <Col
                            key={k}
                            xs={20}
                            xsOffset={2}
                            md={24}
                            mdOffset={0}
                            className="mt-10"
                            onClick={() => this.handleSelectMatch(k)}
                          >
                            <MatchSuggestion data={s} />
                          </Col>
                        ))}
                      </Col>
                    )}
                </div>
                <Col sm={24} md={8} lg={8} className="more-info-wrap">
                  <Col sm={16} md={24} lg={14}>
                    <Col xs={12} sm={10} md={7} lg={7}>
                      <Progress.Circle
                        style={{
                          width: "45px",
                        }}
                        className="mr-10"
                        percent={parseInt(currentSuggestion.score * 10)}
                        strokeColor={getColorByScore(currentSuggestion.score)}
                      />
                    </Col>
                    <Col sm={10} md={12} lg={17}>
                      <div className="ml-10">
                        <p
                          style={{
                            color: "#6565DA",
                            fontSize: "8px",
                            paddingBottom: "5px",
                          }}
                        >
                          Best Matching Idea
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            marginTop: "0",
                          }}
                        >{`${currentSuggestion.etf.name} (${currentSuggestion.etf.ticker})`}</p>
                      </div>
                    </Col>
                  </Col>

                  <Col sm={8} md={24} lg={8}>
                    <div
                      className="more-ideas-btn"
                      onClick={this.handleMoreSuggestions}
                      style={{ textAlign: "center" }}
                    >
                      More Ideas <i className="iconsminds-arrow-down" />
                    </div>
                  </Col>
                </Col>
                <Col
                  className="more-info-card-btns"
                  xs={24}
                  sm={24}
                  md={16}
                  lg={16}
                  style={{ float: "right" }}
                >
                  <Col>
                    <Button
                      disabled={!currentSuggestion.etf.id}
                      appearance="link"
                      style={{ position: "relative" }}
                      onClick={() => {
                        this.handleExportForAnalysis(currentSuggestion);
                      }}
                      className="btn --primary --secondaryBtn page-action-btn  mr-10 "
                    >
                      <i className="iconsminds-download-1 mr-2"></i>
                      <span
                        style={{
                          position: "absolute",
                          top: -11,
                          right: -11,
                          backgroundColor: "#f84aa2",
                          borderRadius: "1000px",
                          color: "white",
                          width: "22px",
                          height: "22px",
                        }}
                      >
                        2
                      </span>
                      Export Ideas
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      onClick={this.handleShowDetails}
                      className="btn --outline --secondaryBtn page-action-btn  mr-10 "
                    >
                      <i className="iconsminds-project"></i> Fund Details
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      onClick={this.handleShowHoldings}
                      className="btn --outline --secondaryBtn page-action-btn  mr-10 "
                    >
                      <i className="iconsminds-pie-chart"></i> View Holdings
                    </Button>
                  </Col>
                  <Col style={{ float: "right" }}>
                    <Button className="btn --secondaryBtn page-action-btn  mr-10 ">
                      <img
                        onClick={() => {
                          this.handleOpenWithMorningstar(currentSuggestion);
                        }}
                        src="morningstar.png"
                        className="morningstar-logo"
                      />
                    </Button>
                  </Col>
                </Col>
              </div>
            </Col>
          </Col>

          {/* Portfolio Intelligence */}
          {/* <Col xs={20} xsOffset={2} md={18} mdOffset={3} className="mt-50">
                        <h1
                            className="page-title d-block"
                            style={{
                                marginBottom: '10px',
                                lineHeight: '30px'
                            }}>Portfolio Intelligence</h1>
                        <div className="mb-20">
                            <span
                                className="pink-link --disabled fw-500"
                                style={{
                                    fontSize: '20px'
                                }}>View full portfolio intelligence report</span>
                        </div>

                        <PortfolioIntelligence data={currentSuggestion.portfolio_intelligence} />

                        <div>
                            <span
                                className="pink-link float-right fw-500 mt-25"
                                style={{
                                    fontSize: '20px'
                                }}
                                onClick={this.handleShowMoreSuggestions}>View more suggestions</span>
                        </div>
                    </Col> */}

          {/* ETF Holdings */}
          <Drawer
            show={this.state.areHoldingsVisible}
            onHide={this.handleHideHoldings}
            size="lg"
          >
            <Drawer.Body>
              {(!currentSuggestion ||
                !currentSuggestion.etf ||
                !currentSuggestion.etf.holdings) && (
                <Col xs={20} xsOffset={2} md={18} mdOffset={3}>
                  <h1 className="page-title d-block">Holdings</h1>
                  <p className="empty-state">
                    No data available at the moment.
                  </p>
                </Col>
              )}

              {currentSuggestion &&
                currentSuggestion.etf &&
                currentSuggestion.etf.holdings && (
                  <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                    <HoldingsTable holdings={currentSuggestion.etf.holdings} />
                  </Col>
                )}
            </Drawer.Body>

            <Drawer.Footer>
              <Button
                onClick={this.handleHideHoldings}
                appearance="subtle"
                style={{
                  marginTop: "-20px",
                }}
              >
                Close
              </Button>
            </Drawer.Footer>
          </Drawer>

          {/* Other matches / suggestions */}
          <Drawer
            show={this.state.areMoreSuggestionsVisible}
            onHide={this.handleHideMoreSuggestions}
          >
            <Drawer.Header>
              <Drawer.Title>
                {this.state.mode !== "analyse"
                  ? "Top 20 best matching suggestions"
                  : "Scored Constituents"}
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              {this.state.suggestions.etf_suggestions &&
                this.state.suggestions.etf_suggestions.length === 0 && (
                  <Col xs={20} xsOffset={2} md={18} mdOffset={3}>
                    <h1 className="page-title d-block">Other Matches</h1>
                    <p className="empty-state">
                      There are no other matches for this client at the moment.
                    </p>
                  </Col>
                )}

              {this.state.suggestions.etf_suggestions &&
                this.state.suggestions.etf_suggestions.length > 0 && (
                  <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                    {this.state.suggestions.etf_suggestions.map((s, k) => (
                      <Col
                        key={k}
                        xs={20}
                        xsOffset={2}
                        md={24}
                        mdOffset={0}
                        className="mt-10"
                        onClick={() => this.handleSelectMatch(k)}
                      >
                        <MatchSuggestion data={s} />
                      </Col>
                    ))}
                  </Col>
                )}
            </Drawer.Body>
          </Drawer>
        </Row>

        <Row>
          <Col xs={20} xsOffset={2} md={18} mdOffset={3} className="mt-50">
            <h1
              className="page-title d-block"
              style={{
                marginBottom: "10px",
                lineHeight: "30px",
              }}
            >
              {this.state.mode !== "analyse"
                ? "How we scored this suggestion"
                : "How aligned is this ETF to client's preferences?"}
            </h1>
            {isScoreBreakdownVisible && (
              <div
                className="card --margin-zero performance-card"
                style={{ marginTop: "20px" }}
              >
                <ScoreBreakdown
                  overallScore={currentSuggestion.score}
                  scoreBreakdown={currentSuggestion.score_breakdown}
                  riskMetrics={currentSuggestion.etf.risk_metrics}
                />
              </div>
            )}
          </Col>
        </Row>

        {this.state.isAnalysisVisible && (
          <Modal
            show={true}
            onHide={this.handleHideExportForAnalysis}
            size="xs"
            className="score-breakdown"
            style={{ textAlign: "center" }}
          >
            <Modal.Header>
              <Modal.Title
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                }}
              >
                <p>
                  Export{" "}
                  <span style={{ color: "#6565DA" }}>
                    {currentSuggestion.etf.ticker}
                  </span>
                </p>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {!this.state.generatingPDF ? (
                <Button
                  appearance="link"
                  className="btn --outline mb-20"
                  style={{
                    width: "80%",
                    position: "relative",
                    marginTop: "20px",
                  }}
                  onClick={() => this.handleGeneratePDFDocument()}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: -11,
                      right: -11,
                      backgroundColor: "#f84aa2",
                      borderRadius: "1000px",
                      color: "white",
                      width: "25px",
                      height: "25px",
                      paddingTop: "2px",
                    }}
                  >
                    1
                  </span>
                  Download PDF (This suggestion)
                </Button>
              ) : (
                <Button
                  style={{ width: "80%" }}
                  appearance="link"
                  className="btn --outline mb-20"
                  disabled={true}
                >
                  Please Wait, Generating PDF
                </Button>
              )}
              {!this.state.generatingPDF ? (
                <Button
                  appearance="link"
                  className="btn --outline mb-20"
                  style={{ width: "80%", position: "relative" }}
                  onClick={() => this.handleGeneratePDFDocument(true)}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: -11,
                      right: -11,
                      backgroundColor: "#f84aa2",
                      borderRadius: "1000px",
                      color: "white",
                      width: "25px",
                      height: "25px",
                      paddingTop: "2px",
                    }}
                  >
                    1
                  </span>
                  Download PDF (Top 5 Suggestions)
                </Button>
              ) : (
                <Button
                  appearance="link"
                  style={{ width: "80%" }}
                  className="btn --outline mb-20"
                  disabled={true}
                >
                  Please Wait, Generating PDF
                </Button>
              )}
              {/* <PDFDownload data={pdfData} /> */}
              {/* <Button
                            appearance="link"
                            className="btn --outline mb-20"
                            style={{ width: "80%" }}
                            disabled={true}>
                            Open in Bloomberg Terminal
                        </Button>
                        <Button
                            appearance="link"
                            className="btn --outline mb-20"
                            style={{ width: "80%" }}
                            disabled={true}>
                            Export to CSV
                        </Button> */}
              {/* <ETFDetails data={currentSuggestion.etf} /> */}
            </Modal.Body>
          </Modal>
        )}

        {this.state.areDetailsVisible && (
          <Modal
            show={true}
            onHide={this.handleHideDetails}
            size="lg"
            className="score-breakdown"
          >
            <Modal.Header>
              <Modal.Title
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                }}
              >{`${currentSuggestion.etf.name} Details`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ETFDetails onOpenParent={this.handleOpenMorningstarParent} data={currentSuggestion.etf} />
            </Modal.Body>
          </Modal>
        )}
      </div>
    );
  }
}

const backup_data = [
  {
    score: 7.9045000000000005,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.4725,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 98.84,
        },
        {
          idea: "renewable_energy",
          involvement: 0.06,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 7.05,
      security_score: 10,
    },
    etf: {
      id: 54,
      ticker: "ARKG",
      index_type: "thematic",
      name: "ARK Genomic Revolution Multi-Sector",
      stock_exchange: "BATS",
      dividend_yield: 5.44,
      expense_ratio: 0.75,
      inception_date: "2014-10-30T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 84.88,
        },
        {
          sector: "information_technology",
          involvement: 0.86,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 22.71,
        },
        {
          idea: "better_health",
          involvement: 47.16,
        },
        {
          idea: "biotechnology",
          involvement: 98.84,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 1.34,
        },
        {
          idea: "low_carbon",
          involvement: 10.88,
        },
        {
          idea: "renewable_energy",
          involvement: 0.06,
        },
        {
          idea: "smart_cities",
          involvement: 0.06,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 4.42,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.61,
        sortino_ratio: 0.66,
        beta: 1.31,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "NVTA",
          name: "Invitae Corp",
          weight: "9.0352%",
        },
        {
          symbol: "ILMN",
          name: "Illumina Inc",
          weight: "8.8375%",
        },
        {
          symbol: "CRSP",
          name: "CRISPR Therapeutics AG",
          weight: "8.5858%",
        },
        {
          symbol: "CGEN",
          name: "Compugen Ltd",
          weight: "8.2014%",
        },
        {
          symbol: "ARCT",
          name: "Arcturus Therapeutics Holdings Inc",
          weight: "5.9674%",
        },
        {
          symbol: "NTLA",
          name: "Intellia Therapeutics Inc",
          weight: "5.2863%",
        },
        {
          symbol: "IOVA",
          name: "Iovance Biotherapeutics Inc",
          weight: "5.2198%",
        },
        {
          symbol: "EDIT",
          name: "Editas Medicine Inc",
          weight: "3.9958%",
        },
        {
          symbol: "INCY",
          name: "Incyte Corp",
          weight: "3.2176%",
        },
        {
          symbol: "TWST",
          name: "Twist Bioscience Corp",
          weight: "3.1666%",
        },
        {
          symbol: "CDNA",
          name: "CareDx Inc",
          weight: "2.9875%",
        },
        {
          symbol: "CERS",
          name: "Cerus Corp",
          weight: "2.9069%",
        },
        {
          symbol: "GH",
          name: "Guardant Health Inc",
          weight: "2.8756%",
        },
        {
          symbol: "VCYT",
          name: "Veracyte Inc",
          weight: "2.7723%",
        },
        {
          symbol: "FATE",
          name: "Fate Therapeutics Inc",
          weight: "2.5984%",
        },
        {
          symbol: "INO",
          name: "Inovio Pharmaceuticals Inc",
          weight: "2.5235%",
        },
        {
          symbol: "CLLS",
          name: "Cellectis SA",
          weight: "2.4651%",
        },
        {
          symbol: "SYRS",
          name: "Syros Pharmaceuticals Inc",
          weight: "2.2837%",
        },
        {
          symbol: "PACB",
          name: "Pacific Biosciences of California Inc",
          weight: "2.2682%",
        },
        {
          symbol: "NSTG",
          name: "NanoString Technologies Inc",
          weight: "2.2399%",
        },
        {
          symbol: "PSNL",
          name: "Personalis Inc",
          weight: "1.6737%",
        },
        {
          symbol: "CDXS",
          name: "Codexis Inc",
          weight: "1.6323%",
        },
        {
          symbol: "PSTG",
          name: "Pure Storage Inc",
          weight: "1.6316%",
        },
        {
          symbol: "PSTI",
          name: "Pluristem Therapeutics Inc",
          weight: "1.2502%",
        },
        {
          symbol: "MCRB",
          name: "Seres Therapeutics Inc",
          weight: "1.1773%",
        },
        {
          symbol: "TDOC",
          name: "Teladoc Health Inc",
          weight: "1.0835%",
        },
        {
          symbol: "IONS",
          name: "Ionis Pharmaceuticals Inc",
          weight: "1.0%",
        },
        {
          symbol: "CSTL",
          name: "Castle Biosciences Inc",
          weight: "0.9893%",
        },
        {
          symbol: "CBMG",
          name: "Cellular Biomedicine Group Inc",
          weight: "0.892%",
        },
        {
          symbol: "TXG",
          name: "10X Genomics Inc",
          weight: "0.7213%",
        },
        {
          symbol: "ONVO",
          name: "Organovo Holdings Inc",
          weight: "0.3642%",
        },
        {
          symbol: "AQB",
          name: "AquaBounty Technologies Inc",
          weight: "0.123%",
        },
        {
          symbol: "EVGN",
          name: "Evogene Ltd",
          weight: "0.041%",
        },
        {
          symbol: "PGEN",
          name: "Precigen Inc",
          weight: "0.0002%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.0142%",
        },
      ],
      parent: {
        firm_name: "ARK ETF Trust",
        market: "US ETFs",
        total_net_assets: 3.27,
        fund_flows: 0.70277,
        asset_growth_rate: 25,
        number_of_funds: 7,
        manager_retention_rate: 100,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.833333333333334,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.5,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 100,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 6.666666666666667,
      security_score: 10,
    },
    etf: {
      id: 111,
      ticker: "SBIO",
      index_type: "thematic",
      name: "ALPS Medical Breakthroughs",
      stock_exchange: "ARCA",
      dividend_yield: 0.04,
      expense_ratio: 0.5,
      inception_date: "2014-12-30T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 67.81,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 2.82,
        },
        {
          idea: "better_health",
          involvement: 36.33,
        },
        {
          idea: "biotechnology",
          involvement: 100,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 2.97,
        },
        {
          idea: "low_carbon",
          involvement: 2.96,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
        {
          idea: "smart_cities",
          involvement: 0,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.38,
        sortino_ratio: 0.43,
        beta: 1.32,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "IMMU",
          name: "Immunomedics Inc",
          weight: "5.6157%",
        },
        {
          symbol: "GBT",
          name: "Global Blood Therapeutics Inc",
          weight: "4.6324%",
        },
        {
          symbol: "UTHR",
          name: "United Therapeutics Corp",
          weight: "4.5717%",
        },
        {
          symbol: "XLRN",
          name: "Acceleron Pharma Inc",
          weight: "4.5539%",
        },
        {
          symbol: "MRTX",
          name: "Mirati Therapeutics Inc",
          weight: "3.4685%",
        },
        {
          symbol: "FGEN",
          name: "FibroGen Inc",
          weight: "3.4138%",
        },
        {
          symbol: "ALLK",
          name: "Allakos Inc",
          weight: "3.2605%",
        },
        {
          symbol: "PTCT",
          name: "PTC Therapeutics Inc",
          weight: "3.132%",
        },
        {
          symbol: "BLUE",
          name: "bluebird bio Inc",
          weight: "3.1039%",
        },
        {
          symbol: "MOR",
          name: "MorphoSys AG",
          weight: "2.9827%",
        },
        {
          symbol: "CCXI",
          name: "ChemoCentryx Inc",
          weight: "2.8453%",
        },
        {
          symbol: "ICPT",
          name: "Intercept Pharmaceuticals Inc",
          weight: "2.6161%",
        },
        {
          symbol: "APLS",
          name: "Apellis Pharmaceuticals Inc",
          weight: "2.5935%",
        },
        {
          symbol: "QURE",
          name: "Uniqure NV",
          weight: "2.527%",
        },
        {
          symbol: "DCPH",
          name: "Deciphera Pharmaceuticals Inc",
          weight: "2.4952%",
        },
        {
          symbol: "ARNA",
          name: "Arena Pharmaceuticals Inc",
          weight: "2.4733%",
        },
        {
          symbol: "ALKS",
          name: "Alkermes Plc",
          weight: "2.4245%",
        },
        {
          symbol: "FATE",
          name: "Fate Therapeutics Inc",
          weight: "2.2238%",
        },
        {
          symbol: "KRTX",
          name: "Karuna Therapeutics Inc",
          weight: "2.1603%",
        },
        {
          symbol: "ALEC",
          name: "Alector Inc",
          weight: "1.8744%",
        },
        {
          symbol: "PRNB",
          name: "Principia Biopharma Inc",
          weight: "1.8738%",
        },
        {
          symbol: "EIDX",
          name: "Eidos Therapeutics Inc",
          weight: "1.8681%",
        },
        {
          symbol: "ZYME",
          name: "Zymeworks Inc",
          weight: "1.6407%",
        },
        {
          symbol: "AKCA",
          name: "Akcea Therapeutics Inc",
          weight: "1.6191%",
        },
        {
          symbol: "EPZM",
          name: "Epizyme Inc",
          weight: "1.5772%",
        },
        {
          symbol: "LGND",
          name: "Ligand Pharmaceuticals Inc",
          weight: "1.5444%",
        },
        {
          symbol: "IRWD",
          name: "Ironwood Pharmaceuticals Inc",
          weight: "1.5441%",
        },
        {
          symbol: "DRNA",
          name: "Dicerna Pharmaceuticals Inc",
          weight: "1.4318%",
        },
        {
          symbol: "CNST",
          name: "Constellation Pharmaceuticals Inc",
          weight: "1.4303%",
        },
        {
          symbol: "MDGL",
          name: "Madrigal Pharmaceuticals Inc",
          weight: "1.3382%",
        },
        {
          symbol: "SWTX",
          name: "Springworks Therapeutics Inc",
          weight: "1.2936%",
        },
        {
          symbol: "CHRS",
          name: "Coherus BioSciences Inc",
          weight: "1.164%",
        },
        {
          symbol: "CRTX",
          name: "Cortexyme Inc",
          weight: "1.1511%",
        },
        {
          symbol: "ORTX",
          name: "Orchard Therapeutics PLC",
          weight: "1.0814%",
        },
        {
          symbol: "ENTA",
          name: "Enanta Pharmaceuticals Inc",
          weight: "1.0125%",
        },
        {
          symbol: "RCKT",
          name: "Rocket Pharmaceuticals Inc",
          weight: "0.9012%",
        },
        {
          symbol: "GOSS",
          name: "Gossamer Bio Inc",
          weight: "0.8473%",
        },
        {
          symbol: "KRYS",
          name: "Krystal Biotech Inc",
          weight: "0.8106%",
        },
        {
          symbol: "APRE",
          name: "Aprea Therapeutics Inc",
          weight: "0.679%",
        },
        {
          symbol: "IMGN",
          name: "ImmunoGen Inc",
          weight: "0.6703%",
        },
        {
          symbol: "OYST",
          name: "Oyster Point Pharma Inc",
          weight: "0.6209%",
        },
        {
          symbol: "VCEL",
          name: "Vericel Corp",
          weight: "0.5778%",
        },
        {
          symbol: "PTLA",
          name: "Portola Pharmaceuticals Inc",
          weight: "0.5531%",
        },
        {
          symbol: "ASMB",
          name: "Assembly Biosciences Inc",
          weight: "0.5404%",
        },
        {
          symbol: "AKRO",
          name: "Akero Therapeutics Inc",
          weight: "0.5331%",
        },
        {
          symbol: "CPRX",
          name: "Catalyst Pharmaceuticals Inc",
          weight: "0.4955%",
        },
        {
          symbol: "URGN",
          name: "Urogen Pharma Ltd",
          weight: "0.4867%",
        },
        {
          symbol: "MGTX",
          name: "MeiraGTx Holdings PLC",
          weight: "0.4867%",
        },
        {
          symbol: "FREQ",
          name: "Frequency Therapeutics Inc",
          weight: "0.483%",
        },
        {
          symbol: "GTHX",
          name: "G1 Therapeutics Inc",
          weight: "0.4794%",
        },
        {
          symbol: "KURA",
          name: "Kura Oncology Inc",
          weight: "0.4593%",
        },
        {
          symbol: "MRUS",
          name: "Merus NV",
          weight: "0.4384%",
        },
        {
          symbol: "CRNX",
          name: "Crinetics Pharmaceuticals Inc",
          weight: "0.4112%",
        },
        {
          symbol: "VKTX",
          name: "Viking Therapeutics Inc",
          weight: "0.416%",
        },
        {
          symbol: "CTMX",
          name: "CytomX Therapeutics Inc",
          weight: "0.4047%",
        },
        {
          symbol: "PBYI",
          name: "Puma Biotechnology Inc",
          weight: "0.3982%",
        },
        {
          symbol: "VYGR",
          name: "Voyager Therapeutics Inc",
          weight: "0.3972%",
        },
        {
          symbol: "REPL",
          name: "Replimune Group Inc",
          weight: "0.3933%",
        },
        {
          symbol: "AGEN",
          name: "Agenus Inc",
          weight: "0.3671%",
        },
        {
          symbol: "XBIT",
          name: "XBiotech Inc",
          weight: "0.3556%",
        },
        {
          symbol: "MGNX",
          name: "MacroGenics Inc",
          weight: "0.3415%",
        },
        {
          symbol: "PDLI",
          name: "PDL BioPharma Inc",
          weight: "0.3368%",
        },
        {
          symbol: "CNCE",
          name: "Concert Pharmaceuticals Inc",
          weight: "0.3128%",
        },
        {
          symbol: "ALBO",
          name: "Albireo Pharma Inc",
          weight: "0.278%",
        },
        {
          symbol: "RIGL",
          name: "Rigel Pharmaceuticals Inc",
          weight: "0.2505%",
        },
        {
          symbol: "MNOV",
          name: "MediciNova Inc",
          weight: "0.2288%",
        },
        {
          symbol: "XOMA",
          name: "XOMA Corp",
          weight: "0.2216%",
        },
        {
          symbol: "KALV",
          name: "Kalvista Pharmaceuticals Inc",
          weight: "0.1899%",
        },
        {
          symbol: "GLYC",
          name: "GlycoMimetics Inc",
          weight: "0.1038%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.0084%",
        },
      ],
      parent: {
        firm_name: "ALPS",
        market: "US ETFs",
        total_net_assets: 5.45,
        fund_flows: -0.78807,
        asset_growth_rate: -6.18,
        number_of_funds: 16,
        manager_retention_rate: 87.11,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.804633333333333,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.4765,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 99.05,
        },
        {
          idea: "renewable_energy",
          involvement: 0.01,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 6.546666666666667,
      security_score: 10,
    },
    etf: {
      id: 106,
      ticker: "BBC",
      index_type: "thematic",
      name: "Virtus LifeSci Biotech Clinical Trials",
      stock_exchange: "ARCA",
      dividend_yield: -10000,
      expense_ratio: 0.79,
      inception_date: "2014-12-16T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 58.95,
        },
        {
          sector: "energy",
          involvement: 1.2,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 1.61,
        },
        {
          idea: "better_health",
          involvement: 37.24,
        },
        {
          idea: "biotechnology",
          involvement: 99.05,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 0.01,
        },
        {
          idea: "low_carbon",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 0.01,
        },
        {
          idea: "smart_cities",
          involvement: 0.01,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.36,
        sortino_ratio: 0.28,
        beta: 1.36,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "MRNA",
          name: "Moderna Inc",
          weight: "3.0217%",
        },
        {
          symbol: "CVM",
          name: "CEL-SCI Corp",
          weight: "2.09%",
        },
        {
          symbol: "FATE",
          name: "Fate Therapeutics Inc",
          weight: "1.821%",
        },
        {
          symbol: "AXSM",
          name: "Axsome Therapeutics Inc",
          weight: "1.8201%",
        },
        {
          symbol: "CCXI",
          name: "ChemoCentryx Inc",
          weight: "1.8078%",
        },
        {
          symbol: "TBIO",
          name: "Translate Bio Inc",
          weight: "1.6429%",
        },
        {
          symbol: "CYTK",
          name: "Cytokinetics Inc",
          weight: "1.6397%",
        },
        {
          symbol: "IOVA",
          name: "Iovance Biotherapeutics Inc",
          weight: "1.5728%",
        },
        {
          symbol: "ITCI",
          name: "Intra-Cellular Therapies Inc",
          weight: "1.5425%",
        },
        {
          symbol: "IMMU",
          name: "Immunomedics Inc",
          weight: "1.5332%",
        },
        {
          symbol: "TGTX",
          name: "TG Therapeutics Inc",
          weight: "1.5097%",
        },
        {
          symbol: "APLS",
          name: "Apellis Pharmaceuticals Inc",
          weight: "1.4845%",
        },
        {
          symbol: "KRTX",
          name: "Karuna Therapeutics Inc",
          weight: "1.4779%",
        },
        {
          symbol: "CTMX",
          name: "CytomX Therapeutics Inc",
          weight: "1.4468%",
        },
        {
          symbol: "ALEC",
          name: "Alector Inc",
          weight: "1.3961%",
        },
        {
          symbol: "ARVN",
          name: "Arvinas Inc",
          weight: "1.3738%",
        },
        {
          symbol: "ADVM",
          name: "Adverum Biotechnologies Inc",
          weight: "1.3698%",
        },
        {
          symbol: "AKBA",
          name: "Akebia Therapeutics Inc",
          weight: "1.3439%",
        },
        {
          symbol: "DNLI",
          name: "Denali Therapeutics Inc",
          weight: "1.3421%",
        },
        {
          symbol: "BCRX",
          name: "BioCryst Pharmaceuticals Inc",
          weight: "1.3352%",
        },
        {
          symbol: "PRNB",
          name: "Principia Biopharma Inc",
          weight: "1.339%",
        },
        {
          symbol: "CRBP",
          name: "Corbus Pharmaceuticals Holdings Inc",
          weight: "1.3197%",
        },
        {
          symbol: "CRTX",
          name: "Cortexyme Inc",
          weight: "1.2774%",
        },
        {
          symbol: "IMGN",
          name: "ImmunoGen Inc",
          weight: "1.2633%",
        },
        {
          symbol: "ASND",
          name: "Ascendis Pharma A/S",
          weight: "1.2528%",
        },
        {
          symbol: "ARNA",
          name: "Arena Pharmaceuticals Inc",
          weight: "1.2225%",
        },
        {
          symbol: "YMAB",
          name: "Y-mAbs Therapeutics, Inc",
          weight: "1.2186%",
        },
        {
          symbol: "ALLO",
          name: "Allogene Therapeutics Inc",
          weight: "1.2166%",
        },
        {
          symbol: "SWTX",
          name: "Springworks Therapeutics Inc",
          weight: "1.2095%",
        },
        {
          symbol: "ARDX",
          name: "Ardelyx Inc",
          weight: "1.1984%",
        },
        {
          symbol: "PRVB",
          name: "Provention Bio Inc",
          weight: "1.1471%",
        },
        {
          symbol: "ANAB",
          name: "AnaptysBio Inc",
          weight: "1.1448%",
        },
        {
          symbol: "EPZM",
          name: "Epizyme Inc",
          weight: "1.1374%",
        },
        {
          symbol: "SGMO",
          name: "Sangamo Therapeutics Inc",
          weight: "1.0892%",
        },
        {
          symbol: "ODT",
          name: "Odonate Therapeutics Inc",
          weight: "1.085%",
        },
        {
          symbol: "MYOK",
          name: "MyoKardia Inc",
          weight: "1.084%",
        },
        {
          symbol: "KDMN",
          name: "Kadmon Holdings Inc",
          weight: "1.0741%",
        },
        {
          symbol: "ORTX",
          name: "Orchard Therapeutics PLC",
          weight: "1.0734%",
        },
        {
          symbol: "CARA",
          name: "Cara Therapeutics Inc",
          weight: "1.0647%",
        },
        {
          symbol: "BPMC",
          name: "Blueprint Medicines Corp",
          weight: "1.0594%",
        },
        {
          symbol: "RGNX",
          name: "Regenxbio Inc",
          weight: "1.0585%",
        },
        {
          symbol: "CNST",
          name: "Constellation Pharmaceuticals Inc",
          weight: "1.0555%",
        },
        {
          symbol: "TPTX",
          name: "Turning Point Therapeutics Inc",
          weight: "1.042%",
        },
        {
          symbol: "MDGL",
          name: "Madrigal Pharmaceuticals Inc",
          weight: "1.0319%",
        },
        {
          symbol: "AKRO",
          name: "Akero Therapeutics Inc",
          weight: "1.0305%",
        },
        {
          symbol: "ZYME",
          name: "Zymeworks Inc",
          weight: "1.0248%",
        },
        {
          symbol: "BHVN",
          name: "Biohaven Pharmaceutical Holding Company Ltd",
          weight: "0.9981%",
        },
        {
          symbol: "FGEN",
          name: "FibroGen Inc",
          weight: "0.9757%",
        },
        {
          symbol: "BBIO",
          name: "BridgeBio Pharma Inc",
          weight: "0.9493%",
        },
        {
          symbol: "ASMB",
          name: "Assembly Biosciences Inc",
          weight: "0.9445%",
        },
        {
          symbol: "KOD",
          name: "Kodiak Sciences Inc",
          weight: "0.9296%",
        },
        {
          symbol: "QURE",
          name: "Uniqure NV",
          weight: "0.9281%",
        },
        {
          symbol: "VYGR",
          name: "Voyager Therapeutics Inc",
          weight: "0.9253%",
        },
        {
          symbol: "RYTM",
          name: "Rhythm Pharmaceuticals Inc",
          weight: "0.9232%",
        },
        {
          symbol: "CRSP",
          name: "CRISPR Therapeutics AG",
          weight: "0.9212%",
        },
        {
          symbol: "PGNX",
          name: "Progenics Pharmaceuticals Inc",
          weight: "0.9161%",
        },
        {
          symbol: "AMRS",
          name: "Amyris Inc",
          weight: "0.9159%",
        },
        {
          symbol: "UBX",
          name: "UNITY Biotechnology Inc",
          weight: "0.9142%",
        },
        {
          symbol: "EIDX",
          name: "Eidos Therapeutics Inc",
          weight: "0.9127%",
        },
        {
          symbol: "DRNA",
          name: "Dicerna Pharmaceuticals Inc",
          weight: "0.9091%",
        },
        {
          symbol: "XNCR",
          name: "Xencor Inc",
          weight: "0.9028%",
        },
        {
          symbol: "AUTL",
          name: "Autolus Therapeutics PLC",
          weight: "0.9019%",
        },
        {
          symbol: "ESPR",
          name: "Esperion Therapeutics Inc",
          weight: "0.8999%",
        },
        {
          symbol: "MYOV",
          name: "Myovant Sciences Ltd",
          weight: "0.8988%",
        },
        {
          symbol: "RCKT",
          name: "Rocket Pharmaceuticals Inc",
          weight: "0.8825%",
        },
        {
          symbol: "RETA",
          name: "Reata Pharmaceuticals Inc",
          weight: "0.8615%",
        },
        {
          symbol: "GERN",
          name: "Geron Corp",
          weight: "0.8615%",
        },
        {
          symbol: "DTIL",
          name: "Precision BioSciences Inc",
          weight: "0.8607%",
        },
        {
          symbol: "MRTX",
          name: "Mirati Therapeutics Inc",
          weight: "0.8446%",
        },
        {
          symbol: "VKTX",
          name: "Viking Therapeutics Inc",
          weight: "0.8422%",
        },
        {
          symbol: "KRYS",
          name: "Krystal Biotech Inc",
          weight: "0.8335%",
        },
        {
          symbol: "DCPH",
          name: "Deciphera Pharmaceuticals Inc",
          weight: "0.8271%",
        },
        {
          symbol: "AGEN",
          name: "Agenus Inc",
          weight: "0.8094%",
        },
        {
          symbol: "KURA",
          name: "Kura Oncology Inc",
          weight: "0.7975%",
        },
        {
          symbol: "TCDA",
          name: "Tricida Inc",
          weight: "0.7859%",
        },
        {
          symbol: "NXTC",
          name: "NextCure Inc",
          weight: "0.784%",
        },
        {
          symbol: "RIGL",
          name: "Rigel Pharmaceuticals Inc",
          weight: "0.7793%",
        },
        {
          symbol: "XBIT",
          name: "XBiotech Inc",
          weight: "0.7684%",
        },
        {
          symbol: "MGNX",
          name: "MacroGenics Inc",
          weight: "0.7668%",
        },
        {
          symbol: "AVRO",
          name: "AVROBIO Inc",
          weight: "0.7369%",
        },
        {
          symbol: "MGTX",
          name: "MeiraGTx Holdings PLC",
          weight: "0.7369%",
        },
        {
          symbol: "BLUE",
          name: "bluebird bio Inc",
          weight: "0.7272%",
        },
        {
          symbol: "FIXX",
          name: "Homology Medicines Inc",
          weight: "0.7101%",
        },
        {
          symbol: "SRNE",
          name: "Sorrento Therapeutics Inc",
          weight: "0.7035%",
        },
        {
          symbol: "ATNX",
          name: "Athenex Inc",
          weight: "0.699%",
        },
        {
          symbol: "ZIOP",
          name: "ZIOPHARM Oncology Inc",
          weight: "0.6599%",
        },
        {
          symbol: "ARWR",
          name: "Arrowhead Pharmaceuticals Inc",
          weight: "0.6524%",
        },
        {
          symbol: "ATRA",
          name: "Atara Biotherapeutics Inc",
          weight: "0.6387%",
        },
        {
          symbol: "ALLK",
          name: "Allakos Inc",
          weight: "0.6333%",
        },
        {
          symbol: "GTHX",
          name: "G1 Therapeutics Inc",
          weight: "0.6011%",
        },
        {
          symbol: "GOSS",
          name: "Gossamer Bio Inc",
          weight: "0.5878%",
        },
        {
          symbol: "GLYC",
          name: "GlycoMimetics Inc",
          weight: "0.4672%",
        },
        {
          symbol: "WVE",
          name: "WAVE Life Sciences Ltd",
          weight: "0.2398%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.0571%",
        },
      ],
      parent: {
        firm_name: "Virtus",
        market: "US ETFs",
        total_net_assets: 0.47448,
        fund_flows: -0.03003,
        asset_growth_rate: -2.77,
        number_of_funds: 12,
        manager_retention_rate: 93.22,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.7792666666666666,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 1.7079999999999997,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 20.4,
        },
        {
          idea: "biotechnology",
          involvement: 37.31,
        },
        {
          idea: "renewable_energy",
          involvement: 10.61,
        },
      ],
      activity_involvement_score: 9.611666666666666,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 2.33,
        },
      ],
      risk_score: 7.576666666666666,
      security_score: 10,
    },
    etf: {
      id: 35,
      ticker: "ARKK",
      index_type: "sectoral",
      name: "ARK Innovation",
      stock_exchange: "ARCA",
      dividend_yield: 0.73,
      expense_ratio: 0.75,
      inception_date: "2014-10-30T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 37.31,
        },
        {
          sector: "information_technology",
          involvement: 27.2,
        },
        {
          sector: "consumer_discretionary",
          involvement: 15.13,
        },
        {
          sector: "communication_services",
          involvement: 8.56,
        },
        {
          sector: "industrials",
          involvement: 4.79,
        },
        {
          sector: "financials",
          involvement: 2.74,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 60.05,
        },
        {
          idea: "better_health",
          involvement: 20.96,
        },
        {
          idea: "biotechnology",
          involvement: 37.31,
        },
        {
          idea: "fintech",
          involvement: 20.4,
        },
        {
          idea: "gender_equality",
          involvement: 4.87,
        },
        {
          idea: "low_carbon",
          involvement: 38.66,
        },
        {
          idea: "renewable_energy",
          involvement: 10.61,
        },
        {
          idea: "smart_cities",
          involvement: 20.3,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 2.94,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 2.33,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.85,
        sortino_ratio: 1.09,
        beta: 1.41,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "TSLA",
          name: "Tesla Inc",
          weight: "11.2572%",
        },
        {
          symbol: "SQ",
          name: "Square Inc",
          weight: "7.0352%",
        },
        {
          symbol: "NVTA",
          name: "Invitae Corp",
          weight: "6.9725%",
        },
        {
          symbol: "ILMN",
          name: "Illumina Inc",
          weight: "6.1023%",
        },
        {
          symbol: "CRSP",
          name: "CRISPR Therapeutics AG",
          weight: "5.0755%",
        },
        {
          symbol: "ROKU",
          name: "Roku Inc",
          weight: "5.0093%",
        },
        {
          symbol: "SSYS",
          name: "Stratasys Ltd",
          weight: "4.3845%",
        },
        {
          symbol: "TWOU",
          name: "2U Inc",
          weight: "4.0491%",
        },
        {
          symbol: "PRLB",
          name: "Proto Labs Inc",
          weight: "3.8035%",
        },
        {
          symbol: "NTLA",
          name: "Intellia Therapeutics Inc",
          weight: "3.6648%",
        },
        {
          symbol: "CGEN",
          name: "Compugen Ltd",
          weight: "3.6269%",
        },
        {
          symbol: "XLNX",
          name: "Xilinx Inc",
          weight: "3.4355%",
        },
        {
          symbol: "Z",
          name: "Zillow Group Inc",
          weight: "3.4172%",
        },
        {
          symbol: "TREE",
          name: "LendingTree Inc",
          weight: "3.1445%",
        },
        {
          symbol: "EDIT",
          name: "Editas Medicine Inc",
          weight: "3.1098%",
        },
        {
          symbol: "PINS",
          name: "Pinterest Inc",
          weight: "2.6082%",
        },
        {
          symbol: "NSTG",
          name: "NanoString Technologies Inc",
          weight: "2.5444%",
        },
        {
          symbol: "SPLK",
          name: "Splunk Inc",
          weight: "2.2877%",
        },
        {
          symbol: "ADSK",
          name: "Autodesk Inc",
          weight: "2.1542%",
        },
        {
          symbol: "CERS",
          name: "Cerus Corp",
          weight: "2.0587%",
        },
        {
          symbol: "TER",
          name: "Teradyne Inc",
          weight: "1.96%",
        },
        {
          symbol: "MTLS",
          name: "Materialise NV",
          weight: "1.8902%",
        },
        {
          symbol: "VCYT",
          name: "Veracyte Inc",
          weight: "1.8083%",
        },
        {
          symbol: "PD",
          name: "PagerDuty Inc",
          weight: "1.7676%",
        },
        {
          symbol: "PSTG",
          name: "Pure Storage Inc",
          weight: "1.6588%",
        },
        {
          symbol: "SYRS",
          name: "Syros Pharmaceuticals Inc",
          weight: "1.1053%",
        },
        {
          symbol: "IRDM",
          name: "Iridium Communications Inc",
          weight: "1.0329%",
        },
        {
          symbol: "MCRB",
          name: "Seres Therapeutics Inc",
          weight: "0.749%",
        },
        {
          symbol: "LC",
          name: "LendingClub Corp",
          weight: "0.7336%",
        },
        {
          symbol: "ZS",
          name: "Zscaler Inc",
          weight: "0.7274%",
        },
        {
          symbol: "XONE",
          name: "ExOne Co",
          weight: "0.4183%",
        },
        {
          symbol: "ONVO",
          name: "Organovo Holdings Inc",
          weight: "0.2215%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.1863%",
        },
      ],
      parent: {
        firm_name: "ARK ETF Trust",
        market: "US ETFs",
        total_net_assets: 3.27,
        fund_flows: 0.70277,
        asset_growth_rate: 25,
        number_of_funds: 7,
        manager_retention_rate: 100,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids a good amount of activities that client wants to avoid.",
    },
  },
  {
    score: 7.666,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.5,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 100.04,
        },
        {
          idea: "renewable_energy",
          involvement: -0.04,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 5.83,
      security_score: 10,
    },
    etf: {
      id: 17,
      ticker: "FBT",
      index_type: "sectoral",
      name: "First Trust Amex Biotech Index Fund",
      stock_exchange: "ARCA",
      dividend_yield: -10000,
      expense_ratio: 0.57,
      inception_date: "2006-06-19T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 100,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 51.06,
        },
        {
          idea: "better_health",
          involvement: 64.65,
        },
        {
          idea: "biotechnology",
          involvement: 100.04,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 28.62,
        },
        {
          idea: "low_carbon",
          involvement: 45.96,
        },
        {
          idea: "renewable_energy",
          involvement: -0.04,
        },
        {
          idea: "smart_cities",
          involvement: -0.04,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.35,
        sortino_ratio: 1.02,
        beta: 1.09,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "EXEL",
          name: "Exelixis Inc",
          weight: "4.4385%",
        },
        {
          symbol: "RARE",
          name: "Ultragenyx Pharmaceutical Inc",
          weight: "3.6787%",
        },
        {
          symbol: "BMRN",
          name: "Biomarin Pharmaceutical Inc",
          weight: "3.5522%",
        },
        {
          symbol: "SGEN",
          name: "Seattle Genetics Inc",
          weight: "3.4722%",
        },
        {
          symbol: "UTHR",
          name: "United Therapeutics Corp",
          weight: "3.4574%",
        },
        {
          symbol: "IONS",
          name: "Ionis Pharmaceuticals Inc",
          weight: "3.4344%",
        },
        {
          symbol: "BLUE",
          name: "bluebird bio Inc",
          weight: "3.4199%",
        },
        {
          symbol: "ALNY",
          name: "Alnylam Pharmaceuticals Inc",
          weight: "3.4195%",
        },
        {
          symbol: "ALXN",
          name: "Alexion Pharmaceuticals Inc",
          weight: "3.3974%",
        },
        {
          symbol: "ACAD",
          name: "ACADIA Pharmaceuticals Inc",
          weight: "3.387%",
        },
        {
          symbol: "INCY",
          name: "Incyte Corp",
          weight: "3.3658%",
        },
        {
          symbol: "FGEN",
          name: "FibroGen Inc",
          weight: "3.3485%",
        },
        {
          symbol: "ICPT",
          name: "Intercept Pharmaceuticals Inc",
          weight: "3.3416%",
        },
        {
          symbol: "SRPT",
          name: "Sarepta Therapeutics Inc",
          weight: "3.3338%",
        },
        {
          symbol: "AGIO",
          name: "Agios Pharmaceuticals Inc",
          weight: "3.3322%",
        },
        {
          symbol: "QGEN",
          name: "Qiagen NV",
          weight: "3.3098%",
        },
        {
          symbol: "EXAS",
          name: "Exact Sciences Corp",
          weight: "3.2881%",
        },
        {
          symbol: "NKTR",
          name: "Nektar Therapeutics",
          weight: "3.2806%",
        },
        {
          symbol: "AMGN",
          name: "Amgen Inc",
          weight: "3.2681%",
        },
        {
          symbol: "VRTX",
          name: "Vertex Pharmaceuticals Inc",
          weight: "3.2444%",
        },
        {
          symbol: "REGN",
          name: "Regeneron Pharmaceuticals Inc",
          weight: "3.2329%",
        },
        {
          symbol: "NBIX",
          name: "Neurocrine Biosciences Inc",
          weight: "3.2274%",
        },
        {
          symbol: "ALKS",
          name: "Alkermes Plc",
          weight: "3.1947%",
        },
        {
          symbol: "IQV",
          name: "IQVIA Holdings Inc",
          weight: "3.1861%",
        },
        {
          symbol: "ILMN",
          name: "Illumina Inc",
          weight: "3.1765%",
        },
        {
          symbol: "GRFS",
          name: "Grifols SA",
          weight: "3.1467%",
        },
        {
          symbol: "GILD",
          name: "Gilead Sciences Inc",
          weight: "3.085%",
        },
        {
          symbol: "CRL",
          name: "Charles River Laboratories International Inc",
          weight: "3.0716%",
        },
        {
          symbol: "TECH",
          name: "Bio-Techne Corp",
          weight: "3.069%",
        },
        {
          symbol: "BIIB",
          name: "Biogen Inc",
          weight: "2.8276%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.0125%",
        },
      ],
      parent: {
        firm_name: "First Trust",
        market: "US ETFs",
        total_net_assets: 70.01,
        fund_flows: 9.8,
        asset_growth_rate: 13.66,
        number_of_funds: 151,
        manager_retention_rate: 96.11,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.66245,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.47225,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 98.89,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 5.84,
      security_score: 10,
    },
    etf: {
      id: 183,
      ticker: "BTEC",
      index_type: "thematic",
      name: "Principal Healthcare Innovators Index ETF",
      stock_exchange: "NASDAQ",
      dividend_yield: -10000,
      expense_ratio: 0.42,
      inception_date: "2016-08-19T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 78.87,
        },
        {
          sector: "energy",
          involvement: 0.1,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 21.69,
        },
        {
          idea: "better_health",
          involvement: 45.6,
        },
        {
          idea: "biotechnology",
          involvement: 98.89,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 5.15,
        },
        {
          idea: "low_carbon",
          involvement: 13.28,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
        {
          idea: "smart_cities",
          involvement: 0.81,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0.22,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.48,
        sortino_ratio: 0.84,
        beta: 1.26,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "DXCM",
          name: "DexCom Inc",
          weight: "5.0388%",
        },
        {
          symbol: "BMRN",
          name: "Biomarin Pharmaceutical Inc",
          weight: "3.6672%",
        },
        {
          symbol: "SGEN",
          name: "Seattle Genetics Inc",
          weight: "3.5301%",
        },
        {
          symbol: "ALNY",
          name: "Alnylam Pharmaceuticals Inc",
          weight: "3.3742%",
        },
        {
          symbol: "TDOC",
          name: "Teladoc Health Inc",
          weight: "2.6176%",
        },
        {
          symbol: "MRNA",
          name: "Moderna Inc",
          weight: "2.6049%",
        },
        {
          symbol: "SRPT",
          name: "Sarepta Therapeutics Inc",
          weight: "2.3252%",
        },
        {
          symbol: "AVTR",
          name: "Avantor Inc",
          weight: "2.2973%",
        },
        {
          symbol: "MYL",
          name: "Mylan NV",
          weight: "2.0422%",
        },
        {
          symbol: "IONS",
          name: "Ionis Pharmaceuticals Inc",
          weight: "2.0231%",
        },
        {
          symbol: "GH",
          name: "Guardant Health Inc",
          weight: "1.9403%",
        },
        {
          symbol: "EXAS",
          name: "Exact Sciences Corp",
          weight: "1.9054%",
        },
        {
          symbol: "NVCR",
          name: "Novocure Ltd",
          weight: "1.8297%",
        },
        {
          symbol: "HZNP",
          name: "Horizon Therapeutics PLC",
          weight: "1.748%",
        },
        {
          symbol: "SYNH",
          name: "Syneos Health Inc",
          weight: "1.7368%",
        },
        {
          symbol: "ACAD",
          name: "ACADIA Pharmaceuticals Inc",
          weight: "1.619%",
        },
        {
          symbol: "XLRN",
          name: "Acceleron Pharma Inc",
          weight: "1.2897%",
        },
        {
          symbol: "IOVA",
          name: "Iovance Biotherapeutics Inc",
          weight: "1.2864%",
        },
        {
          symbol: "RETA",
          name: "Reata Pharmaceuticals Inc",
          weight: "1.1987%",
        },
        {
          symbol: "TNDM",
          name: "Tandem Diabetes Care Inc",
          weight: "1.1837%",
        },
        {
          symbol: "NVRO",
          name: "Nevro Corp",
          weight: "1.0621%",
        },
        {
          symbol: "GBT",
          name: "Global Blood Therapeutics Inc",
          weight: "1.0485%",
        },
        {
          symbol: "BLUE",
          name: "bluebird bio Inc",
          weight: "1.0067%",
        },
        {
          symbol: "MRTX",
          name: "Mirati Therapeutics Inc",
          weight: "0.9262%",
        },
        {
          symbol: "FGEN",
          name: "FibroGen Inc",
          weight: "0.9238%",
        },
        {
          symbol: "NKTR",
          name: "Nektar Therapeutics",
          weight: "0.9235%",
        },
        {
          symbol: "ALLO",
          name: "Allogene Therapeutics Inc",
          weight: "0.8797%",
        },
        {
          symbol: "PTCT",
          name: "PTC Therapeutics Inc",
          weight: "0.8669%",
        },
        {
          symbol: "ARWR",
          name: "Arrowhead Pharmaceuticals Inc",
          weight: "0.8511%",
        },
        {
          symbol: "IMMU",
          name: "Immunomedics Inc",
          weight: "0.8421%",
        },
        {
          symbol: "MNTA",
          name: "Momenta Pharmaceuticals Inc",
          weight: "0.8219%",
        },
        {
          symbol: "EBS",
          name: "Emergent BioSolutions Inc",
          weight: "0.8092%",
        },
        {
          symbol: "ICPT",
          name: "Intercept Pharmaceuticals Inc",
          weight: "0.8012%",
        },
        {
          symbol: "ALKS",
          name: "Alkermes Plc",
          weight: "0.7983%",
        },
        {
          symbol: "ALLK",
          name: "Allakos Inc",
          weight: "0.7942%",
        },
        {
          symbol: "RARE",
          name: "Ultragenyx Pharmaceutical Inc",
          weight: "0.7759%",
        },
        {
          symbol: "MYOK",
          name: "MyoKardia Inc",
          weight: "0.7744%",
        },
        {
          symbol: "AXSM",
          name: "Axsome Therapeutics Inc",
          weight: "0.7698%",
        },
        {
          symbol: "HALO",
          name: "Halozyme Therapeutics Inc",
          weight: "0.7624%",
        },
        {
          symbol: "BPMC",
          name: "Blueprint Medicines Corp",
          weight: "0.754%",
        },
        {
          symbol: "CRSP",
          name: "CRISPR Therapeutics AG",
          weight: "0.743%",
        },
        {
          symbol: "CCXI",
          name: "ChemoCentryx Inc",
          weight: "0.7373%",
        },
        {
          symbol: "AGIO",
          name: "Agios Pharmaceuticals Inc",
          weight: "0.7359%",
        },
        {
          symbol: "NTRA",
          name: "Natera Inc",
          weight: "0.7189%",
        },
        {
          symbol: "THC",
          name: "Tenet Healthcare Corp",
          weight: "0.7147%",
        },
        {
          symbol: "DCPH",
          name: "Deciphera Pharmaceuticals Inc",
          weight: "0.6865%",
        },
        {
          symbol: "SAGE",
          name: "SAGE Therapeutics Inc",
          weight: "0.6635%",
        },
        {
          symbol: "FOLD",
          name: "Amicus Therapeutics Inc",
          weight: "0.6459%",
        },
        {
          symbol: "BHVN",
          name: "Biohaven Pharmaceutical Holding Company Ltd",
          weight: "0.645%",
        },
        {
          symbol: "IRTC",
          name: "iRhythm Technologies Inc",
          weight: "0.637%",
        },
        {
          symbol: "ARNA",
          name: "Arena Pharmaceuticals Inc",
          weight: "0.6126%",
        },
        {
          symbol: "APLS",
          name: "Apellis Pharmaceuticals Inc",
          weight: "0.5868%",
        },
        {
          symbol: "INSM",
          name: "Insmed Inc",
          weight: "0.5512%",
        },
        {
          symbol: "LGND",
          name: "Ligand Pharmaceuticals Inc",
          weight: "0.547%",
        },
        {
          symbol: "INSP",
          name: "Inspire Medical Systems Inc",
          weight: "0.5376%",
        },
        {
          symbol: "ALEC",
          name: "Alector Inc",
          weight: "0.5353%",
        },
        {
          symbol: "QURE",
          name: "Uniqure NV",
          weight: "0.5279%",
        },
        {
          symbol: "EPZM",
          name: "Epizyme Inc",
          weight: "0.5276%",
        },
        {
          symbol: "FATE",
          name: "Fate Therapeutics Inc",
          weight: "0.5148%",
        },
        {
          symbol: "IRWD",
          name: "Ironwood Pharmaceuticals Inc",
          weight: "0.5115%",
        },
        {
          symbol: "XNCR",
          name: "Xencor Inc",
          weight: "0.4778%",
        },
        {
          symbol: "EIDX",
          name: "Eidos Therapeutics Inc",
          weight: "0.4756%",
        },
        {
          symbol: "NVTA",
          name: "Invitae Corp",
          weight: "0.4737%",
        },
        {
          symbol: "DNLI",
          name: "Denali Therapeutics Inc",
          weight: "0.4662%",
        },
        {
          symbol: "TPTX",
          name: "Turning Point Therapeutics Inc",
          weight: "0.4503%",
        },
        {
          symbol: "ARVN",
          name: "Arvinas Inc",
          weight: "0.4465%",
        },
        {
          symbol: "TCDA",
          name: "Tricida Inc",
          weight: "0.4325%",
        },
        {
          symbol: "AVNS",
          name: "Avanos Medical Inc",
          weight: "0.4196%",
        },
        {
          symbol: "KPTI",
          name: "Karyopharm Therapeutics Inc",
          weight: "0.4142%",
        },
        {
          symbol: "TBPH",
          name: "Theravance Biopharma Inc",
          weight: "0.3957%",
        },
        {
          symbol: "PRNB",
          name: "Principia Biopharma Inc",
          weight: "0.3935%",
        },
        {
          symbol: "RGNX",
          name: "Regenxbio Inc",
          weight: "0.3914%",
        },
        {
          symbol: "OPK",
          name: "OPKO Health Inc",
          weight: "0.3818%",
        },
        {
          symbol: "GKOS",
          name: "Glaukos Corp",
          weight: "0.389%",
        },
        {
          symbol: "ATRC",
          name: "AtriCure Inc",
          weight: "0.384%",
        },
        {
          symbol: "RCM",
          name: "R1 RCM Inc",
          weight: "0.3708%",
        },
        {
          symbol: "ESPR",
          name: "Esperion Therapeutics Inc",
          weight: "0.3658%",
        },
        {
          symbol: "CHRS",
          name: "Coherus BioSciences Inc",
          weight: "0.3625%",
        },
        {
          symbol: "MD",
          name: "MEDNAX Inc",
          weight: "0.3608%",
        },
        {
          symbol: "DRNA",
          name: "Dicerna Pharmaceuticals Inc",
          weight: "0.3603%",
        },
        {
          symbol: "HRTX",
          name: "Heron Therapeutics Inc",
          weight: "0.3522%",
        },
        {
          symbol: "MDGL",
          name: "Madrigal Pharmaceuticals Inc",
          weight: "0.353%",
        },
        {
          symbol: "AIMT",
          name: "Aimmune Therapeutics Inc",
          weight: "0.3457%",
        },
        {
          symbol: "NSTG",
          name: "NanoString Technologies Inc",
          weight: "0.3412%",
        },
        {
          symbol: "EDIT",
          name: "Editas Medicine Inc",
          weight: "0.3177%",
        },
        {
          symbol: "ITCI",
          name: "Intra-Cellular Therapies Inc",
          weight: "0.3118%",
        },
        {
          symbol: "VCYT",
          name: "Veracyte Inc",
          weight: "0.3092%",
        },
        {
          symbol: "TGTX",
          name: "TG Therapeutics Inc",
          weight: "0.3064%",
        },
        {
          symbol: "TWST",
          name: "Twist Bioscience Corp",
          weight: "0.3062%",
        },
        {
          symbol: "SWAV",
          name: "Shockwave Medical Inc",
          weight: "0.297%",
        },
        {
          symbol: "AKBA",
          name: "Akebia Therapeutics Inc",
          weight: "0.2877%",
        },
        {
          symbol: "ENTA",
          name: "Enanta Pharmaceuticals Inc",
          weight: "0.2862%",
        },
        {
          symbol: "ZGNX",
          name: "Zogenix Inc",
          weight: "0.2754%",
        },
        {
          symbol: "AXNX",
          name: "Axonics Modulation Technologies Inc",
          weight: "0.2741%",
        },
        {
          symbol: "RVNC",
          name: "Revance Therapeutics Inc",
          weight: "0.2694%",
        },
        {
          symbol: "CDNA",
          name: "CareDx Inc",
          weight: "0.2649%",
        },
        {
          symbol: "RCKT",
          name: "Rocket Pharmaceuticals Inc",
          weight: "0.2636%",
        },
        {
          symbol: "SGMO",
          name: "Sangamo Therapeutics Inc",
          weight: "0.2553%",
        },
        {
          symbol: "CRY",
          name: "CryoLife Inc",
          weight: "0.2514%",
        },
        {
          symbol: "NTUS",
          name: "Natus Medical Inc",
          weight: "0.247%",
        },
        {
          symbol: "KRYS",
          name: "Krystal Biotech Inc",
          weight: "0.246%",
        },
        {
          symbol: "FIXX",
          name: "Homology Medicines Inc",
          weight: "0.244%",
        },
        {
          symbol: "ATNX",
          name: "Athenex Inc",
          weight: "0.241%",
        },
        {
          symbol: "OMER",
          name: "Omeros Corp",
          weight: "0.2387%",
        },
        {
          symbol: "CYTK",
          name: "Cytokinetics Inc",
          weight: "0.2259%",
        },
        {
          symbol: "GOSS",
          name: "Gossamer Bio Inc",
          weight: "0.2238%",
        },
        {
          symbol: "BKD",
          name: "Brookdale Senior Living Inc",
          weight: "0.2238%",
        },
        {
          symbol: "STOK",
          name: "Stoke Therapeutics Inc",
          weight: "0.2222%",
        },
        {
          symbol: "RDUS",
          name: "Radius Health Inc",
          weight: "0.2156%",
        },
        {
          symbol: "CERS",
          name: "Cerus Corp",
          weight: "0.2058%",
        },
        {
          symbol: "ADVM",
          name: "Adverum Biotechnologies Inc",
          weight: "0.2049%",
        },
        {
          symbol: "XENT",
          name: "Intersect Ent Inc",
          weight: "0.2028%",
        },
        {
          symbol: "HSKA",
          name: "Heska Corp",
          weight: "0.1962%",
        },
        {
          symbol: "PTLA",
          name: "Portola Pharmaceuticals Inc",
          weight: "0.1937%",
        },
        {
          symbol: "COLL",
          name: "Collegium Pharmaceutical Inc",
          weight: "0.1926%",
        },
        {
          symbol: "NTLA",
          name: "Intellia Therapeutics Inc",
          weight: "0.1901%",
        },
        {
          symbol: "CARA",
          name: "Cara Therapeutics Inc",
          weight: "0.1893%",
        },
        {
          symbol: "AERI",
          name: "Aerie Pharmaceuticals Inc",
          weight: "0.1862%",
        },
        {
          symbol: "AXDX",
          name: "Accelerate Diagnostics Inc",
          weight: "0.1796%",
        },
        {
          symbol: "ATRA",
          name: "Atara Biotherapeutics Inc",
          weight: "0.1792%",
        },
        {
          symbol: "AVRO",
          name: "AVROBIO Inc",
          weight: "0.1723%",
        },
        {
          symbol: "RTRX",
          name: "Retrophin Inc",
          weight: "0.1723%",
        },
        {
          symbol: "RUBY",
          name: "Rubius Therapeutics Inc",
          weight: "0.1661%",
        },
        {
          symbol: "VCEL",
          name: "Vericel Corp",
          weight: "0.1654%",
        },
        {
          symbol: "CYH",
          name: "Community Health Systems Inc",
          weight: "0.1643%",
        },
        {
          symbol: "GTHX",
          name: "G1 Therapeutics Inc",
          weight: "0.1616%",
        },
        {
          symbol: "RYTM",
          name: "Rhythm Pharmaceuticals Inc",
          weight: "0.167%",
        },
        {
          symbol: "IMGN",
          name: "ImmunoGen Inc",
          weight: "0.168%",
        },
        {
          symbol: "QTRX",
          name: "Quanterix Corp",
          weight: "0.1589%",
        },
        {
          symbol: "ZIOP",
          name: "ZIOPHARM Oncology Inc",
          weight: "0.1544%",
        },
        {
          symbol: "VNDA",
          name: "Vanda Pharmaceuticals Inc",
          weight: "0.1494%",
        },
        {
          symbol: "FLXN",
          name: "Flexion Therapeutics Inc",
          weight: "0.1473%",
        },
        {
          symbol: "SGRY",
          name: "Surgery Partners Inc",
          weight: "0.1426%",
        },
        {
          symbol: "ASMB",
          name: "Assembly Biosciences Inc",
          weight: "0.1418%",
        },
        {
          symbol: "KURA",
          name: "Kura Oncology Inc",
          weight: "0.1327%",
        },
        {
          symbol: "ANAB",
          name: "AnaptysBio Inc",
          weight: "0.1322%",
        },
        {
          symbol: "PGEN",
          name: "Precigen Inc",
          weight: "0.133%",
        },
        {
          symbol: "AXGN",
          name: "AxoGen Inc",
          weight: "0.1254%",
        },
        {
          symbol: "BCRX",
          name: "BioCryst Pharmaceuticals Inc",
          weight: "0.1214%",
        },
        {
          symbol: "CVM",
          name: "CEL-SCI Corp",
          weight: "0.128%",
        },
        {
          symbol: "AMRX",
          name: "Amneal Pharmaceuticals Inc",
          weight: "0.1185%",
        },
        {
          symbol: "CLVS",
          name: "Clovis Oncology Inc",
          weight: "0.1148%",
        },
        {
          symbol: "VKTX",
          name: "Viking Therapeutics Inc",
          weight: "0.112%",
        },
        {
          symbol: "CPRX",
          name: "Catalyst Pharmaceuticals Inc",
          weight: "0.1088%",
        },
        {
          symbol: "PBYI",
          name: "Puma Biotechnology Inc",
          weight: "0.1088%",
        },
        {
          symbol: "VYGR",
          name: "Voyager Therapeutics Inc",
          weight: "0.1086%",
        },
        {
          symbol: "TXMD",
          name: "TherapeuticsMD Inc",
          weight: "0.109%",
        },
        {
          symbol: "RIGL",
          name: "Rigel Pharmaceuticals Inc",
          weight: "0.0995%",
        },
        {
          symbol: "MGNX",
          name: "MacroGenics Inc",
          weight: "0.0972%",
        },
        {
          symbol: "AMRS",
          name: "Amyris Inc",
          weight: "0.0974%",
        },
        {
          symbol: "DVAX",
          name: "Dynavax Technologies Corp",
          weight: "0.0945%",
        },
        {
          symbol: "OMI",
          name: "Owens & Minor Inc",
          weight: "0.0944%",
        },
        {
          symbol: "AGEN",
          name: "Agenus Inc",
          weight: "0.0896%",
        },
        {
          symbol: "CTMX",
          name: "CytomX Therapeutics Inc",
          weight: "0.0848%",
        },
        {
          symbol: "CUTR",
          name: "Cutera Inc",
          weight: "0.0843%",
        },
        {
          symbol: "SPPI",
          name: "Spectrum Pharmaceuticals Inc",
          weight: "0.0842%",
        },
        {
          symbol: "SENS",
          name: "Senseonics Holdings Inc",
          weight: "0.0793%",
        },
        {
          symbol: "CRBP",
          name: "Corbus Pharmaceuticals Holdings Inc",
          weight: "0.0784%",
        },
        {
          symbol: "SRNE",
          name: "Sorrento Therapeutics Inc",
          weight: "0.0774%",
        },
        {
          symbol: "PSNL",
          name: "Personalis Inc",
          weight: "0.0724%",
        },
        {
          symbol: "STML",
          name: "Stemline Therapeutics Inc",
          weight: "0.0724%",
        },
        {
          symbol: "AMAG",
          name: "AMAG Pharmaceuticals Inc",
          weight: "0.0698%",
        },
        {
          symbol: "MNKD",
          name: "MannKind Corp",
          weight: "0.0679%",
        },
        {
          symbol: "VRAY",
          name: "ViewRay Inc",
          weight: "0.0677%",
        },
        {
          symbol: "IVC",
          name: "Invacare Corp",
          weight: "0.0666%",
        },
        {
          symbol: "FLDM",
          name: "Fluidigm Corp",
          weight: "0.0553%",
        },
        {
          symbol: "EOLS",
          name: "Evolus Inc",
          weight: "0.0531%",
        },
        {
          symbol: "CHMA",
          name: "Chiasma Inc",
          weight: "0.0512%",
        },
        {
          symbol: "SOLY",
          name: "Soliton Inc",
          weight: "0.0495%",
        },
        {
          symbol: "SIEN",
          name: "Sientra Inc",
          weight: "0.0487%",
        },
        {
          symbol: "LJPC",
          name: "La Jolla Pharmaceutical Co",
          weight: "0.0425%",
        },
        {
          symbol: "SLDB",
          name: "Solid Biosciences Inc",
          weight: "0.0391%",
        },
        {
          symbol: "CRMD",
          name: "CorMedix Inc",
          weight: "0.0372%",
        },
        {
          symbol: "AKRX",
          name: "Akorn Inc",
          weight: "0.0327%",
        },
        {
          symbol: "CBAY",
          name: "Cymabay Therapeutics Inc",
          weight: "0.0313%",
        },
        {
          symbol: "ACRX",
          name: "AcelRx Pharmaceuticals Inc",
          weight: "0.0304%",
        },
        {
          symbol: "ADMS",
          name: "Adamas Pharmaceuticals Inc",
          weight: "0.0288%",
        },
        {
          symbol: "ZYNE",
          name: "Zynerba Pharmaceuticals Inc",
          weight: "0.025%",
        },
        {
          symbol: "ASRT",
          name: "Assertio Therapeutics Inc",
          weight: "0.0197%",
        },
        {
          symbol: "ACOR",
          name: "Acorda Therapeutics Inc",
          weight: "0.0151%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.0029%",
        },
        {
          symbol: "GLYC",
          name: "GlycoMimetics Inc",
          weight: "0.04%",
        },
      ],
      parent: {
        firm_name: "Principal Funds",
        market: "US ETFs",
        total_net_assets: 3.18,
        fund_flows: -0.21881,
        asset_growth_rate: -6.59,
        number_of_funds: 16,
        manager_retention_rate: 92.23,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.613333333333333,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.5,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 100,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 5.566666666666666,
      security_score: 10,
    },
    etf: {
      id: 181,
      ticker: "BBH",
      index_type: "thematic",
      name: "VanEck Vectors Biotech ETF",
      stock_exchange: "NASDAQ",
      dividend_yield: 0.33,
      expense_ratio: 0.35,
      inception_date: "2011-12-20T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 97.82,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 66.21,
        },
        {
          idea: "better_health",
          involvement: 64.24,
        },
        {
          idea: "biotechnology",
          involvement: 100,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 46.52,
        },
        {
          idea: "low_carbon",
          involvement: 68.58,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
        {
          idea: "smart_cities",
          involvement: 0,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.2,
        sortino_ratio: 0.85,
        beta: 1.04,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "AMGN",
          name: "Amgen Inc",
          weight: "10.8826%",
        },
        {
          symbol: "GILD",
          name: "Gilead Sciences Inc",
          weight: "8.5952%",
        },
        {
          symbol: "REGN",
          name: "Regeneron Pharmaceuticals Inc",
          weight: "6.6995%",
        },
        {
          symbol: "AGN",
          name: "Allergan plc",
          weight: "6.1201%",
        },
        {
          symbol: "BIIB",
          name: "Biogen Inc",
          weight: "5.5047%",
        },
        {
          symbol: "VRTX",
          name: "Vertex Pharmaceuticals Inc",
          weight: "5.3708%",
        },
        {
          symbol: "BMRN",
          name: "Biomarin Pharmaceutical Inc",
          weight: "4.8344%",
        },
        {
          symbol: "IQV",
          name: "IQVIA Holdings Inc",
          weight: "4.7863%",
        },
        {
          symbol: "ILMN",
          name: "Illumina Inc",
          weight: "4.3308%",
        },
        {
          symbol: "SGEN",
          name: "Seattle Genetics Inc",
          weight: "4.2154%",
        },
        {
          symbol: "QGEN",
          name: "Qiagen NV",
          weight: "3.9799%",
        },
        {
          symbol: "ALXN",
          name: "Alexion Pharmaceuticals Inc",
          weight: "3.8262%",
        },
        {
          symbol: "ALNY",
          name: "Alnylam Pharmaceuticals Inc",
          weight: "3.6782%",
        },
        {
          symbol: "INCY",
          name: "Incyte Corp",
          weight: "3.6478%",
        },
        {
          symbol: "EXAS",
          name: "Exact Sciences Corp",
          weight: "3.5066%",
        },
        {
          symbol: "CRL",
          name: "Charles River Laboratories International Inc",
          weight: "3.3275%",
        },
        {
          symbol: "SRPT",
          name: "Sarepta Therapeutics Inc",
          weight: "3.3066%",
        },
        {
          symbol: "GRFS",
          name: "Grifols SA",
          weight: "2.8176%",
        },
        {
          symbol: "NBIX",
          name: "Neurocrine Biosciences Inc",
          weight: "2.7282%",
        },
        {
          symbol: "GH",
          name: "Guardant Health Inc",
          weight: "2.1754%",
        },
        {
          symbol: "BGNE",
          name: "Beigene Ltd",
          weight: "2.14%",
        },
        {
          symbol: "IONS",
          name: "Ionis Pharmaceuticals Inc",
          weight: "1.5812%",
        },
        {
          symbol: "UTHR",
          name: "United Therapeutics Corp",
          weight: "1.4905%",
        },
        {
          symbol: "BLUE",
          name: "bluebird bio Inc",
          weight: "0.4553%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.0006%",
        },
      ],
      parent: {
        firm_name: "VanEck",
        market: "US ETFs",
        total_net_assets: 40.37,
        fund_flows: 0.32198000000000004,
        asset_growth_rate: 0.88,
        number_of_funds: 58,
        manager_retention_rate: 90.48,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.562333333333333,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.495,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 99.64,
        },
        {
          idea: "renewable_energy",
          involvement: 0.16,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 5.316666666666666,
      security_score: 10,
    },
    etf: {
      id: 21,
      ticker: "IBB",
      index_type: "sectoral",
      name: "iShares Nasdaq Biotechnology Index Fund",
      stock_exchange: "NASDAQ",
      dividend_yield: 0.21,
      expense_ratio: 0.47,
      inception_date: "2001-02-05T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 88.51,
        },
        {
          sector: "energy",
          involvement: 0.05,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 51.59,
        },
        {
          idea: "better_health",
          involvement: 64.42,
        },
        {
          idea: "biotechnology",
          involvement: 99.64,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 35.5,
        },
        {
          idea: "low_carbon",
          involvement: 51.4,
        },
        {
          idea: "renewable_energy",
          involvement: 0.16,
        },
        {
          idea: "smart_cities",
          involvement: 0.37,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0.14,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.19,
        sortino_ratio: 0.49,
        beta: 0.92,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "GILD",
          name: "Gilead Sciences Inc",
          weight: "9.1464%",
        },
        {
          symbol: "VRTX",
          name: "Vertex Pharmaceuticals Inc",
          weight: "8.0556%",
        },
        {
          symbol: "AMGN",
          name: "Amgen Inc",
          weight: "7.7736%",
        },
        {
          symbol: "BIIB",
          name: "Biogen Inc",
          weight: "6.238%",
        },
        {
          symbol: "REGN",
          name: "Regeneron Pharmaceuticals Inc",
          weight: "5.9248%",
        },
        {
          symbol: "ILMN",
          name: "Illumina Inc",
          weight: "5.2741%",
        },
        {
          symbol: "SGEN",
          name: "Seattle Genetics Inc",
          weight: "2.9437%",
        },
        {
          symbol: "ALXN",
          name: "Alexion Pharmaceuticals Inc",
          weight: "2.8139%",
        },
        {
          symbol: "INCY",
          name: "Incyte Corp",
          weight: "2.6214%",
        },
        {
          symbol: "BMRN",
          name: "Biomarin Pharmaceutical Inc",
          weight: "2.0557%",
        },
        {
          symbol: "MRNA",
          name: "Moderna Inc",
          weight: "1.9793%",
        },
        {
          symbol: "ALNY",
          name: "Alnylam Pharmaceuticals Inc",
          weight: "1.9096%",
        },
        {
          symbol: "SNY",
          name: "Sanofi SA",
          weight: "1.2241%",
        },
        {
          symbol: "SRPT",
          name: "Sarepta Therapeutics Inc",
          weight: "1.0655%",
        },
        {
          symbol: "NBIX",
          name: "Neurocrine Biosciences Inc",
          weight: "1.0634%",
        },
        {
          symbol: "IONS",
          name: "Ionis Pharmaceuticals Inc",
          weight: "0.962%",
        },
        {
          symbol: "MYL",
          name: "Mylan NV",
          weight: "0.9567%",
        },
        {
          symbol: "EXEL",
          name: "Exelixis Inc",
          weight: "0.948%",
        },
        {
          symbol: "ACAD",
          name: "ACADIA Pharmaceuticals Inc",
          weight: "0.9226%",
        },
        {
          symbol: "TECH",
          name: "Bio-Techne Corp",
          weight: "0.9048%",
        },
        {
          symbol: "NVCR",
          name: "Novocure Ltd",
          weight: "0.8518%",
        },
        {
          symbol: "GH",
          name: "Guardant Health Inc",
          weight: "0.8414%",
        },
        {
          symbol: "BGNE",
          name: "Beigene Ltd",
          weight: "0.7623%",
        },
        {
          symbol: "HZNP",
          name: "Horizon Therapeutics PLC",
          weight: "0.7333%",
        },
        {
          symbol: "JAZZ",
          name: "Jazz Pharmaceuticals PLC",
          weight: "0.7129%",
        },
        {
          symbol: "ASND",
          name: "Ascendis Pharma A/S",
          weight: "0.6981%",
        },
        {
          symbol: "PRAH",
          name: "PRA Health Sciences Inc",
          weight: "0.6524%",
        },
        {
          symbol: "IMMU",
          name: "Immunomedics Inc",
          weight: "0.6467%",
        },
        {
          symbol: "XLRN",
          name: "Acceleron Pharma Inc",
          weight: "0.6212%",
        },
        {
          symbol: "SYNH",
          name: "Syneos Health Inc",
          weight: "0.6159%",
        },
        {
          symbol: "UTHR",
          name: "United Therapeutics Corp",
          weight: "0.5739%",
        },
        {
          symbol: "GBT",
          name: "Global Blood Therapeutics Inc",
          weight: "0.5688%",
        },
        {
          symbol: "IOVA",
          name: "Iovance Biotherapeutics Inc",
          weight: "0.5478%",
        },
        {
          symbol: "RETA",
          name: "Reata Pharmaceuticals Inc",
          weight: "0.5198%",
        },
        {
          symbol: "CBPO",
          name: "China Biologic Products Holdings Inc",
          weight: "0.4828%",
        },
        {
          symbol: "BBIO",
          name: "BridgeBio Pharma Inc",
          weight: "0.4518%",
        },
        {
          symbol: "ARWR",
          name: "Arrowhead Pharmaceuticals Inc",
          weight: "0.4378%",
        },
        {
          symbol: "MNTA",
          name: "Momenta Pharmaceuticals Inc",
          weight: "0.4281%",
        },
        {
          symbol: "ADPT",
          name: "Adaptive Biotechnologies Corp",
          weight: "0.4255%",
        },
        {
          symbol: "ALLO",
          name: "Allogene Therapeutics Inc",
          weight: "0.4244%",
        },
        {
          symbol: "FGEN",
          name: "FibroGen Inc",
          weight: "0.4193%",
        },
        {
          symbol: "BPMC",
          name: "Blueprint Medicines Corp",
          weight: "0.4091%",
        },
        {
          symbol: "NKTR",
          name: "Nektar Therapeutics",
          weight: "0.4055%",
        },
        {
          symbol: "HALO",
          name: "Halozyme Therapeutics Inc",
          weight: "0.4036%",
        },
        {
          symbol: "RARE",
          name: "Ultragenyx Pharmaceutical Inc",
          weight: "0.45%",
        },
        {
          symbol: "ALLK",
          name: "Allakos Inc",
          weight: "0.4001%",
        },
        {
          symbol: "MRTX",
          name: "Mirati Therapeutics Inc",
          weight: "0.3957%",
        },
        {
          symbol: "PTCT",
          name: "PTC Therapeutics Inc",
          weight: "0.3846%",
        },
        {
          symbol: "FOLD",
          name: "Amicus Therapeutics Inc",
          weight: "0.3842%",
        },
        {
          symbol: "BLUE",
          name: "bluebird bio Inc",
          weight: "0.3812%",
        },
        {
          symbol: "CRSP",
          name: "CRISPR Therapeutics AG",
          weight: "0.3777%",
        },
        {
          symbol: "AGIO",
          name: "Agios Pharmaceuticals Inc",
          weight: "0.3739%",
        },
        {
          symbol: "ARGX",
          name: "argenx SE",
          weight: "0.3706%",
        },
        {
          symbol: "GWPH",
          name: "GW Pharmaceuticals PLC",
          weight: "0.3627%",
        },
        {
          symbol: "MEDP",
          name: "Medpace Holdings Inc",
          weight: "0.3552%",
        },
        {
          symbol: "MYOK",
          name: "MyoKardia Inc",
          weight: "0.3525%",
        },
        {
          symbol: "CCXI",
          name: "ChemoCentryx Inc",
          weight: "0.3494%",
        },
        {
          symbol: "APLS",
          name: "Apellis Pharmaceuticals Inc",
          weight: "0.3246%",
        },
        {
          symbol: "ICPT",
          name: "Intercept Pharmaceuticals Inc",
          weight: "0.3215%",
        },
        {
          symbol: "QURE",
          name: "Uniqure NV",
          weight: "0.3165%",
        },
        {
          symbol: "AMRN",
          name: "Amarin Corporation PLC",
          weight: "0.3138%",
        },
        {
          symbol: "AXSM",
          name: "Axsome Therapeutics Inc",
          weight: "0.3101%",
        },
        {
          symbol: "ARNA",
          name: "Arena Pharmaceuticals Inc",
          weight: "0.3039%",
        },
        {
          symbol: "GRFS",
          name: "Grifols SA",
          weight: "0.3001%",
        },
        {
          symbol: "ALKS",
          name: "Alkermes Plc",
          weight: "0.2977%",
        },
        {
          symbol: "DCPH",
          name: "Deciphera Pharmaceuticals Inc",
          weight: "0.2883%",
        },
        {
          symbol: "ZLAB",
          name: "Zai Lab Ltd",
          weight: "0.2774%",
        },
        {
          symbol: "KOD",
          name: "Kodiak Sciences Inc",
          weight: "0.2754%",
        },
        {
          symbol: "FATE",
          name: "Fate Therapeutics Inc",
          weight: "0.2731%",
        },
        {
          symbol: "KRTX",
          name: "Karuna Therapeutics Inc",
          weight: "0.2651%",
        },
        {
          symbol: "DNLI",
          name: "Denali Therapeutics Inc",
          weight: "0.2572%",
        },
        {
          symbol: "ARVN",
          name: "Arvinas Inc",
          weight: "0.2401%",
        },
        {
          symbol: "ALEC",
          name: "Alector Inc",
          weight: "0.2342%",
        },
        {
          symbol: "SAGE",
          name: "SAGE Therapeutics Inc",
          weight: "0.2323%",
        },
        {
          symbol: "PRNB",
          name: "Principia Biopharma Inc",
          weight: "0.2302%",
        },
        {
          symbol: "EIDX",
          name: "Eidos Therapeutics Inc",
          weight: "0.2292%",
        },
        {
          symbol: "INSM",
          name: "Insmed Inc",
          weight: "0.2224%",
        },
        {
          symbol: "TPTX",
          name: "Turning Point Therapeutics Inc",
          weight: "0.2182%",
        },
        {
          symbol: "EPZM",
          name: "Epizyme Inc",
          weight: "0.2079%",
        },
        {
          symbol: "GLPG",
          name: "Galapagos NV",
          weight: "0.2033%",
        },
        {
          symbol: "AUPH",
          name: "Aurinia Pharmaceuticals Inc",
          weight: "0.2026%",
        },
        {
          symbol: "XNCR",
          name: "Xencor Inc",
          weight: "0.2021%",
        },
        {
          symbol: "TBPH",
          name: "Theravance Biopharma Inc",
          weight: "0.2021%",
        },
        {
          symbol: "LGND",
          name: "Ligand Pharmaceuticals Inc",
          weight: "0.2016%",
        },
        {
          symbol: "AKCA",
          name: "Akcea Therapeutics Inc",
          weight: "0.1991%",
        },
        {
          symbol: "PCRX",
          name: "Pacira Biosciences Inc",
          weight: "0.1956%",
        },
        {
          symbol: "IRWD",
          name: "Ironwood Pharmaceuticals Inc",
          weight: "0.1897%",
        },
        {
          symbol: "LMNX",
          name: "Luminex Corp",
          weight: "0.1836%",
        },
        {
          symbol: "KPTI",
          name: "Karyopharm Therapeutics Inc",
          weight: "0.186%",
        },
        {
          symbol: "RGNX",
          name: "Regenxbio Inc",
          weight: "0.1791%",
        },
        {
          symbol: "DRNA",
          name: "Dicerna Pharmaceuticals Inc",
          weight: "0.1758%",
        },
        {
          symbol: "INO",
          name: "Inovio Pharmaceuticals Inc",
          weight: "0.1721%",
        },
        {
          symbol: "TCDA",
          name: "Tricida Inc",
          weight: "0.1624%",
        },
        {
          symbol: "YMAB",
          name: "Y-mAbs Therapeutics, Inc",
          weight: "0.1622%",
        },
        {
          symbol: "OPK",
          name: "OPKO Health Inc",
          weight: "0.1606%",
        },
        {
          symbol: "INVA",
          name: "Innoviva Inc",
          weight: "0.1584%",
        },
        {
          symbol: "ZGNX",
          name: "Zogenix Inc",
          weight: "0.1532%",
        },
        {
          symbol: "EDIT",
          name: "Editas Medicine Inc",
          weight: "0.1509%",
        },
        {
          symbol: "CHRS",
          name: "Coherus BioSciences Inc",
          weight: "0.143%",
        },
        {
          symbol: "AXNX",
          name: "Axonics Modulation Technologies Inc",
          weight: "0.1399%",
        },
        {
          symbol: "NGM",
          name: "NGM Biopharmaceuticals Inc",
          weight: "0.1377%",
        },
        {
          symbol: "ITCI",
          name: "Intra-Cellular Therapies Inc",
          weight: "0.1362%",
        },
        {
          symbol: "VCYT",
          name: "Veracyte Inc",
          weight: "0.1345%",
        },
        {
          symbol: "AIMT",
          name: "Aimmune Therapeutics Inc",
          weight: "0.1313%",
        },
        {
          symbol: "MYGN",
          name: "Myriad Genetics Inc",
          weight: "0.1269%",
        },
        {
          symbol: "TWST",
          name: "Twist Bioscience Corp",
          weight: "0.1249%",
        },
        {
          symbol: "ENTA",
          name: "Enanta Pharmaceuticals Inc",
          weight: "0.1245%",
        },
        {
          symbol: "NSTG",
          name: "NanoString Technologies Inc",
          weight: "0.1205%",
        },
        {
          symbol: "ESPR",
          name: "Esperion Therapeutics Inc",
          weight: "0.129%",
        },
        {
          symbol: "SGMO",
          name: "Sangamo Therapeutics Inc",
          weight: "0.1132%",
        },
        {
          symbol: "ADVM",
          name: "Adverum Biotechnologies Inc",
          weight: "0.113%",
        },
        {
          symbol: "SUPN",
          name: "Supernus Pharmaceuticals Inc",
          weight: "0.117%",
        },
        {
          symbol: "ENDP",
          name: "Endo International PLC",
          weight: "0.1102%",
        },
        {
          symbol: "CYTK",
          name: "Cytokinetics Inc",
          weight: "0.1091%",
        },
        {
          symbol: "CGEN",
          name: "Compugen Ltd",
          weight: "0.1086%",
        },
        {
          symbol: "AKBA",
          name: "Akebia Therapeutics Inc",
          weight: "0.1079%",
        },
        {
          symbol: "CERS",
          name: "Cerus Corp",
          weight: "0.1047%",
        },
        {
          symbol: "RVNC",
          name: "Revance Therapeutics Inc",
          weight: "0.1034%",
        },
        {
          symbol: "GOSS",
          name: "Gossamer Bio Inc",
          weight: "0.1037%",
        },
        {
          symbol: "RCKT",
          name: "Rocket Pharmaceuticals Inc",
          weight: "0.1026%",
        },
        {
          symbol: "HCM",
          name: "Hutchison China MediTech Ltd",
          weight: "0.1024%",
        },
        {
          symbol: "RYTM",
          name: "Rhythm Pharmaceuticals Inc",
          weight: "0.101%",
        },
        {
          symbol: "OMER",
          name: "Omeros Corp",
          weight: "0.0972%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.0963%",
        },
        {
          symbol: "AMPH",
          name: "Amphastar Pharmaceuticals Inc",
          weight: "0.0923%",
        },
        {
          symbol: "TBIO",
          name: "Translate Bio Inc",
          weight: "0.0897%",
        },
        {
          symbol: "QTRX",
          name: "Quanterix Corp",
          weight: "0.0895%",
        },
        {
          symbol: "RDUS",
          name: "Radius Health Inc",
          weight: "0.0892%",
        },
        {
          symbol: "CARA",
          name: "Cara Therapeutics Inc",
          weight: "0.0873%",
        },
        {
          symbol: "STOK",
          name: "Stoke Therapeutics Inc",
          weight: "0.0872%",
        },
        {
          symbol: "GMAB",
          name: "Genmab A/S",
          weight: "0.0852%",
        },
        {
          symbol: "NTLA",
          name: "Intellia Therapeutics Inc",
          weight: "0.0841%",
        },
        {
          symbol: "IMGN",
          name: "ImmunoGen Inc",
          weight: "0.0833%",
        },
        {
          symbol: "ATNX",
          name: "Athenex Inc",
          weight: "0.0831%",
        },
        {
          symbol: "EGRX",
          name: "Eagle Pharmaceuticals Inc",
          weight: "0.0829%",
        },
        {
          symbol: "COLL",
          name: "Collegium Pharmaceutical Inc",
          weight: "0.0815%",
        },
        {
          symbol: "ARDX",
          name: "Ardelyx Inc",
          weight: "0.0787%",
        },
        {
          symbol: "AERI",
          name: "Aerie Pharmaceuticals Inc",
          weight: "0.0778%",
        },
        {
          symbol: "RTRX",
          name: "Retrophin Inc",
          weight: "0.0768%",
        },
        {
          symbol: "VNDA",
          name: "Vanda Pharmaceuticals Inc",
          weight: "0.0751%",
        },
        {
          symbol: "ASMB",
          name: "Assembly Biosciences Inc",
          weight: "0.0696%",
        },
        {
          symbol: "PTLA",
          name: "Portola Pharmaceuticals Inc",
          weight: "0.0687%",
        },
        {
          symbol: "FIXX",
          name: "Homology Medicines Inc",
          weight: "0.0684%",
        },
        {
          symbol: "PETQ",
          name: "PetIQ Inc",
          weight: "0.0677%",
        },
        {
          symbol: "PGEN",
          name: "Precigen Inc",
          weight: "0.0666%",
        },
        {
          symbol: "XBIT",
          name: "XBiotech Inc",
          weight: "0.0664%",
        },
        {
          symbol: "AKRO",
          name: "Akero Therapeutics Inc",
          weight: "0.0655%",
        },
        {
          symbol: "BCRX",
          name: "BioCryst Pharmaceuticals Inc",
          weight: "0.0644%",
        },
        {
          symbol: "ACIU",
          name: "AC Immune SA",
          weight: "0.0632%",
        },
        {
          symbol: "AVRO",
          name: "AVROBIO Inc",
          weight: "0.0616%",
        },
        {
          symbol: "SRRK",
          name: "Scholar Rock Holding Corp",
          weight: "0.0613%",
        },
        {
          symbol: "PRVL",
          name: "Prevail Therapeutics Inc",
          weight: "0.0605%",
        },
        {
          symbol: "MGTX",
          name: "MeiraGTx Holdings PLC",
          weight: "0.0598%",
        },
        {
          symbol: "ANIP",
          name: "ANI Pharmaceuticals Inc",
          weight: "0.0597%",
        },
        {
          symbol: "GTHX",
          name: "G1 Therapeutics Inc",
          weight: "0.0594%",
        },
        {
          symbol: "CSTL",
          name: "Castle Biosciences Inc",
          weight: "0.0593%",
        },
        {
          symbol: "URGN",
          name: "Urogen Pharma Ltd",
          weight: "0.0592%",
        },
        {
          symbol: "PACB",
          name: "Pacific Biosciences of California Inc",
          weight: "0.0584%",
        },
        {
          symbol: "RUBY",
          name: "Rubius Therapeutics Inc",
          weight: "0.0576%",
        },
        {
          symbol: "SIGA",
          name: "SIGA Technologies Inc",
          weight: "0.0578%",
        },
        {
          symbol: "ATRA",
          name: "Atara Biotherapeutics Inc",
          weight: "0.0568%",
        },
        {
          symbol: "KURA",
          name: "Kura Oncology Inc",
          weight: "0.0561%",
        },
        {
          symbol: "PRTA",
          name: "Prothena Corporation PLC",
          weight: "0.0557%",
        },
        {
          symbol: "ANAB",
          name: "AnaptysBio Inc",
          weight: "0.0516%",
        },
        {
          symbol: "ORTX",
          name: "Orchard Therapeutics PLC",
          weight: "0.054%",
        },
        {
          symbol: "CRBP",
          name: "Corbus Pharmaceuticals Holdings Inc",
          weight: "0.0507%",
        },
        {
          symbol: "CTMX",
          name: "CytomX Therapeutics Inc",
          weight: "0.0497%",
        },
        {
          symbol: "VYGR",
          name: "Voyager Therapeutics Inc",
          weight: "0.0485%",
        },
        {
          symbol: "BCEL",
          name: "Atreca Inc",
          weight: "0.0476%",
        },
        {
          symbol: "DTIL",
          name: "Precision BioSciences Inc",
          weight: "0.0468%",
        },
        {
          symbol: "BDSI",
          name: "BioDelivery Sciences International Inc",
          weight: "0.0465%",
        },
        {
          symbol: "FLXN",
          name: "Flexion Therapeutics Inc",
          weight: "0.0428%",
        },
        {
          symbol: "PDLI",
          name: "PDL BioPharma Inc",
          weight: "0.0415%",
        },
        {
          symbol: "MGNX",
          name: "MacroGenics Inc",
          weight: "0.0417%",
        },
        {
          symbol: "MGTA",
          name: "Magenta Therapeutics Inc",
          weight: "0.0406%",
        },
        {
          symbol: "PBYI",
          name: "Puma Biotechnology Inc",
          weight: "0.049%",
        },
        {
          symbol: "PGNX",
          name: "Progenics Pharmaceuticals Inc",
          weight: "0.042%",
        },
        {
          symbol: "SYRS",
          name: "Syros Pharmaceuticals Inc",
          weight: "0.0408%",
        },
        {
          symbol: "SPPI",
          name: "Spectrum Pharmaceuticals Inc",
          weight: "0.0388%",
        },
        {
          symbol: "UBX",
          name: "UNITY Biotechnology Inc",
          weight: "0.0373%",
        },
        {
          symbol: "PSNL",
          name: "Personalis Inc",
          weight: "0.0365%",
        },
        {
          symbol: "AMRS",
          name: "Amyris Inc",
          weight: "0.0335%",
        },
        {
          symbol: "WVE",
          name: "WAVE Life Sciences Ltd",
          weight: "0.0327%",
        },
        {
          symbol: "MNKD",
          name: "MannKind Corp",
          weight: "0.0313%",
        },
        {
          symbol: "AMAG",
          name: "AMAG Pharmaceuticals Inc",
          weight: "0.0317%",
        },
        {
          symbol: "GRTS",
          name: "Gritstone Oncology Inc",
          weight: "0.0312%",
        },
        {
          symbol: "AUTL",
          name: "Autolus Therapeutics PLC",
          weight: "0.0311%",
        },
        {
          symbol: "PRQR",
          name: "ProQR Therapeutics NV",
          weight: "0.031%",
        },
        {
          symbol: "RIGL",
          name: "Rigel Pharmaceuticals Inc",
          weight: "0.0307%",
        },
        {
          symbol: "MCRB",
          name: "Seres Therapeutics Inc",
          weight: "0.0303%",
        },
        {
          symbol: "ADMA",
          name: "ADMA Biologics Inc",
          weight: "0.0295%",
        },
        {
          symbol: "TXMD",
          name: "TherapeuticsMD Inc",
          weight: "0.0292%",
        },
        {
          symbol: "GERN",
          name: "Geron Corp",
          weight: "0.0276%",
        },
        {
          symbol: "OSMT",
          name: "Osmotica Pharmaceuticals PLC",
          weight: "0.0269%",
        },
        {
          symbol: "LXRX",
          name: "Lexicon Pharmaceuticals Inc",
          weight: "0.0256%",
        },
        {
          symbol: "CLLS",
          name: "Cellectis SA",
          weight: "0.0239%",
        },
        {
          symbol: "CHMA",
          name: "Chiasma Inc",
          weight: "0.0232%",
        },
        {
          symbol: "EIGR",
          name: "Eiger BioPharmaceuticals Inc",
          weight: "0.0227%",
        },
        {
          symbol: "OPTN",
          name: "OptiNose Inc",
          weight: "0.0213%",
        },
        {
          symbol: "PTGX",
          name: "Protagonist Therapeutics Inc",
          weight: "0.0211%",
        },
        {
          symbol: "AFMD",
          name: "Affimed NV",
          weight: "0.0196%",
        },
        {
          symbol: "EOLS",
          name: "Evolus Inc",
          weight: "0.0164%",
        },
        {
          symbol: "CBAY",
          name: "Cymabay Therapeutics Inc",
          weight: "0.0132%",
        },
        {
          symbol: "GLYC",
          name: "GlycoMimetics Inc",
          weight: "0.0125%",
        },
        {
          symbol: "SLDB",
          name: "Solid Biosciences Inc",
          weight: "0.0119%",
        },
        {
          symbol: "AGLE",
          name: "Aeglea Bio Therapeutics Inc",
          weight: "0.019%",
        },
        {
          symbol: "EYPT",
          name: "EyePoint Pharmaceuticals Inc",
          weight: "0.0108%",
        },
        {
          symbol: "XERS",
          name: "Xeris Pharmaceuticals Inc",
          weight: "0.0059%",
        },
        {
          symbol: "TORC",
          name: "resTORbio, Inc.",
          weight: "0.0048%",
        },
        {
          symbol: "AKRX",
          name: "Akorn Inc",
          weight: "0.0042%",
        },
      ],
      parent: {
        firm_name: "iShares",
        market: "US ETFs",
        total_net_assets: 1420,
        fund_flows: 112.21,
        asset_growth_rate: 7.52,
        number_of_funds: 365,
        manager_retention_rate: 92.94,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.543683333333334,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.0017500000000000003,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 0.07,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 7.716666666666667,
      security_score: 10,
    },
    etf: {
      id: 88,
      ticker: "ZROZ",
      index_type: "market",
      name:
        "PIMCO 25 Year Zero Coupon U.S. Treasury Index Exchange-Traded Fund",
      stock_exchange: "ARCA",
      dividend_yield: 1.66,
      expense_ratio: 0.15,
      inception_date: "2009-10-30T00:00:00Z",
      sector_involvements: null,
      idea_involvements: [
        {
          idea: "ai",
          involvement: 0,
        },
        {
          idea: "better_health",
          involvement: 0.07,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 0.07,
        },
        {
          idea: "low_carbon",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 0.07,
        },
        {
          idea: "smart_cities",
          involvement: 0.07,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.97,
        sortino_ratio: 1.12,
        beta: 4.95,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "UST   PO Str 11/15/45",
          name: "UNITED STATES TREASURY",
          weight: "5.1714%",
        },
        {
          symbol: "UST   PO Str 08/15/45",
          name: "UNITED STATES TREASURY",
          weight: "5.1422%",
        },
        {
          symbol: "UST   PO Str 05/15/45",
          name: "UNITED STATES TREASURY",
          weight: "5.1205%",
        },
        {
          symbol: "UST   PO Str 02/15/46",
          name: "UNITED STATES TREASURY",
          weight: "5.1172%",
        },
        {
          symbol: "UST   PO Str 08/15/46",
          name: "UNITED STATES TREASURY",
          weight: "5.1127%",
        },
        {
          symbol: "UST   PO Str 02/15/47",
          name: "UNITED STATES TREASURY",
          weight: "5.0865%",
        },
        {
          symbol: "UST   PO Str 05/15/47",
          name: "UNITED STATES TREASURY",
          weight: "5.0657%",
        },
        {
          symbol: "UST   PO Str 05/15/46",
          name: "UNITED STATES TREASURY",
          weight: "5.0557%",
        },
        {
          symbol: "UST   PO Str 11/15/46",
          name: "UNITED STATES TREASURY",
          weight: "5.0496%",
        },
        {
          symbol: "UST   PO Str 02/15/48",
          name: "UNITED STATES TREASURY",
          weight: "5.0166%",
        },
        {
          symbol: "UST   PO Str 11/15/47",
          name: "UNITED STATES TREASURY",
          weight: "5.0006%",
        },
        {
          symbol: "UST   PO Str 08/15/47",
          name: "UNITED STATES TREASURY",
          weight: "4.9917%",
        },
        {
          symbol: "UST   PO Str 05/15/48",
          name: "UNITED STATES TREASURY",
          weight: "4.9781%",
        },
        {
          symbol: "UST   PO Str 08/15/48",
          name: "UNITED STATES TREASURY",
          weight: "4.9627%",
        },
        {
          symbol: "UST   PO Str 02/15/49",
          name: "UNITED STATES TREASURY",
          weight: "4.9413%",
        },
        {
          symbol: "UST   PO Str 11/15/48",
          name: "UNITED STATES TREASURY",
          weight: "4.9382%",
        },
        {
          symbol: "UST   PO Str 08/15/49",
          name: "UNITED STATES TREASURY",
          weight: "4.8868%",
        },
        {
          symbol: "UST   PO Str 05/15/49",
          name: "UNITED STATES TREASURY",
          weight: "4.8853%",
        },
        {
          symbol: "UST   PO Str 11/15/49",
          name: "UNITED STATES TREASURY",
          weight: "4.702%",
        },
        {
          symbol: "UST   PO Str 02/15/45",
          name: "UNITED STATES TREASURY",
          weight: "4.683%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.0921%",
        },
      ],
      parent: {
        firm_name: "PIMCO",
        market: "US ETFs",
        total_net_assets: 19.47,
        fund_flows: 1.3,
        asset_growth_rate: 6.95,
        number_of_funds: 16,
        manager_retention_rate: 91.05,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.520533333333334,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 1.521,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 45.66,
        },
        {
          idea: "biotechnology",
          involvement: 4.71,
        },
        {
          idea: "renewable_energy",
          involvement: 10.47,
        },
      ],
      activity_involvement_score: 7.9383333333333335,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 3.67,
        },
        {
          negative_activity: "gambling",
          involvement: 8.7,
        },
      ],
      risk_score: 8.143333333333334,
      security_score: 10,
    },
    etf: {
      id: 32,
      ticker: "ARKW",
      index_type: "market",
      name: "ARK Web x.0",
      stock_exchange: "ARCA",
      dividend_yield: -10000,
      expense_ratio: 0.76,
      inception_date: "2014-09-30T00:00:00Z",
      sector_involvements: [
        {
          sector: "information_technology",
          involvement: 37.57,
        },
        {
          sector: "consumer_discretionary",
          involvement: 22.21,
        },
        {
          sector: "communication_services",
          involvement: 14.71,
        },
        {
          sector: "healthcare",
          involvement: 4.71,
        },
        {
          sector: "financials",
          involvement: 2.4,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 68.89,
        },
        {
          idea: "better_health",
          involvement: 0.12,
        },
        {
          idea: "biotechnology",
          involvement: 4.71,
        },
        {
          idea: "fintech",
          involvement: 45.66,
        },
        {
          idea: "gender_equality",
          involvement: 16.47,
        },
        {
          idea: "low_carbon",
          involvement: 53.67,
        },
        {
          idea: "renewable_energy",
          involvement: 10.47,
        },
        {
          idea: "smart_cities",
          involvement: 21.43,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 6.25,
        },
        {
          negative_activity: "alcohol",
          involvement: 5.67,
        },
        {
          negative_activity: "gambling",
          involvement: 8.7,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 3.67,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 1.07,
        sortino_ratio: 1.61,
        beta: 1.24,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "TSLA",
          name: "Tesla Inc",
          weight: "11.0673%",
        },
        {
          symbol: "SQ",
          name: "Square Inc",
          weight: "7.859%",
        },
        {
          symbol: "ROKU",
          name: "Roku Inc",
          weight: "6.3982%",
        },
        {
          symbol: "XLNX",
          name: "Xilinx Inc",
          weight: "4.8136%",
        },
        {
          symbol: "PINS",
          name: "Pinterest Inc",
          weight: "4.6904%",
        },
        {
          symbol: "TWOU",
          name: "2U Inc",
          weight: "3.5822%",
        },
        {
          symbol: "AMZN",
          name: "Amazon.com Inc",
          weight: "3.3719%",
        },
        {
          symbol: "Z",
          name: "Zillow Group Inc",
          weight: "3.3159%",
        },
        {
          symbol: "SPLK",
          name: "Splunk Inc",
          weight: "3.1738%",
        },
        {
          symbol: "TREE",
          name: "LendingTree Inc",
          weight: "3.1265%",
        },
        {
          symbol: "SNAP",
          name: "Snap Inc",
          weight: "2.7497%",
        },
        {
          symbol: "TWLO",
          name: "Twilio Inc",
          weight: "2.552%",
        },
        {
          symbol: "PD",
          name: "PagerDuty Inc",
          weight: "2.4073%",
        },
        {
          symbol: "TCEHY",
          name: "Tencent Holdings Ltd",
          weight: "2.3694%",
        },
        {
          symbol: "VCYT",
          name: "Veracyte Inc",
          weight: "2.3417%",
        },
        {
          symbol: "GBTC",
          name: "Grayscale Bitcoin Trust (Btc)",
          weight: "2.2371%",
        },
        {
          symbol: "MELI",
          name: "Mercadolibre Inc",
          weight: "2.1434%",
        },
        {
          symbol: "PSTG",
          name: "Pure Storage Inc",
          weight: "2.0127%",
        },
        {
          symbol: "NFLX",
          name: "Netflix Inc",
          weight: "1.9999%",
        },
        {
          symbol: "AAPL",
          name: "Apple Inc",
          weight: "1.8984%",
        },
        {
          symbol: "SE",
          name: "Sea Ltd",
          weight: "1.8401%",
        },
        {
          symbol: "BABA",
          name: "Alibaba Group Holding Ltd",
          weight: "1.7674%",
        },
        {
          symbol: "HUYA",
          name: "HUYA Inc",
          weight: "1.6122%",
        },
        {
          symbol: "ADBE",
          name: "Adobe Inc",
          weight: "1.4661%",
        },
        {
          symbol: "TWTR",
          name: "Twitter Inc",
          weight: "1.4146%",
        },
        {
          symbol: "TTD",
          name: "Trade Desk Inc",
          weight: "1.379%",
        },
        {
          symbol: "HUBS",
          name: "HubSpot Inc",
          weight: "1.331%",
        },
        {
          symbol: "LC",
          name: "LendingClub Corp",
          weight: "1.3022%",
        },
        {
          symbol: "WDAY",
          name: "Workday Inc",
          weight: "1.309%",
        },
        {
          symbol: "AYX",
          name: "Alteryx Inc",
          weight: "1.2453%",
        },
        {
          symbol: "SNPS",
          name: "Synopsys Inc",
          weight: "1.231%",
        },
        {
          symbol: "TEAM",
          name: "Atlassian Corporation PLC",
          weight: "1.2011%",
        },
        {
          symbol: "PDD",
          name: "Pinduoduo Inc",
          weight: "1.1789%",
        },
        {
          symbol: "ZS",
          name: "Zscaler Inc",
          weight: "1.0967%",
        },
        {
          symbol: "PYPL",
          name: "PayPal Holdings Inc",
          weight: "1.0891%",
        },
        {
          symbol: "NVDA",
          name: "NVIDIA Corp",
          weight: "1.0129%",
        },
        {
          symbol: "CRWD",
          name: "Crowdstrike Holdings Inc",
          weight: "1.0119%",
        },
        {
          symbol: "TDOC",
          name: "Teladoc Health Inc",
          weight: "0.9599%",
        },
        {
          symbol: "CRM",
          name: "Salesforce.Com Inc",
          weight: "0.8911%",
        },
        {
          symbol: "SPOT",
          name: "Spotify Technology SA",
          weight: "0.8503%",
        },
        {
          symbol: "OKTA",
          name: "Okta Inc",
          weight: "0.4939%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.177%",
        },
        {
          symbol: "SHOP",
          name: "Shopify Inc",
          weight: "0.0205%",
        },
        {
          symbol: "EB",
          name: "Eventbrite Inc",
          weight: "0.0053%",
        },
        {
          symbol: "BIDU",
          name: "Baidu Inc",
          weight: "0.0032%",
        },
      ],
      parent: {
        firm_name: "ARK ETF Trust",
        market: "US ETFs",
        total_net_assets: 3.27,
        fund_flows: 0.70277,
        asset_growth_rate: 25,
        number_of_funds: 7,
        manager_retention_rate: 100,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input and fair sharpe and sortino ratios.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids a good amount of activities that client wants to avoid.",
    },
  },
  {
    score: 7.51365,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 1.5982499999999997,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 64.02,
        },
        {
          idea: "renewable_energy",
          involvement: -0.09,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 5.97,
      security_score: 10,
    },
    etf: {
      id: 48,
      ticker: "PTH",
      index_type: "sectoral",
      name: "PowerShares DWA Healthcare Momentum Portfolio",
      stock_exchange: "NASDAQ",
      dividend_yield: -10000,
      expense_ratio: 0.6,
      inception_date: "2006-10-12T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 83.99,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 39.91,
        },
        {
          idea: "better_health",
          involvement: 51.8,
        },
        {
          idea: "biotechnology",
          involvement: 64.02,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 6.84,
        },
        {
          idea: "low_carbon",
          involvement: 21.09,
        },
        {
          idea: "renewable_energy",
          involvement: -0.09,
        },
        {
          idea: "smart_cities",
          involvement: -0.09,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.69,
        sortino_ratio: 0.72,
        beta: 0.98,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "WST",
          name: "West Pharmaceutical Services Inc",
          weight: "4.6368%",
        },
        {
          symbol: "AXSM",
          name: "Axsome Therapeutics Inc",
          weight: "4.316%",
        },
        {
          symbol: "MASI",
          name: "Masimo Corp",
          weight: "4.1172%",
        },
        {
          symbol: "NVAX",
          name: "Novavax Inc",
          weight: "4.0064%",
        },
        {
          symbol: "TDOC",
          name: "Teladoc Health Inc",
          weight: "4.003%",
        },
        {
          symbol: "AMED",
          name: "Amedisys Inc",
          weight: "3.5343%",
        },
        {
          symbol: "TMO",
          name: "Thermo Fisher Scientific Inc",
          weight: "3.3798%",
        },
        {
          symbol: "EHTH",
          name: "eHealth Inc",
          weight: "3.3392%",
        },
        {
          symbol: "MRNA",
          name: "Moderna Inc",
          weight: "3.3007%",
        },
        {
          symbol: "UNH",
          name: "UnitedHealth Group Inc",
          weight: "3.117%",
        },
        {
          symbol: "EW",
          name: "Edwards Lifesciences Corp",
          weight: "2.9124%",
        },
        {
          symbol: "ACAD",
          name: "ACADIA Pharmaceuticals Inc",
          weight: "2.8802%",
        },
        {
          symbol: "PEN",
          name: "Penumbra Inc",
          weight: "2.8096%",
        },
        {
          symbol: "RGEN",
          name: "Repligen Corp",
          weight: "2.7911%",
        },
        {
          symbol: "SGEN",
          name: "Seattle Genetics Inc",
          weight: "2.7501%",
        },
        {
          symbol: "QDEL",
          name: "Quidel Corp",
          weight: "2.6526%",
        },
        {
          symbol: "CCXI",
          name: "ChemoCentryx Inc",
          weight: "2.6448%",
        },
        {
          symbol: "ZTS",
          name: "Zoetis Inc",
          weight: "2.2606%",
        },
        {
          symbol: "VRTX",
          name: "Vertex Pharmaceuticals Inc",
          weight: "2.2532%",
        },
        {
          symbol: "XLRN",
          name: "Acceleron Pharma Inc",
          weight: "2.2345%",
        },
        {
          symbol: "BIO",
          name: "Bio Rad Laboratories Inc",
          weight: "2.2089%",
        },
        {
          symbol: "IOVA",
          name: "Iovance Biotherapeutics Inc",
          weight: "2.1425%",
        },
        {
          symbol: "PRVB",
          name: "Provention Bio Inc",
          weight: "2.0206%",
        },
        {
          symbol: "LLY",
          name: "Eli Lilly and Co",
          weight: "1.987%",
        },
        {
          symbol: "ARVN",
          name: "Arvinas Inc",
          weight: "1.8976%",
        },
        {
          symbol: "ADVM",
          name: "Adverum Biotechnologies Inc",
          weight: "1.8876%",
        },
        {
          symbol: "AMGN",
          name: "Amgen Inc",
          weight: "1.8504%",
        },
        {
          symbol: "REGN",
          name: "Regeneron Pharmaceuticals Inc",
          weight: "1.8165%",
        },
        {
          symbol: "NEO",
          name: "Neogenomics Inc",
          weight: "1.766%",
        },
        {
          symbol: "MNTA",
          name: "Momenta Pharmaceuticals Inc",
          weight: "1.7275%",
        },
        {
          symbol: "EBS",
          name: "Emergent BioSolutions Inc",
          weight: "1.7162%",
        },
        {
          symbol: "HZNP",
          name: "Horizon Therapeutics PLC",
          weight: "1.5947%",
        },
        {
          symbol: "LHCG",
          name: "LHC Group Inc",
          weight: "1.5904%",
        },
        {
          symbol: "FATE",
          name: "Fate Therapeutics Inc",
          weight: "1.5738%",
        },
        {
          symbol: "APLT",
          name: "Applied Therapeutics Inc",
          weight: "1.5166%",
        },
        {
          symbol: "EIDX",
          name: "Eidos Therapeutics Inc",
          weight: "1.5092%",
        },
        {
          symbol: "DRNA",
          name: "Dicerna Pharmaceuticals Inc",
          weight: "1.436%",
        },
        {
          symbol: "KALA",
          name: "Kala Pharmaceuticals Inc",
          weight: "1.2445%",
        },
        {
          symbol: "ENSG",
          name: "Ensign Group Inc",
          weight: "1.2258%",
        },
        {
          symbol: "AKBA",
          name: "Akebia Therapeutics Inc",
          weight: "1.1976%",
        },
        {
          symbol: "ALEC",
          name: "Alector Inc",
          weight: "1.1877%",
        },
        {
          symbol: "ATRI",
          name: "Atrion Corp",
          weight: "0.98%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.0165%",
        },
      ],
      parent: {
        firm_name: "Invesco",
        market: "US ETFs",
        total_net_assets: 185.6,
        fund_flows: 8.64,
        asset_growth_rate: 4.49,
        number_of_funds: 219,
        manager_retention_rate: 89.72,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.418433333333334,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.2855,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 2.18,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 9.24,
        },
      ],
      activity_involvement_score: 9.69,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 1.86,
        },
      ],
      risk_score: 7.116666666666667,
      security_score: 10,
    },
    etf: {
      id: 82,
      ticker: "FTXL",
      index_type: "sectoral",
      name: "First Trust Nasdaq Semiconductor ETF",
      stock_exchange: "NASDAQ",
      dividend_yield: 1.07,
      expense_ratio: 0.6,
      inception_date: "2016-09-20T00:00:00Z",
      sector_involvements: [
        {
          sector: "information_technology",
          involvement: 97.11,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 74.67,
        },
        {
          idea: "better_health",
          involvement: 0.2,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 2.18,
        },
        {
          idea: "gender_equality",
          involvement: 19.6,
        },
        {
          idea: "low_carbon",
          involvement: 60.53,
        },
        {
          idea: "renewable_energy",
          involvement: 9.24,
        },
        {
          idea: "smart_cities",
          involvement: 35.39,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 1.86,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 3.91,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.45,
        sortino_ratio: 1,
        beta: 1.34,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "ENTG",
          name: "Entegris Inc",
          weight: "8.8773%",
        },
        {
          symbol: "INTC",
          name: "Intel Corp",
          weight: "8.3732%",
        },
        {
          symbol: "SWKS",
          name: "Skyworks Solutions Inc",
          weight: "8.0546%",
        },
        {
          symbol: "MXIM",
          name: "Maxim Integrated Products Inc",
          weight: "7.7691%",
        },
        {
          symbol: "QRVO",
          name: "Qorvo Inc",
          weight: "7.0745%",
        },
        {
          symbol: "KLAC",
          name: "KLA Corp",
          weight: "4.1274%",
        },
        {
          symbol: "LRCX",
          name: "Lam Research Corp",
          weight: "4.0937%",
        },
        {
          symbol: "CRUS",
          name: "Cirrus Logic Inc",
          weight: "4.0741%",
        },
        {
          symbol: "TER",
          name: "Teradyne Inc",
          weight: "4.0618%",
        },
        {
          symbol: "TXN",
          name: "Texas Instruments Inc",
          weight: "3.8859%",
        },
        {
          symbol: "ADI",
          name: "Analog Devices Inc",
          weight: "3.8475%",
        },
        {
          symbol: "AMAT",
          name: "Applied Materials Inc",
          weight: "3.6637%",
        },
        {
          symbol: "AVGO",
          name: "Broadcom Inc",
          weight: "2.6481%",
        },
        {
          symbol: "MU",
          name: "Micron Technology Inc",
          weight: "2.6066%",
        },
        {
          symbol: "AMD",
          name: "Advanced Micro Devices Inc",
          weight: "2.5539%",
        },
        {
          symbol: "IPHI",
          name: "Inphi Corp",
          weight: "2.5248%",
        },
        {
          symbol: "NVDA",
          name: "NVIDIA Corp",
          weight: "2.3793%",
        },
        {
          symbol: "MPWR",
          name: "Monolithic Power Systems Inc",
          weight: "2.0615%",
        },
        {
          symbol: "MRVL",
          name: "Marvell Technology Group Ltd",
          weight: "1.8302%",
        },
        {
          symbol: "XLNX",
          name: "Xilinx Inc",
          weight: "1.722%",
        },
        {
          symbol: "MCHP",
          name: "Microchip Technology Inc",
          weight: "1.6845%",
        },
        {
          symbol: "QCOM",
          name: "Qualcomm Inc",
          weight: "1.6194%",
        },
        {
          symbol: "SMTC",
          name: "Semtech Corp",
          weight: "1.5848%",
        },
        {
          symbol: "MKSI",
          name: "MKS Instruments Inc",
          weight: "1.5476%",
        },
        {
          symbol: "SLAB",
          name: "Silicon Laboratories Inc",
          weight: "1.5335%",
        },
        {
          symbol: "CREE",
          name: "Cree Inc",
          weight: "1.5319%",
        },
        {
          symbol: "IDCC",
          name: "InterDigital Wireless Inc",
          weight: "1.5196%",
        },
        {
          symbol: "CCMP",
          name: "Cabot Microelectronics Corp",
          weight: "1.4888%",
        },
        {
          symbol: "ON",
          name: "ON Semiconductor Corp",
          weight: "1.2148%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.0457%",
        },
      ],
      parent: {
        firm_name: "First Trust",
        market: "US ETFs",
        total_net_assets: 70.01,
        fund_flows: 9.8,
        asset_growth_rate: 13.66,
        number_of_funds: 151,
        manager_retention_rate: 96.11,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids a good amount of activities that client wants to avoid.",
    },
  },
  {
    score: 7.406650000000001,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.62325,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 4.03,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 20.9,
        },
      ],
      activity_involvement_score: 9.446666666666667,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 3.32,
        },
      ],
      risk_score: 6.963333333333334,
      security_score: 10,
    },
    etf: {
      id: 53,
      ticker: "XSD",
      index_type: "sectoral",
      name: "SPDR S&P Semiconductor",
      stock_exchange: "ARCA",
      dividend_yield: 0.6,
      expense_ratio: 0.35,
      inception_date: "2006-01-31T00:00:00Z",
      sector_involvements: [
        {
          sector: "information_technology",
          involvement: 97.1,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 62.99,
        },
        {
          idea: "better_health",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 4.03,
        },
        {
          idea: "gender_equality",
          involvement: 20.07,
        },
        {
          idea: "low_carbon",
          involvement: 41.61,
        },
        {
          idea: "renewable_energy",
          involvement: 20.9,
        },
        {
          idea: "smart_cities",
          involvement: 44.81,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 3.32,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 3.02,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.53,
        sortino_ratio: 0.65,
        beta: 1.34,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "AMD",
          name: "Advanced Micro Devices Inc",
          weight: "4.6911%",
        },
        {
          symbol: "IPHI",
          name: "Inphi Corp",
          weight: "4.5607%",
        },
        {
          symbol: "NVDA",
          name: "NVIDIA Corp",
          weight: "4.4419%",
        },
        {
          symbol: "MPWR",
          name: "Monolithic Power Systems Inc",
          weight: "3.6589%",
        },
        {
          symbol: "MRVL",
          name: "Marvell Technology Group Ltd",
          weight: "3.6232%",
        },
        {
          symbol: "LSCC",
          name: "Lattice Semiconductor Corp",
          weight: "3.5282%",
        },
        {
          symbol: "INTC",
          name: "Intel Corp",
          weight: "3.5238%",
        },
        {
          symbol: "SYNA",
          name: "Synaptics Inc",
          weight: "3.4039%",
        },
        {
          symbol: "AMBA",
          name: "Ambarella Inc",
          weight: "3.2526%",
        },
        {
          symbol: "XLNX",
          name: "Xilinx Inc",
          weight: "3.2055%",
        },
        {
          symbol: "POWI",
          name: "Power Integrations Inc",
          weight: "3.1883%",
        },
        {
          symbol: "CRUS",
          name: "Cirrus Logic Inc",
          weight: "3.1794%",
        },
        {
          symbol: "MXIM",
          name: "Maxim Integrated Products Inc",
          weight: "3.0944%",
        },
        {
          symbol: "TXN",
          name: "Texas Instruments Inc",
          weight: "3.0929%",
        },
        {
          symbol: "SMTC",
          name: "Semtech Corp",
          weight: "3.0902%",
        },
        {
          symbol: "ADI",
          name: "Analog Devices Inc",
          weight: "3.0624%",
        },
        {
          symbol: "SPWR",
          name: "SunPower Corp",
          weight: "2.9919%",
        },
        {
          symbol: "QCOM",
          name: "Qualcomm Inc",
          weight: "2.975%",
        },
        {
          symbol: "SWKS",
          name: "Skyworks Solutions Inc",
          weight: "2.9647%",
        },
        {
          symbol: "MU",
          name: "Micron Technology Inc",
          weight: "2.9637%",
        },
        {
          symbol: "AVGO",
          name: "Broadcom Inc",
          weight: "2.8822%",
        },
        {
          symbol: "CREE",
          name: "Cree Inc",
          weight: "2.8806%",
        },
        {
          symbol: "SLAB",
          name: "Silicon Laboratories Inc",
          weight: "2.7754%",
        },
        {
          symbol: "MCHP",
          name: "Microchip Technology Inc",
          weight: "2.7605%",
        },
        {
          symbol: "QRVO",
          name: "Qorvo Inc",
          weight: "2.7236%",
        },
        {
          symbol: "DIOD",
          name: "Diodes Inc",
          weight: "2.5969%",
        },
        {
          symbol: "FSLR",
          name: "First Solar Inc",
          weight: "2.5521%",
        },
        {
          symbol: "OLED",
          name: "Universal Display Corp",
          weight: "2.4565%",
        },
        {
          symbol: "ON",
          name: "ON Semiconductor Corp",
          weight: "2.1772%",
        },
        {
          symbol: "MTSI",
          name: "MACOM Technology Solutions Holdings Inc",
          weight: "2.0633%",
        },
        {
          symbol: "MXL",
          name: "MaxLinear Inc",
          weight: "1.4898%",
        },
        {
          symbol: "RMBS",
          name: "Rambus Inc",
          weight: "1.4431%",
        },
        {
          symbol: "PI",
          name: "Impinj Inc",
          weight: "1.1681%",
        },
        {
          symbol: "SGH",
          name: "Smart Global Holdings Inc",
          weight: "0.9679%",
        },
        {
          symbol: "CEVA",
          name: "CEVA Inc",
          weight: "0.5794%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.0093%",
        },
      ],
      parent: {
        firm_name: "SPDR State Street Global Advisors",
        market: "US ETFs",
        total_net_assets: 589.89,
        fund_flows: 24.64,
        asset_growth_rate: 3.95,
        number_of_funds: 140,
        manager_retention_rate: 91.93,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids a good amount of activities that client wants to avoid.",
    },
  },
  {
    score: 7.378216666666667,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.79775,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 31.93,
        },
        {
          idea: "renewable_energy",
          involvement: -0.02,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 6.093333333333334,
      security_score: 10,
    },
    etf: {
      id: 127,
      ticker: "PSCH",
      index_type: "sectoral",
      name: "PowerShares S&P SmallCap Health Care Portfolio",
      stock_exchange: "NASDAQ",
      dividend_yield: -10000,
      expense_ratio: 0.29,
      inception_date: "2010-04-07T00:00:00Z",
      sector_involvements: [
        {
          sector: "healthcare",
          involvement: 95.21,
        },
        {
          sector: "information_technology",
          involvement: 1.19,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 5.86,
        },
        {
          idea: "better_health",
          involvement: 33.39,
        },
        {
          idea: "biotechnology",
          involvement: 31.93,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: -0.02,
        },
        {
          idea: "low_carbon",
          involvement: 3.07,
        },
        {
          idea: "renewable_energy",
          involvement: -0.02,
        },
        {
          idea: "smart_cities",
          involvement: 3.05,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.42,
        sortino_ratio: 1.31,
        beta: 1.19,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "MNTA",
          name: "Momenta Pharmaceuticals Inc",
          weight: "4.7312%",
        },
        {
          symbol: "NEOG",
          name: "Neogen Corp",
          weight: "4.3927%",
        },
        {
          symbol: "EBS",
          name: "Emergent BioSolutions Inc",
          weight: "4.1798%",
        },
        {
          symbol: "NEO",
          name: "Neogenomics Inc",
          weight: "4.0344%",
        },
        {
          symbol: "OMCL",
          name: "Omnicell Inc",
          weight: "3.7794%",
        },
        {
          symbol: "HMSY",
          name: "HMS Holdings Corp",
          weight: "3.2243%",
        },
        {
          symbol: "MEDP",
          name: "Medpace Holdings Inc",
          weight: "2.9835%",
        },
        {
          symbol: "ITGR",
          name: "Integer Holdings Corp",
          weight: "2.9365%",
        },
        {
          symbol: "MMSI",
          name: "Merit Medical Systems Inc",
          weight: "2.8848%",
        },
        {
          symbol: "AMN",
          name: "AMN Healthcare Services Inc",
          weight: "2.6936%",
        },
        {
          symbol: "CNMD",
          name: "Conmed Corp",
          weight: "2.4997%",
        },
        {
          symbol: "ENSG",
          name: "Ensign Group Inc",
          weight: "2.3717%",
        },
        {
          symbol: "PCRX",
          name: "Pacira Biosciences Inc",
          weight: "2.1569%",
        },
        {
          symbol: "SEM",
          name: "Select Medical Holdings Corp",
          weight: "2.1514%",
        },
        {
          symbol: "BEAT",
          name: "BioTelemetry Inc",
          weight: "1.9467%",
        },
        {
          symbol: "XNCR",
          name: "Xencor Inc",
          weight: "1.9415%",
        },
        {
          symbol: "LMNX",
          name: "Luminex Corp",
          weight: "1.8855%",
        },
        {
          symbol: "CSII",
          name: "Cardiovascular Systems Inc",
          weight: "1.8821%",
        },
        {
          symbol: "GKOS",
          name: "Glaukos Corp",
          weight: "1.7761%",
        },
        {
          symbol: "CORT",
          name: "Corcept Therapeutics Inc",
          weight: "1.7548%",
        },
        {
          symbol: "RGNX",
          name: "Regenxbio Inc",
          weight: "1.6845%",
        },
        {
          symbol: "TRHC",
          name: "Tabula Rasa HealthCare Inc",
          weight: "1.553%",
        },
        {
          symbol: "MGLN",
          name: "Magellan Health Inc",
          weight: "1.5246%",
        },
        {
          symbol: "MYGN",
          name: "Myriad Genetics Inc",
          weight: "1.4006%",
        },
        {
          symbol: "ADUS",
          name: "Addus Homecare Corp",
          weight: "1.3544%",
        },
        {
          symbol: "TCMD",
          name: "Tactile Systems Technology Inc",
          weight: "1.307%",
        },
        {
          symbol: "SUPN",
          name: "Supernus Pharmaceuticals Inc",
          weight: "1.296%",
        },
        {
          symbol: "OSUR",
          name: "OraSure Technologies Inc",
          weight: "1.2368%",
        },
        {
          symbol: "CYTK",
          name: "Cytokinetics Inc",
          weight: "1.2078%",
        },
        {
          symbol: "MLAB",
          name: "Mesa Laboratories Inc",
          weight: "1.1995%",
        },
        {
          symbol: "VREX",
          name: "Varex Imaging Corp",
          weight: "1.189%",
        },
        {
          symbol: "INGN",
          name: "Inogen Inc",
          weight: "1.1773%",
        },
        {
          symbol: "INVA",
          name: "Innoviva Inc",
          weight: "1.159%",
        },
        {
          symbol: "NTUS",
          name: "Natus Medical Inc",
          weight: "1.1461%",
        },
        {
          symbol: "HNGR",
          name: "Hanger Inc",
          weight: "1.1226%",
        },
        {
          symbol: "USPH",
          name: "U.S. Physical Therapy Inc",
          weight: "1.128%",
        },
        {
          symbol: "CVET",
          name: "Covetrus Inc",
          weight: "1.1153%",
        },
        {
          symbol: "ENTA",
          name: "Enanta Pharmaceuticals Inc",
          weight: "1.116%",
        },
        {
          symbol: "CRY",
          name: "CryoLife Inc",
          weight: "1.0291%",
        },
        {
          symbol: "PRSC",
          name: "Providence Service Corp",
          weight: "0.8732%",
        },
        {
          symbol: "VNDA",
          name: "Vanda Pharmaceuticals Inc",
          weight: "0.8303%",
        },
        {
          symbol: "HSTM",
          name: "HealthStream Inc",
          weight: "0.8258%",
        },
        {
          symbol: "OFIX",
          name: "Orthofix Medical Inc",
          weight: "0.8243%",
        },
        {
          symbol: "AMPH",
          name: "Amphastar Pharmaceuticals Inc",
          weight: "0.7473%",
        },
        {
          symbol: "LNTH",
          name: "Lantheus Holdings Inc",
          weight: "0.6979%",
        },
        {
          symbol: "RDNT",
          name: "RadNet Inc",
          weight: "0.6794%",
        },
        {
          symbol: "EGRX",
          name: "Eagle Pharmaceuticals Inc",
          weight: "0.6778%",
        },
        {
          symbol: "NXGN",
          name: "NextGen Healthcare Inc",
          weight: "0.6647%",
        },
        {
          symbol: "SRDX",
          name: "Surmodics Inc",
          weight: "0.6579%",
        },
        {
          symbol: "ANIK",
          name: "Anika Therapeutics Inc",
          weight: "0.6211%",
        },
        {
          symbol: "PAHC",
          name: "Phibro Animal Health Corp",
          weight: "0.6065%",
        },
        {
          symbol: "OMI",
          name: "Owens & Minor Inc",
          weight: "0.5997%",
        },
        {
          symbol: "VIVO",
          name: "Meridian Bioscience Inc",
          weight: "0.5951%",
        },
        {
          symbol: "HSKA",
          name: "Heska Corp",
          weight: "0.5856%",
        },
        {
          symbol: "PNTG",
          name: "Pennant Group Inc",
          weight: "0.5851%",
        },
        {
          symbol: "LMAT",
          name: "LeMaitre Vascular Inc",
          weight: "0.5765%",
        },
        {
          symbol: "CRVL",
          name: "CorVel Corp",
          weight: "0.5764%",
        },
        {
          symbol: "CYH",
          name: "Community Health Systems Inc",
          weight: "0.5407%",
        },
        {
          symbol: "ANGO",
          name: "AngioDynamics Inc",
          weight: "0.5174%",
        },
        {
          symbol: "ANIP",
          name: "ANI Pharmaceuticals Inc",
          weight: "0.5067%",
        },
        {
          symbol: "PGNX",
          name: "Progenics Pharmaceuticals Inc",
          weight: "0.4641%",
        },
        {
          symbol: "SPPI",
          name: "Spectrum Pharmaceuticals Inc",
          weight: "0.4256%",
        },
        {
          symbol: "TVTY",
          name: "Tivity Health Inc",
          weight: "0.4032%",
        },
        {
          symbol: "LCI",
          name: "Lannett Company Inc",
          weight: "0.3976%",
        },
        {
          symbol: "CPSI",
          name: "Computer Programs and Systems Inc",
          weight: "0.376%",
        },
        {
          symbol: "AMAG",
          name: "AMAG Pharmaceuticals Inc",
          weight: "0.3559%",
        },
        {
          symbol: "IVC",
          name: "Invacare Corp",
          weight: "0.3218%",
        },
        {
          symbol: "CCRN",
          name: "Cross Country Healthcare Inc",
          weight: "0.288%",
        },
        {
          symbol: "CUTR",
          name: "Cutera Inc",
          weight: "0.2497%",
        },
        {
          symbol: "ACOR",
          name: "Acorda Therapeutics Inc",
          weight: "0.0648%",
        },
        {
          symbol: "AKRX",
          name: "Akorn Inc",
          weight: "0.0355%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.0051%",
        },
      ],
      parent: {
        firm_name: "Invesco",
        market: "US ETFs",
        total_net_assets: 185.6,
        fund_flows: 8.69,
        asset_growth_rate: 4.52,
        number_of_funds: 219,
        manager_retention_rate: 89.72,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.366066666666667,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.5820000000000001,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 14.08,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 9.2,
        },
      ],
      activity_involvement_score: 9.275,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 4.35,
        },
      ],
      risk_score: 6.973333333333334,
      security_score: 10,
    },
    etf: {
      id: 87,
      ticker: "SOXX",
      index_type: "sectoral",
      name: "iShares PHLX SOX Semiconductor Sector Index Fund",
      stock_exchange: "NASDAQ",
      dividend_yield: 1.45,
      expense_ratio: 0.46,
      inception_date: "2001-07-10T00:00:00Z",
      sector_involvements: [
        {
          sector: "information_technology",
          involvement: 92.89,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 87.03,
        },
        {
          idea: "better_health",
          involvement: 0.24,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 14.08,
        },
        {
          idea: "gender_equality",
          involvement: 38.78,
        },
        {
          idea: "low_carbon",
          involvement: 85.46,
        },
        {
          idea: "renewable_energy",
          involvement: 9.2,
        },
        {
          idea: "smart_cities",
          involvement: 57.63,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 4.35,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 7.9,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.66,
        sortino_ratio: 0.47,
        beta: 1.29,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "NVDA",
          name: "NVIDIA Corp",
          weight: "10.7498%",
        },
        {
          symbol: "INTC",
          name: "Intel Corp",
          weight: "8.2132%",
        },
        {
          symbol: "TXN",
          name: "Texas Instruments Inc",
          weight: "7.6252%",
        },
        {
          symbol: "QCOM",
          name: "Qualcomm Inc",
          weight: "7.3224%",
        },
        {
          symbol: "AVGO",
          name: "Broadcom Inc",
          weight: "6.7377%",
        },
        {
          symbol: "AMD",
          name: "Advanced Micro Devices Inc",
          weight: "5.7727%",
        },
        {
          symbol: "LRCX",
          name: "Lam Research Corp",
          weight: "4.0203%",
        },
        {
          symbol: "TSM",
          name: "Taiwan Semiconductor Manufacturing Co Ltd",
          weight: "3.9955%",
        },
        {
          symbol: "KLAC",
          name: "KLA Corp",
          weight: "3.938%",
        },
        {
          symbol: "ADI",
          name: "Analog Devices Inc",
          weight: "3.7724%",
        },
        {
          symbol: "MU",
          name: "Micron Technology Inc",
          weight: "3.7391%",
        },
        {
          symbol: "AMAT",
          name: "Applied Materials Inc",
          weight: "3.5948%",
        },
        {
          symbol: "XLNX",
          name: "Xilinx Inc",
          weight: "3.4149%",
        },
        {
          symbol: "NXPI",
          name: "NXP Semiconductors NV",
          weight: "3.2866%",
        },
        {
          symbol: "ASML",
          name: "ASML Holding NV",
          weight: "3.2706%",
        },
        {
          symbol: "MCHP",
          name: "Microchip Technology Inc",
          weight: "2.9657%",
        },
        {
          symbol: "MRVL",
          name: "Marvell Technology Group Ltd",
          weight: "2.7383%",
        },
        {
          symbol: "SWKS",
          name: "Skyworks Solutions Inc",
          weight: "2.4882%",
        },
        {
          symbol: "MXIM",
          name: "Maxim Integrated Products Inc",
          weight: "2.1978%",
        },
        {
          symbol: "QRVO",
          name: "Qorvo Inc",
          weight: "1.5802%",
        },
        {
          symbol: "TER",
          name: "Teradyne Inc",
          weight: "1.5722%",
        },
        {
          symbol: "MPWR",
          name: "Monolithic Power Systems Inc",
          weight: "1.2229%",
        },
        {
          symbol: "ENTG",
          name: "Entegris Inc",
          weight: "1.0452%",
        },
        {
          symbol: "ON",
          name: "ON Semiconductor Corp",
          weight: "0.9112%",
        },
        {
          symbol: "MKSI",
          name: "MKS Instruments Inc",
          weight: "0.7619%",
        },
        {
          symbol: "CRUS",
          name: "Cirrus Logic Inc",
          weight: "0.6231%",
        },
        {
          symbol: "CREE",
          name: "Cree Inc",
          weight: "0.62%",
        },
        {
          symbol: "SLAB",
          name: "Silicon Laboratories Inc",
          weight: "0.5987%",
        },
        {
          symbol: "CCMP",
          name: "Cabot Microelectronics Corp",
          weight: "0.4911%",
        },
        {
          symbol: "SMTC",
          name: "Semtech Corp",
          weight: "0.4347%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.2954%",
        },
      ],
      parent: {
        firm_name: "iShares",
        market: "US ETFs",
        total_net_assets: 1420,
        fund_flows: 112.21,
        asset_growth_rate: 7.52,
        number_of_funds: 365,
        manager_retention_rate: 92.94,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids a good amount of activities that client wants to avoid.",
    },
  },
  {
    score: 7.341683333333333,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 1.56175,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 62.47,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 5.1466666666666665,
      security_score: 10,
    },
    etf: {
      id: 193,
      ticker: "LIT",
      index_type: "thematic",
      name: "Global X Lithium & Battery Tech",
      stock_exchange: "ARCA",
      dividend_yield: 1.7,
      expense_ratio: 0.75,
      inception_date: "2010-07-22T00:00:00Z",
      sector_involvements: [
        {
          sector: "materials",
          involvement: 44.58,
        },
        {
          sector: "consumer_discretionary",
          involvement: 20.54,
        },
        {
          sector: "information_technology",
          involvement: 13.09,
        },
        {
          sector: "industrials",
          involvement: 10.84,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 66.5,
        },
        {
          idea: "better_health",
          involvement: 0.08,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 0.08,
        },
        {
          idea: "low_carbon",
          involvement: 41.33,
        },
        {
          idea: "renewable_energy",
          involvement: 62.47,
        },
        {
          idea: "smart_cities",
          involvement: 86.6,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0.34,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.26,
        sortino_ratio: 0.13,
        beta: 1.07,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "ALB",
          name: "Albemarle Corp",
          weight: "20.7869%",
        },
        {
          symbol: "SQM",
          name: "Sociedad Quimica y Minera de Chile SA",
          weight: "12.8259%",
        },
        {
          symbol: "TSLA",
          name: "Tesla Inc",
          weight: "10.9269%",
        },
        {
          symbol: "006400",
          name: "Samsung SDI Co Ltd",
          weight: "5.8419%",
        },
        {
          symbol: "051910",
          name: "LG Chem Ltd",
          weight: "5.344%",
        },
        {
          symbol: "1211",
          name: "Byd Co Ltd",
          weight: "5.135%",
        },
        {
          symbol: "LTHM",
          name: "Livent Corp",
          weight: "5.0244%",
        },
        {
          symbol: "6121",
          name: "Simplo Technology Co Ltd",
          weight: "4.482%",
        },
        {
          symbol: "6752",
          name: "Panasonic Corp",
          weight: "4.4803%",
        },
        {
          symbol: "6674",
          name: "GS Yuasa Corp",
          weight: "3.8845%",
        },
        {
          symbol: "ENS",
          name: "EnerSys",
          weight: "3.8008%",
        },
        {
          symbol: "VAR1",
          name: "Varta AG",
          weight: "3.3427%",
        },
        {
          symbol: "ORE",
          name: "Orocobre Ltd",
          weight: "1.5474%",
        },
        {
          symbol: "3211",
          name: "Dynapack International Technology Corp",
          weight: "1.3944%",
        },
        {
          symbol: "066970",
          name: "L&F Co Ltd",
          weight: "1.3687%",
        },
        {
          symbol: "PLS",
          name: "Pilbara Minerals Ltd",
          weight: "1.1585%",
        },
        {
          symbol: "GXY",
          name: "Galaxy Resources Ltd",
          weight: "1.058%",
        },
        {
          symbol: "8137",
          name: "Honbridge Holdings Ltd",
          weight: "0.9216%",
        },
        {
          symbol: "6619",
          name: "W-Scope Corp",
          weight: "0.9023%",
        },
        {
          symbol: "082920",
          name: "Vitzrocell Co Ltd",
          weight: "0.8491%",
        },
        {
          symbol: "LAC",
          name: "Lithium Americas Corp",
          weight: "0.6828%",
        },
        {
          symbol: "INR",
          name: "ioneer Ltd",
          weight: "0.5084%",
        },
        {
          symbol: "6558",
          name: "SYNergy ScienTech Corp",
          weight: "0.4151%",
        },
        {
          symbol: "ASL",
          name: "Akasol AG",
          weight: "0.3997%",
        },
        {
          symbol: "AVZ",
          name: "AVZ Minerals Ltd",
          weight: "0.3645%",
        },
        {
          symbol: "ULBI",
          name: "Ultralife Corp",
          weight: "0.3038%",
        },
        {
          symbol: "NMT",
          name: "Neometals Ltd",
          weight: "0.2782%",
        },
        {
          symbol: "NLC",
          name: "Neo Lithium Corp",
          weight: "0.2632%",
        },
        {
          symbol: "5227",
          name: "Advanced Lithium Electrochemistry Cayman Co Ltd",
          weight: "0.2591%",
        },
        {
          symbol: "8038",
          name: "Changs Ascending Enterprise Co Ltd",
          weight: "0.2211%",
        },
        {
          symbol: "SLL",
          name: "Standard Lithium Ltd",
          weight: "0.2208%",
        },
        {
          symbol: "LECN",
          name: "Leclanche SA",
          weight: "0.1874%",
        },
        {
          symbol: "4931",
          name: "STL Technology Co Ltd",
          weight: "0.1691%",
        },
        {
          symbol: "VBX",
          name: "Voltabox AG",
          weight: "0.1578%",
        },
        {
          symbol: "BCN",
          name: "Bacanora Lithium PLC",
          weight: "0.1437%",
        },
        {
          symbol: "729",
          name: "FDG Electric Vehicles Ltd",
          weight: "0.1397%",
        },
        {
          symbol: "AGY",
          name: "Argosy Minerals Ltd",
          weight: "0.1296%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.0807%",
        },
      ],
      parent: {
        firm_name: "Global X Funds",
        market: "US ETFs",
        total_net_assets: 11.42,
        fund_flows: 2.9,
        asset_growth_rate: 30.72,
        number_of_funds: 72,
        manager_retention_rate: 70.38,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.328333333333333,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 2.5,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 100.14,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: -0.14,
        },
      ],
      activity_involvement_score: 8.088333333333333,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 11.47,
        },
      ],
      risk_score: 6.053333333333334,
      security_score: 10,
    },
    etf: {
      id: 4,
      ticker: "FINX",
      index_type: "thematic",
      name: "Global X FinTech ETF",
      stock_exchange: "NASDAQ",
      dividend_yield: -10000,
      expense_ratio: 0.68,
      inception_date: "2016-09-12T00:00:00Z",
      sector_involvements: [
        {
          sector: "information_technology",
          involvement: 66.46,
        },
        {
          sector: "financials",
          involvement: 6.78,
        },
        {
          sector: "healthcare",
          involvement: 2.53,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 47.71,
        },
        {
          idea: "better_health",
          involvement: -0.14,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 100.14,
        },
        {
          idea: "gender_equality",
          involvement: 16.52,
        },
        {
          idea: "low_carbon",
          involvement: 42.45,
        },
        {
          idea: "renewable_energy",
          involvement: -0.14,
        },
        {
          idea: "smart_cities",
          involvement: 11.74,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 11.47,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.64,
        sortino_ratio: 0.92,
        beta: 1.24,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "FISV",
          name: "Fiserv Inc",
          weight: "12.5066%",
        },
        {
          symbol: "ADYEN",
          name: "Adyen NV",
          weight: "7.1755%",
        },
        {
          symbol: "FIS",
          name: "Fidelity National Information Services Inc",
          weight: "5.9944%",
        },
        {
          symbol: "PYPL",
          name: "PayPal Holdings Inc",
          weight: "5.9707%",
        },
        {
          symbol: "INTU",
          name: "Intuit Inc",
          weight: "5.8348%",
        },
        {
          symbol: "BKI",
          name: "Black Knight Inc",
          weight: "5.5974%",
        },
        {
          symbol: "NEXI",
          name: "Nexi SpA",
          weight: "5.484%",
        },
        {
          symbol: "WDI",
          name: "Wirecard AG",
          weight: "5.0358%",
        },
        {
          symbol: "SQ",
          name: "Square Inc",
          weight: "4.9181%",
        },
        {
          symbol: "XRO",
          name: "Xero Ltd",
          weight: "4.8372%",
        },
        {
          symbol: "SSNC",
          name: "SS&C Technologies Holdings Inc",
          weight: "4.3544%",
        },
        {
          symbol: "GWRE",
          name: "Guidewire Software Inc",
          weight: "4.3372%",
        },
        {
          symbol: "TEMN",
          name: "Temenos AG",
          weight: "3.3472%",
        },
        {
          symbol: "APT",
          name: "Afterpay Ltd",
          weight: "3.0865%",
        },
        {
          symbol: "SIM",
          name: "Simcorp A/S",
          weight: "2.5378%",
        },
        {
          symbol: "PAGS",
          name: "PagSeguro Digital Ltd",
          weight: "2.3681%",
        },
        {
          symbol: "HQY",
          name: "HealthEquity Inc",
          weight: "2.2761%",
        },
        {
          symbol: "STNE",
          name: "StoneCo Ltd",
          weight: "2.2677%",
        },
        {
          symbol: "ENV",
          name: "Envestnet Inc",
          weight: "2.1369%",
        },
        {
          symbol: "TREE",
          name: "LendingTree Inc",
          weight: "1.9697%",
        },
        {
          symbol: "VIRT",
          name: "Virtu Financial Inc",
          weight: "1.8549%",
        },
        {
          symbol: "HYQ",
          name: "Hypoport SE",
          weight: "1.5431%",
        },
        {
          symbol: "EPAY",
          name: "Bottomline Technologies (DE) Inc",
          weight: "1.1944%",
        },
        {
          symbol: "IRE",
          name: "Iress Ltd",
          weight: "0.8061%",
        },
        {
          symbol: "BCOR",
          name: "Blucora Inc",
          weight: "0.4587%",
        },
        {
          symbol: "LEON",
          name: "Leonteq AG",
          weight: "0.4382%",
        },
        {
          symbol: "LC",
          name: "LendingClub Corp",
          weight: "0.4058%",
        },
        {
          symbol: "Z1P",
          name: "Zip Co Ltd",
          weight: "0.3095%",
        },
        {
          symbol: "MITK",
          name: "Mitek Systems Inc",
          weight: "0.3004%",
        },
        {
          symbol: "HUB",
          name: "Hub24 Ltd",
          weight: "0.2691%",
        },
        {
          symbol: "YRD",
          name: "Yiren Digital Ltd",
          weight: "0.1471%",
        },
        {
          symbol: "GSKY",
          name: "GreenSky Inc",
          weight: "0.1456%",
        },
        {
          symbol: "6172",
          name: "Metaps Inc",
          weight: "0.15%",
        },
        {
          symbol: "ONDK",
          name: "On Deck Capital Inc",
          weight: "0.0821%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.1416%",
        },
      ],
      parent: {
        firm_name: "Global X Funds",
        market: "US ETFs",
        total_net_assets: 8.53,
        fund_flows: 2.49,
        asset_growth_rate: 25.85,
        number_of_funds: 72,
        manager_retention_rate: 70.38,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids a good amount of activities that client wants to avoid.",
    },
  },
  {
    score: 7.315316666666667,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.05325,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 2.13,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 6.523333333333333,
      security_score: 10,
    },
    etf: {
      id: 140,
      ticker: "ITA",
      index_type: "sectoral",
      name: "iShares U.S. Aerospace & Defense",
      stock_exchange: "BATS",
      dividend_yield: 2.42,
      expense_ratio: 0.42,
      inception_date: "2006-05-01T00:00:00Z",
      sector_involvements: [
        {
          sector: "industrials",
          involvement: 93.7,
        },
        {
          sector: "consumer_discretionary",
          involvement: 0.39,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 52.41,
        },
        {
          idea: "better_health",
          involvement: 0.39,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 32.16,
        },
        {
          idea: "low_carbon",
          involvement: 72.15,
        },
        {
          idea: "renewable_energy",
          involvement: 2.13,
        },
        {
          idea: "smart_cities",
          involvement: 2.19,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 4.71,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 85.06,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.07,
        sortino_ratio: 0.68,
        beta: 1.43,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "LMT",
          name: "Lockheed Martin Corp",
          weight: "18.2538%",
        },
        {
          symbol: "RTX",
          name: "Raytheon Technologies Corp",
          weight: "17.9347%",
        },
        {
          symbol: "BA",
          name: "Boeing Co",
          weight: "10.9036%",
        },
        {
          symbol: "NOC",
          name: "Northrop Grumman Corp",
          weight: "4.604%",
        },
        {
          symbol: "TDY",
          name: "Teledyne Technologies Inc",
          weight: "4.5411%",
        },
        {
          symbol: "LHX",
          name: "L3Harris Technologies Inc",
          weight: "4.4708%",
        },
        {
          symbol: "GD",
          name: "General Dynamics Corp",
          weight: "4.3209%",
        },
        {
          symbol: "OTIS",
          name: "Otis Worldwide Corp",
          weight: "3.7389%",
        },
        {
          symbol: "TDG",
          name: "TransDigm Group Inc",
          weight: "3.5733%",
        },
        {
          symbol: "HII",
          name: "Huntington Ingalls Industries Inc",
          weight: "2.9788%",
        },
        {
          symbol: "CARR",
          name: "Carrier Global Corp",
          weight: "2.5395%",
        },
        {
          symbol: "TXT",
          name: "Textron Inc",
          weight: "2.4356%",
        },
        {
          symbol: "BWXT",
          name: "BWX Technologies Inc",
          weight: "1.9443%",
        },
        {
          symbol: "HEI.A",
          name: "HEICO Corp",
          weight: "1.9058%",
        },
        {
          symbol: "MRCY",
          name: "Mercury Systems Inc",
          weight: "1.8023%",
        },
        {
          symbol: "AAXN",
          name: "Axon Enterprise Inc",
          weight: "1.6829%",
        },
        {
          symbol: "HWM",
          name: "Howmet Aerospace Inc",
          weight: "1.653%",
        },
        {
          symbol: "CW",
          name: "Curtiss-Wright Corp",
          weight: "1.5922%",
        },
        {
          symbol: "ROLL",
          name: "RBC Bearings Inc",
          weight: "1.2205%",
        },
        {
          symbol: "HEI",
          name: "HEICO Corp",
          weight: "1.2059%",
        },
        {
          symbol: "AJRD",
          name: "Aerojet Rocketdyne Holdings Inc",
          weight: "1.1935%",
        },
        {
          symbol: "HXL",
          name: "Hexcel Corp",
          weight: "0.9416%",
        },
        {
          symbol: "SPR",
          name: "Spirit AeroSystems Holdings Inc",
          weight: "0.7392%",
        },
        {
          symbol: "MOG.A",
          name: "Moog Inc",
          weight: "0.6013%",
        },
        {
          symbol: "KTOS",
          name: "Kratos Defense and Security Solutions Inc",
          weight: "0.5078%",
        },
        {
          symbol: "AVAV",
          name: "AeroVironment Inc",
          weight: "0.4745%",
        },
        {
          symbol: "CUB",
          name: "Cubic Corp",
          weight: "0.3989%",
        },
        {
          symbol: "RGR",
          name: "Sturm Ruger & Company Inc",
          weight: "0.3552%",
        },
        {
          symbol: "ARNC",
          name: "Arconic Corp (PITTSBURGH)",
          weight: "0.3073%",
        },
        {
          symbol: "PSN",
          name: "Parsons Corp",
          weight: "0.2634%",
        },
        {
          symbol: "AIR",
          name: "AAR Corp",
          weight: "0.2118%",
        },
        {
          symbol: "AOBC",
          name: "American Outdoor Brands Corp",
          weight: "0.2086%",
        },
        {
          symbol: "NPK",
          name: "National Presto Industries Inc",
          weight: "0.1786%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.1325%",
        },
        {
          symbol: "TGI",
          name: "Triumph Group Inc",
          weight: "0.1109%",
        },
        {
          symbol: "ATRO",
          name: "Astronics Corp",
          weight: "0.073%",
        },
      ],
      parent: {
        firm_name: "iShares",
        market: "US ETFs",
        total_net_assets: 1420,
        fund_flows: 112.26,
        asset_growth_rate: 7.52,
        number_of_funds: 365,
        manager_retention_rate: 92.94,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
  {
    score: 7.300266666666667,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.783,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 27.15,
        },
        {
          idea: "biotechnology",
          involvement: 4.17,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
      ],
      activity_involvement_score: 8.911666666666667,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 6.53,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 6.806666666666667,
      security_score: 10,
    },
    etf: {
      id: 12,
      ticker: "MILN",
      index_type: "thematic",
      name: "Global X Millennials Thematic ETF",
      stock_exchange: "NASDAQ",
      dividend_yield: 0.5,
      expense_ratio: 0.5,
      inception_date: "2016-05-04T00:00:00Z",
      sector_involvements: [
        {
          sector: "consumer_discretionary",
          involvement: 34.64,
        },
        {
          sector: "communication_services",
          involvement: 20.78,
        },
        {
          sector: "information_technology",
          involvement: 16.88,
        },
        {
          sector: "real_estate",
          involvement: 10.85,
        },
        {
          sector: "consumer_staples",
          involvement: 3.9,
        },
        {
          sector: "financials",
          involvement: 1.16,
        },
        {
          sector: "industrials",
          involvement: 0.2,
        },
      ],
      idea_involvements: [
        {
          idea: "ai",
          involvement: 67.1,
        },
        {
          idea: "better_health",
          involvement: 10.54,
        },
        {
          idea: "biotechnology",
          involvement: 4.17,
        },
        {
          idea: "fintech",
          involvement: 27.15,
        },
        {
          idea: "gender_equality",
          involvement: 46.15,
        },
        {
          idea: "low_carbon",
          involvement: 78.01,
        },
        {
          idea: "renewable_energy",
          involvement: 0,
        },
        {
          idea: "smart_cities",
          involvement: 10.81,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 2.68,
        },
        {
          negative_activity: "alcohol",
          involvement: 16.57,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 6.53,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.38,
        sortino_ratio: 0.64,
        beta: 1.1,
        morningstar_risk_level: 5,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "AMZN",
          name: "Amazon.com Inc",
          weight: "3.3881%",
        },
        {
          symbol: "EBAY",
          name: "eBay Inc",
          weight: "3.3328%",
        },
        {
          symbol: "NFLX",
          name: "Netflix Inc",
          weight: "3.2111%",
        },
        {
          symbol: "PYPL",
          name: "PayPal Holdings Inc",
          weight: "3.1993%",
        },
        {
          symbol: "UBER",
          name: "Uber Technologies Inc",
          weight: "3.0625%",
        },
        {
          symbol: "FB",
          name: "Facebook Inc",
          weight: "3.056%",
        },
        {
          symbol: "ATVI",
          name: "Activision Blizzard Inc",
          weight: "3.0508%",
        },
        {
          symbol: "HD",
          name: "Home Depot Inc",
          weight: "3.0386%",
        },
        {
          symbol: "INTU",
          name: "Intuit Inc",
          weight: "2.9882%",
        },
        {
          symbol: "AAPL",
          name: "Apple Inc",
          weight: "2.9833%",
        },
        {
          symbol: "SBUX",
          name: "Starbucks Corp",
          weight: "2.9549%",
        },
        {
          symbol: "LOW",
          name: "Lowe's Companies Inc",
          weight: "2.9238%",
        },
        {
          symbol: "GOOGL",
          name: "Alphabet Inc",
          weight: "2.9161%",
        },
        {
          symbol: "NKE",
          name: "Nike Inc",
          weight: "2.896%",
        },
        {
          symbol: "COST",
          name: "Costco Wholesale Corp",
          weight: "2.8376%",
        },
        {
          symbol: "DIS",
          name: "Walt Disney Co",
          weight: "2.8005%",
        },
        {
          symbol: "BKNG",
          name: "Booking Holdings Inc",
          weight: "2.7538%",
        },
        {
          symbol: "FISV",
          name: "Fiserv Inc",
          weight: "2.741%",
        },
        {
          symbol: "LULU",
          name: "Lululemon Athletica Inc",
          weight: "2.6013%",
        },
        {
          symbol: "SPOT",
          name: "Spotify Technology SA",
          weight: "2.5068%",
        },
        {
          symbol: "CMG",
          name: "Chipotle Mexican Grill Inc",
          weight: "2.4035%",
        },
        {
          symbol: "EQR",
          name: "Equity Residential",
          weight: "2.3275%",
        },
        {
          symbol: "TWTR",
          name: "Twitter Inc",
          weight: "2.1993%",
        },
        {
          symbol: "AVB",
          name: "AvalonBay Communities Inc",
          weight: "2.1707%",
        },
        {
          symbol: "SQ",
          name: "Square Inc",
          weight: "2.1465%",
        },
        {
          symbol: "VFC",
          name: "VF Corp",
          weight: "2.1047%",
        },
        {
          symbol: "SNAP",
          name: "Snap Inc",
          weight: "1.8204%",
        },
        {
          symbol: "IAC",
          name: "IAC/InterActiveCorp",
          weight: "1.7293%",
        },
        {
          symbol: "INVH",
          name: "Invitation Homes Inc",
          weight: "1.152%",
        },
        {
          symbol: "KMX",
          name: "Carmax Inc",
          weight: "1.1284%",
        },
        {
          symbol: "UDR",
          name: "UDR Inc",
          weight: "1.0458%",
        },
        {
          symbol: "LYFT",
          name: "Lyft Inc",
          weight: "0.9294%",
        },
        {
          symbol: "EXPE",
          name: "Expedia Group Inc",
          weight: "0.8715%",
        },
        {
          symbol: "CPT",
          name: "Camden Property Trust",
          weight: "0.8162%",
        },
        {
          symbol: "W",
          name: "Wayfair Inc",
          weight: "0.8066%",
        },
        {
          symbol: "LYV",
          name: "Live Nation Entertainment Inc",
          weight: "0.7996%",
        },
        {
          symbol: "ETSY",
          name: "Etsy Inc",
          weight: "0.7618%",
        },
        {
          symbol: "IHTM",
          name: "iHeartMedia Inc",
          weight: "0.7402%",
        },
        {
          symbol: "ZNGA",
          name: "Zynga Inc",
          weight: "0.711%",
        },
        {
          symbol: "BFAM",
          name: "Bright Horizons Family Solutions Inc",
          weight: "0.6148%",
        },
        {
          symbol: "MTCH",
          name: "Match Group Inc",
          weight: "0.5781%",
        },
        {
          symbol: "CVNA",
          name: "Carvana Co",
          weight: "0.5754%",
        },
        {
          symbol: "CHGG",
          name: "Chegg Inc",
          weight: "0.4681%",
        },
        {
          symbol: "COLM",
          name: "Columbia Sportswear Co",
          weight: "0.4594%",
        },
        {
          symbol: "PLNT",
          name: "Planet Fitness Inc",
          weight: "0.4527%",
        },
        {
          symbol: "ACC",
          name: "American Campus Communities Inc",
          weight: "0.4017%",
        },
        {
          symbol: "PS",
          name: "Pluralsight Inc",
          weight: "0.3582%",
        },
        {
          symbol: "GRPN",
          name: "Groupon Inc",
          weight: "0.3449%",
        },
        {
          symbol: "SKX",
          name: "Skechers USA Inc",
          weight: "0.3374%",
        },
        {
          symbol: "PTON",
          name: "Peloton Interactive Inc",
          weight: "0.3235%",
        },
        {
          symbol: "TREE",
          name: "LendingTree Inc",
          weight: "0.3221%",
        },
        {
          symbol: "SFM",
          name: "Sprouts Farmers Market Inc",
          weight: "0.3163%",
        },
        {
          symbol: "STRA",
          name: "Strategic Education Inc",
          weight: "0.3142%",
        },
        {
          symbol: "SLM",
          name: "SLM Corp",
          weight: "0.3076%",
        },
        {
          symbol: "WW",
          name: "WW International Inc",
          weight: "0.3056%",
        },
        {
          symbol: "GPRO",
          name: "GoPro Inc",
          weight: "0.3043%",
        },
        {
          symbol: "AN",
          name: "AutoNation Inc",
          weight: "0.3043%",
        },
        {
          symbol: "IRT",
          name: "Independence Realty Trust Inc",
          weight: "0.3043%",
        },
        {
          symbol: "CRI",
          name: "Carter's Inc",
          weight: "0.3031%",
        },
        {
          symbol: "DKS",
          name: "Dick's Sporting Goods Inc",
          weight: "0.3035%",
        },
        {
          symbol: "GRUB",
          name: "GrubHub Inc",
          weight: "0.39%",
        },
        {
          symbol: "PLCE",
          name: "Childrens Place Inc",
          weight: "0.305%",
        },
        {
          symbol: "TRIP",
          name: "TripAdvisor Inc",
          weight: "0.2965%",
        },
        {
          symbol: "LRN",
          name: "K12 Inc",
          weight: "0.2961%",
        },
        {
          symbol: "FIT",
          name: "Fitbit Inc",
          weight: "0.2918%",
        },
        {
          symbol: "BCOR",
          name: "Blucora Inc",
          weight: "0.292%",
        },
        {
          symbol: "CARG",
          name: "CarGurus Inc",
          weight: "0.291%",
        },
        {
          symbol: "ZG",
          name: "Zillow Group Inc",
          weight: "0.2894%",
        },
        {
          symbol: "UAA",
          name: "Under Armour Inc",
          weight: "0.2864%",
        },
        {
          symbol: "IRET",
          name: "Investors Real Estate Trust",
          weight: "0.2828%",
        },
        {
          symbol: "TWOU",
          name: "2U Inc",
          weight: "0.2814%",
        },
        {
          symbol: "LB",
          name: "L Brands Inc",
          weight: "0.2781%",
        },
        {
          symbol: "GHC",
          name: "Graham Holdings Co",
          weight: "0.2745%",
        },
        {
          symbol: "CARS",
          name: "Cars.com Inc",
          weight: "0.2672%",
        },
        {
          symbol: "YELP",
          name: "Yelp Inc",
          weight: "0.263%",
        },
        {
          symbol: "BBBY",
          name: "Bed Bath & Beyond Inc",
          weight: "0.2564%",
        },
        {
          symbol: "CPRI",
          name: "Capri Holdings Ltd",
          weight: "0.2537%",
        },
        {
          symbol: "DBI",
          name: "Designer Brands Inc",
          weight: "0.2529%",
        },
        {
          symbol: "CAR",
          name: "Avis Budget Group Inc",
          weight: "0.254%",
        },
        {
          symbol: "LAUR",
          name: "Laureate Education Inc",
          weight: "0.2375%",
        },
        {
          symbol: "LC",
          name: "LendingClub Corp",
          weight: "0.231%",
        },
        {
          symbol: "NNI",
          name: "Nelnet Inc",
          weight: "0.28%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "-0.0571%",
        },
      ],
      parent: {
        firm_name: "Global X Funds",
        market: "US ETFs",
        total_net_assets: 8.53,
        fund_flows: 2.49,
        asset_growth_rate: 25.85,
        number_of_funds: 72,
        manager_retention_rate: 70.38,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids a good amount of activities that client wants to avoid.",
    },
  },
  {
    score: 7.288383333333334,
    score_breakdown: {
      sector_involvement_score: 10,
      restricted_sector_involvements: null,
      idea_involvement_score: 0.03525,
      relevant_idea_involvements: [
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 1.41,
        },
      ],
      activity_involvement_score: 10,
      restricted_activity_involvements: [
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
      ],
      risk_score: 6.406666666666666,
      security_score: 10,
    },
    etf: {
      id: 58,
      ticker: "EDV",
      index_type: "market",
      name: "Vanguard Extended Duration Treasury",
      stock_exchange: "ARCA",
      dividend_yield: 2.63,
      expense_ratio: 0.07,
      inception_date: "2007-12-06T00:00:00Z",
      sector_involvements: null,
      idea_involvements: [
        {
          idea: "ai",
          involvement: 0,
        },
        {
          idea: "better_health",
          involvement: 1.41,
        },
        {
          idea: "biotechnology",
          involvement: 0,
        },
        {
          idea: "fintech",
          involvement: 0,
        },
        {
          idea: "gender_equality",
          involvement: 1.41,
        },
        {
          idea: "low_carbon",
          involvement: 0,
        },
        {
          idea: "renewable_energy",
          involvement: 1.41,
        },
        {
          idea: "smart_cities",
          involvement: 1.41,
        },
      ],
      negative_activity_involvements: [
        {
          negative_activity: "adult_entertainment",
          involvement: 0,
        },
        {
          negative_activity: "alcohol",
          involvement: 0,
        },
        {
          negative_activity: "gambling",
          involvement: 0,
        },
        {
          negative_activity: "nuclear_power",
          involvement: 0,
        },
        {
          negative_activity: "tobacco",
          involvement: 0,
        },
        {
          negative_activity: "weapons_involvement",
          involvement: 0,
        },
        {
          negative_activity: "predatory_lending",
          involvement: 0,
        },
        {
          negative_activity: "gmo",
          involvement: 0,
        },
      ],
      risk_metrics: {
        sharpe_ratio: 0.98,
        sortino_ratio: 0.94,
        beta: 4.5,
        morningstar_risk_level: 4,
        standard_deviation: -10000,
      },
      holdings: [
        {
          symbol: "UST   PO Str 05/15/47",
          name: "UNITED STATES TREASURY",
          weight: "3.2043%",
        },
        {
          symbol: "UST   PO Str 08/15/49",
          name: "UNITED STATES TREASURY",
          weight: "3.1999%",
        },
        {
          symbol: "UST   PO Str 08/15/47",
          name: "UNITED STATES TREASURY",
          weight: "3.1052%",
        },
        {
          symbol: "UST   IO Str 08/15/48",
          name: "UNITED STATES TREASURY",
          weight: "3.0917%",
        },
        {
          symbol: "UST   IO Str 05/15/47",
          name: "UNITED STATES TREASURY",
          weight: "2.9662%",
        },
        {
          symbol: "UST   IO Str 08/15/47",
          name: "UNITED STATES TREASURY",
          weight: "2.9603%",
        },
        {
          symbol: "UST   PO Str 08/15/40",
          name: "UNITED STATES TREASURY",
          weight: "2.9382%",
        },
        {
          symbol: "UST   PO Str 05/15/49",
          name: "UNITED STATES TREASURY",
          weight: "2.888%",
        },
        {
          symbol: "UST   IO Str 02/15/48",
          name: "UNITED STATES TREASURY",
          weight: "2.7859%",
        },
        {
          symbol: "UST   PO Str 05/15/48",
          name: "UNITED STATES TREASURY",
          weight: "2.758%",
        },
        {
          symbol: "UST   PO Str 08/15/46",
          name: "UNITED STATES TREASURY",
          weight: "2.7323%",
        },
        {
          symbol: "UST   IO Str 02/15/46",
          name: "UNITED STATES TREASURY",
          weight: "2.6083%",
        },
        {
          symbol: "UST   PO Str 02/15/41",
          name: "UNITED STATES TREASURY",
          weight: "2.64%",
        },
        {
          symbol: "UST   PO Str 02/15/48",
          name: "UNITED STATES TREASURY",
          weight: "2.5997%",
        },
        {
          symbol: "UST   PO Str 05/15/46",
          name: "UNITED STATES TREASURY",
          weight: "2.5737%",
        },
        {
          symbol: "UST   IO Str 08/15/41",
          name: "UNITED STATES TREASURY",
          weight: "2.5489%",
        },
        {
          symbol: "UST   IO Str 11/15/43",
          name: "UNITED STATES TREASURY",
          weight: "2.525%",
        },
        {
          symbol: "UST   PO Str 05/15/41",
          name: "UNITED STATES TREASURY",
          weight: "2.4478%",
        },
        {
          symbol: "UST   IO Str 08/15/42",
          name: "UNITED STATES TREASURY",
          weight: "2.4095%",
        },
        {
          symbol: "UST   IO Str 08/15/49",
          name: "UNITED STATES TREASURY",
          weight: "2.3584%",
        },
        {
          symbol: "UST   IO Str 11/15/40",
          name: "UNITED STATES TREASURY",
          weight: "2.3157%",
        },
        {
          symbol: "UST   IO Str 05/15/49",
          name: "UNITED STATES TREASURY",
          weight: "2.2813%",
        },
        {
          symbol: "UST   IO Str 05/15/46",
          name: "UNITED STATES TREASURY",
          weight: "2.2715%",
        },
        {
          symbol: "UST   PO Str 05/15/45",
          name: "UNITED STATES TREASURY",
          weight: "2.2703%",
        },
        {
          symbol: "UST   PO Str 08/15/43",
          name: "UNITED STATES TREASURY",
          weight: "2.2467%",
        },
        {
          symbol: "UST   PO Str 05/15/40",
          name: "UNITED STATES TREASURY",
          weight: "2.2194%",
        },
        {
          symbol: "UST   IO Str 05/15/43",
          name: "UNITED STATES TREASURY",
          weight: "2.2062%",
        },
        {
          symbol: "UST   IO Str 08/15/43",
          name: "UNITED STATES TREASURY",
          weight: "2.1976%",
        },
        {
          symbol: "UST   PO Str 08/15/42",
          name: "UNITED STATES TREASURY",
          weight: "2.1974%",
        },
        {
          symbol: "UST   IO Str 08/15/40",
          name: "UNITED STATES TREASURY",
          weight: "2.1494%",
        },
        {
          symbol: "UST   IO Str 02/15/45",
          name: "UNITED STATES TREASURY",
          weight: "2.1474%",
        },
        {
          symbol: "UST   PO Str 02/15/42",
          name: "UNITED STATES TREASURY",
          weight: "2.1414%",
        },
        {
          symbol: "UST   PO Str 05/15/43",
          name: "UNITED STATES TREASURY",
          weight: "2.082%",
        },
        {
          symbol: "UST   PO Str 05/15/44",
          name: "UNITED STATES TREASURY",
          weight: "2.0462%",
        },
        {
          symbol: "UST   IO Str 05/15/41",
          name: "UNITED STATES TREASURY",
          weight: "2.0321%",
        },
        {
          symbol: "UST   IO Str 08/15/44",
          name: "UNITED STATES TREASURY",
          weight: "2.0111%",
        },
        {
          symbol: "UST   IO Str 05/15/44",
          name: "UNITED STATES TREASURY",
          weight: "2.0054%",
        },
        {
          symbol: "UST   IO Str 05/15/45",
          name: "UNITED STATES TREASURY",
          weight: "1.9753%",
        },
        {
          symbol: "UST   IO Str 02/15/42",
          name: "UNITED STATES TREASURY",
          weight: "1.916%",
        },
        {
          symbol: "UST   PO Str 08/15/44",
          name: "UNITED STATES TREASURY",
          weight: "1.869%",
        },
        {
          symbol: "UST   PO Str 02/15/45",
          name: "UNITED STATES TREASURY",
          weight: "1.8564%",
        },
        {
          symbol: "CASH",
          name: "Cash Component",
          weight: "0.2213%",
        },
      ],
      parent: {
        firm_name: "Vanguard",
        market: "US ETFs",
        total_net_assets: 976.66,
        fund_flows: 134.9,
        asset_growth_rate: 13.96,
        number_of_funds: 80,
        manager_retention_rate: 91.17,
      },
    },
    portfolio_intelligence: {
      budget: "The client has a suitable budget for ETFs.",
      investment_priority:
        "This ETF has a well-matching risk score to client's input.",
      causes_and_ideas:
        "This ETF has mediocre exposure to the ideas and causes the client wants to support",
      activities_to_avoid:
        "This ETF avoids all the activities that client wants to avoid.",
    },
  },
];

export default withRouter(Detail);
