import axios from 'axios';

const API_ROOT_ENV = {
    // 'development': 'http://localhost:8080/v1',
    'development':'http://thematicapi-env.eba-agr4ihb7.us-west-2.elasticbeanstalk.com/v1',
    // 'development': 'http://thematic-api-dev.us-east-2.elasticbeanstalk.com/v1',
    'production': 'https://core.usethematic.com/v1'
};

const API_BASE = API_ROOT_ENV[process.env.NODE_ENV];

var aInstance;

const createAxiosInstance = () => { 
    aInstance = axios.create({
        baseURL: "",
        headers: {
            "content-type": "application/json"
        },
        responseType: "json"
        });
    aInstance.interceptors.response.use(
        undefined,
        (err) => {
            if(err.response.status === 401) {
                localStorage.removeItem('t__isAuthenticated');
                localStorage.removeItem('t__demo-user');
                alert("Unauthorized, please login again");
                window.location="/";
            }
            return Promise.reject(err);
        }
        );
}

const getConfig = () => ({
    headers: {
        Authorization: JSON
            .parse(localStorage.getItem('t__demo-user'))
            .auth_key
    }
});

const setProspectConfig = (aID) => ({
    headers: {
        "X-Advisor-ID": aID
    }
});

const login = (data) => {
    return aInstance.post(API_BASE + "/iam/login", data)
}

const current = () => {
    return aInstance.post(API_BASE + "/iam/current", {}, getConfig());
}

const embeddedCurrent = (aID) => {
    return aInstance.post(API_BASE + "/iam/embedded_current", {}, setProspectConfig(aID))
}

const updatePassword = (data) => {
    return aInstance.post(API_BASE + "/iam/update_password", data, getConfig());
}

const newProspect = (data, aID) => {
    return aInstance.post(API_BASE + '/prospects/new', data, setProspectConfig(aID))
}

const create = (data) => {
    return aInstance.post(API_BASE + '/clients/create', data, getConfig());
}

const update = (data) => {
    return aInstance.post(API_BASE + '/clients/update', data, getConfig());
}

const remove = (data) => {
    return aInstance.post(API_BASE + '/clients/delete', data, getConfig());
}

const list = (data) => {
    return aInstance.post(API_BASE + '/clients/list', data, getConfig());
}

const details = (data) => {
    return aInstance.post(API_BASE + '/clients/details', data, getConfig());
}

const fetchSuggestion = (data) => {
    return aInstance.post(API_BASE + '/portfolios/suggest_for_client', data, getConfig());
}

const paymentSession = (id) => {
    return aInstance.post(API_BASE + '/payments/create_session/'+id, {}, getConfig());
}

const updateSubscription = (data) => {
    return aInstance.post(API_BASE + '/payments/update_subscription', data, getConfig());
}

const cancelSubscription = (data) => {
    return aInstance.post(API_BASE + '/payments/cancel_subscription', data, getConfig());
}

export default {
    createAxiosInstance,
    login,
    current,
    embeddedCurrent,
    updatePassword,
    create,
    newProspect,
    update,
    remove,
    list,
    details,
    fetchSuggestion,
    paymentSession,
    updateSubscription,
    cancelSubscription
};