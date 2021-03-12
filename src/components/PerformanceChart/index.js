import React, { Component } from 'react';
import {
    LineChart,
    Line,
    Legend,
    ResponsiveContainer,
    XAxis,
    Tooltip
} from 'recharts';
import { Icon } from 'rsuite';
import moment from 'moment';

import FinanceAPI from './../../api/financial';

const BENCHMARK_TICKER = 'SPY';

class PerformanceChart extends Component {
    state = {
        selectedRange: '5 Years',
        isLoadingHistorical: false,
        data: [],
        benchmarkData: []
    }

    componentDidMount() {
        if (this.props.suggestion.ticker) {
            this.getBenchmarkData();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.suggestion.ticker !== this.props.suggestion.ticker) {
            this.getHistoricalData();
        }
    }

    getBenchmarkData = async () => {
        try {
            let benchmark = await FinanceAPI.fetchHistoricalIEX({ symbol: BENCHMARK_TICKER, range: '5y' });
            this.setState({
                benchmarkData: benchmark.data
            }, () => {
                this.getHistoricalData();
            });
        } catch (error) {
            alert("Problem getting historical data for benchmark");
        }
    }

    getHistoricalData = async () => {
        this.setState({ isLoadingHistorical: true });
        let priceData = [];

        try {
            let res = await FinanceAPI.fetchHistoricalIEX({ symbol: this.props.suggestion.ticker, range: '5y' });
            priceData = res.data;
        } catch (error) {
            alert("Problem getting historical data for " + this.props.suggestion.ticker, '2017-01-01');
        }

        priceData = mergeSuggestionAndBenchmarkData(priceData, this.state.benchmarkData);

        this.setState({ isLoadingHistorical: false, data: priceData });
    }

    renderTooltip = props => {
        const d = (props.payload && props.payload[0])
            ? props.payload[0].payload
            : null;
        if (!d) {
            return '';
        }

        return (
            <div className="chart-tooltip">
                <p>
                    <i className="iconsminds-calendar-4 mr-5"></i>{d.date}</p>
                <hr></hr>
                <p>{this.props.suggestion.ticker}: {d.suggestionChangeOverTime ? `${(d.suggestionChangeOverTime * 100).toFixed(2)}%` : 'n/a'}</p>
                <p>{BENCHMARK_TICKER}: {(d.benchmarkChangeOverTime * 100).toFixed(2)}%</p>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.state.isLoadingHistorical && <p className="empty-state">
                    <Icon icon="spinner" size="2x" pulse /><br />
                    Loading historical data...</p>}

                {(!this.state.isLoadingHistorical && (!this.state.data || this.state.data.length === 0)) && <p className="empty-state">
                    <Icon icon="exclamation-triangle" size="2x" /><br />
                    Not able to load historical performance, please try again.
                </p>
                }

                {(!this.state.isLoadingHistorical && this.state.data && this.state.data.length > 0) && <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={this.state.data}>
                        <defs>
                            <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2e5bff" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#2e5bff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8c54ff" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8c54ff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Line
                            dataKey="suggestionChangeOverTime"
                            fill="url(#colorMatch)"
                            dot={false}
                            type="monotone"
                            name={this.props.suggestion.ticker}
                            stroke="#6565da"
                            strokeWidth={2} />
                        <Line
                            dataKey="benchmarkChangeOverTime"
                            fill="url(#colorBenchmark)"
                            dot={false}
                            type="monotone"
                            name={BENCHMARK_TICKER}
                            stroke="#ccd2e5"
                            strokeWidth={2} />
                        <Legend align="right" iconSize={10} iconType="circle" verticalAlign="top" />
                        <Tooltip content={this.renderTooltip} />
                        <XAxis
                            dataKey="date"
                            stroke="#e0e7ff"
                            type="category"
                            tickLine={false}
                            tickMargin={8.5}
                            tickFormatter={xTickFormatter}
                            interval={150} />
                    </LineChart>
                </ResponsiveContainer>}
            </div>
        );
    }
}

export default PerformanceChart;

const mergeSuggestionAndBenchmarkData = (suggestion, benchmark) => {
    let res = benchmark;

    res.forEach(day => {
        day.benchmarkClose = day.close;
        day.benchmarkChangeOverTime = day.changeOverTime;

        const suggestionDay = suggestion.find(sd => sd.date === day.date);
        if (suggestionDay) {
            day.suggestionClose = suggestionDay.close;
            day.suggestionChangeOverTime = suggestionDay.changeOverTime;
        }
    });

    return res;
}

const _formatDate = (date, range) => {
    let f = `MMM 'YY`;
    if (range === '1 Month') {
        f = `DD MM`
    }
    // if (range === '5 Years') {     f = `MMM 'YY` }
    return moment(date).format(f);
}

const xTickFormatter = (value, range) => _formatDate(value)