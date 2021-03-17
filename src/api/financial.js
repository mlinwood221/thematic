import axios from 'axios';

const IEX_ROOT_ENV = {
    'development': 'https://sandbox.iexapis.com/stable',
    'production': 'https://cloud.iexapis.com/v1'
};
const IEX_ROOT = IEX_ROOT_ENV[process.env.REACT_APP_ENVIRONMENT];

const IEX_TOKEN_ENV = {
    'local': 'Tpk_fc43757eb7114b1a8e53fca8bd751975',
    'development': 'Tpk_fc43757eb7114b1a8e53fca8bd751975',
    'production': 'pk_c4795239a664448ebacc00cdc35d2e72'
};
const IEX_TOKEN = IEX_TOKEN_ENV[process.env.REACT_APP_ENVIRONMENT];

const fetchHistorical = ({ symbol, from }) => {
    return axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}`);
}

const fetchHistoricalIEX = ({
    symbol,
    range = '1y'
}) => {
    return axios.get(`${IEX_ROOT}/stock/${symbol}/chart/${range}?token=${IEX_TOKEN}`);
}

const fetchStatsIEX = ({ symbol }) => {
    return axios.get(`${IEX_ROOT}/stock/${symbol}/stats?token=${IEX_TOKEN}`);
}

export default {
    fetchHistorical,
    fetchStatsIEX,
    fetchHistoricalIEX
}