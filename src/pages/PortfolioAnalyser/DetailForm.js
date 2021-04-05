import React, { Component } from 'react';
import {
    Button,
    ButtonToolbar,
    Form,
    FormGroup,
    ControlLabel,
    HelpBlock,
    Row,
    Col,
    Toggle,
    SelectPicker,
    TagGroup
} from 'rsuite';

import PersonalInfoForm from './../../components/PersonalInfoForm';
import OptionCard from './../../components/OptionCard';
import OptionTag from './../../components/OptionTag';
import IdeaDetailModal from './../../components/IdeaDetailModal';
import { RISK_OPTIONS, ACTIVITIES, ACLASSES } from './../../service/data/general';
import { THEMES } from './../../service/data/themes';
import { SECTORS } from './../../service/data/sectors';
import { SECURITIES } from './../../service/data/securities';
import { ETFS } from './../../service/data/etfs';
import ClientAPI from './../../api/client';

const newClientInfo = () => {
    return {
        email: '',
        first_name: '',
        last_name: '',
        date_of_birth: '1987-01-01T00:00:00Z',
        retirement_date: '2040-01-01T00:00:00Z',
        address: '',
        city: '',
        state: '',
        budget: 10000,
        monthly_income: true,
        preferences: {
            socially_responsible: true,
            faith_based: false,
            activities_to_avoid: [],
            ideas_to_support: []
        }
    };
}

const themes = () => THEMES;
const activities = () => ACTIVITIES;

class DetailForm extends Component {
    state = {
        isLoading: false,
        // eslint-disable-next-line
        activitiesToAvoid: activities(),
        ideasToSupport: themes(),
        sectors: SECTORS,
        aclasses: ACLASSES,
        restrictedSecurities: [],
        etfPool: [],
        etfUniverse: [],
        sectorPool: [],
        originalClient: null,
        clientInfo: this.props.mode === 'create'
            ? newClientInfo()
            : this.props.client,
        suggestionInfo: {
            include_etfs: true,
            risk_level: 3,
            include_index_market: true,
            include_index_thematic: true,
            include_index_sectoral: true
        }
    }

    personalInfoForm = React.createRef();

    componentDidMount() {
        this.fetchETFs();

        if (this.props.mode === 'edit') {
            this.setState({
                originalClient: JSON.parse(JSON.stringify(this.state.clientInfo))
            });
            this.setSelectedItems();
        } else {
            this.unselectItems();
        }
    }

    fetchETFs = async () => {
        const listETFRequest = {};
        try {
          let res = await ClientAPI.listETFs(listETFRequest);

          var etfs = [];

          for(let i=0; i<res.data.etfs.length; i++){
              etfs.push({
                  "label": res.data.etfs[i].name,
                  "symbol": res.data.etfs[i].ticker
              })
          }

          this.setState({ etfUniverse: etfs });
        } catch (error) {
          console.log("error", error);
          this.setState({
            etfUniverse: [],
          });
        } finally {
          return;
        }
      };

    unselectItems = () => {
        let activitiesToAvoid = this.state.activitiesToAvoid;
        // eslint-disable-next-line
        activitiesToAvoid.map(c => {
            c.selected = false;
        });

        let ideasToSupport = this.state.ideasToSupport;
        // eslint-disable-next-line
        ideasToSupport.map(c => {
            c.selected = false;
        });

        let sectors = this.state.sectors;
        // eslint-disable-next-line
        sectors.map(s => {
            s.selected = false;
        });

        this.setState({ activitiesToAvoid, ideasToSupport, sectors });
    }

    setSelectedItems = () => {
        // Set activities to avoid
        let activitiesToAvoid = this.state.activitiesToAvoid;
        if (this.state.clientInfo.preferences.activities_to_avoid) {
            // eslint-disable-next-line
            activitiesToAvoid.map(c => {
                c.selected = this
                    .state
                    .clientInfo
                    .preferences
                    .activities_to_avoid
                    .findIndex(ci => ci === c.value) !== -1
                    ? true
                    : false;
            });
        }

        const defaultSuggestionInfo = this.state.clientInfo.default_portfolio_params;
        let ideasToSupport = this.state.ideasToSupport;
        let suggestionInfo = this.state.suggestionInfo;
        let restrictedSecurities = this.state.restrictedSecurities;
        let etfPool = this.state.etfPool;
        let sectorPool = this.state.sectorPool;

        if (defaultSuggestionInfo) {
            if (defaultSuggestionInfo.ideas_to_support) {
                // eslint-disable-next-line
                ideasToSupport.map(c => {
                    c.selected = defaultSuggestionInfo
                        .ideas_to_support
                        .findIndex(ci => ci === c.id) !== -1
                        ? true
                        : false;
                });
            }

            suggestionInfo.risk_level = defaultSuggestionInfo.risk_level;
            suggestionInfo.include_index_market = defaultSuggestionInfo
                .index_types
                .findIndex(t => t === 'market') !== -1;
            suggestionInfo.include_index_thematic = defaultSuggestionInfo
                .index_types
                .findIndex(t => t === 'thematic') !== -1;
            suggestionInfo.include_index_sectoral = defaultSuggestionInfo
                .index_types
                .findIndex(t => t === 'sectoral') !== -1;

            etfPool = defaultSuggestionInfo.etf_pool;

            restrictedSecurities = defaultSuggestionInfo.security_restrictions;
            if (defaultSuggestionInfo.sector_restrictions) {
                sectorPool = SECTORS.filter(s => {
                    if (defaultSuggestionInfo.sector_restrictions.findIndex(rs => rs === s.id) !== -1) {
                        return s;
                    }
                });
            }
        }

        this.setState({ activitiesToAvoid, ideasToSupport, suggestionInfo, restrictedSecurities, etfPool, sectorPool });
    }

    handleClientInfoChange = (value, event) => {
        let clientInfo = this.state.clientInfo;
        clientInfo[event.target.name] = value;
        this.setState({ clientInfo });
    }

    handleClientInfoPreferenceChange = (value, event) => {
        let clientInfo = this.state.clientInfo;
        clientInfo.preferences[event.target.name] = value;
        this.setState({ clientInfo });
    }

    handleSelectActivity = (activity) => {
        let activitiesToAvoid = this.state.activitiesToAvoid;
        let index = activitiesToAvoid.findIndex(a => a.label === activity.label);
        activitiesToAvoid[index].selected = !activity.selected;
        this.setState({ activitiesToAvoid });
    }

    handleSelectIdea = (idea) => {
        let ideasToSupport = this.state.ideasToSupport;
        let index = ideasToSupport.findIndex(c => c.id === idea.id);
        ideasToSupport[index].selected = !idea.selected;
        this.setState({ ideasToSupport });
    }

    handleSuggestionInfoChange = (value, event) => {
        let suggestionInfo = this.state.suggestionInfo;
        suggestionInfo[event.target.name] = value;
        this.setState({ suggestionInfo });
    }

    handleShowIdeaDetail = (idea) => {
        this.setState({ isIdeaDetailVisible: true, selectedIdeaDetail: idea });
    }

    handleHideIdeaDetail = (idea) => {
        this.setState({ isIdeaDetailVisible: false, selectedIdeaDetail: {} });
    }

    handleSelectAClass = (aclass) => {
        let aclasses = this.state.aclasses;
        let index = aclasses.findIndex(s => s.id === aclass.id);
        aclasses[index].selected = !aclass.selected;
        this.setState({ aclasses });
    }

    handleSelectSector = (sector) => {
        let sectors = this.state.sectors;
        let index = sectors.findIndex(s => s.id === sector.id);
        sectors[index].selected = !sector.selected;
        this.setState({ sectors });
    }

    handleToggleSectors = (sector, preventRemove) => {
        let sectorPool = this.state.sectorPool;

        if (!sectorPool) { sectorPool = [] }
        let sectorIndex = sectorPool.findIndex(s => s.id === sector.id);

        if (!preventRemove && sectorIndex !== -1) {
            sectorPool.splice(sectorIndex, 1);
        }

        if (sectorIndex === -1) {
            sectorPool.push(sector);
        }

        this.setState({ sectorPool });
    }

    handleToggleETFPool = (etfTicker, preventRemove) => {
        let etfPool = this.state.etfPool;
        if (!etfPool) { etfPool = [] }
        let etfIndex = etfPool.findIndex(s => s === etfTicker);

        if (!preventRemove && etfIndex !== -1) {
            etfPool.splice(etfIndex, 1);
        }

        if (etfIndex === -1) {
            etfPool.push(etfTicker);
        }

        this.setState({ etfPool });
    }

    handleToggleRestrictedSecurity = (restrictedTicker, preventRemove) => {
        let restrictedSecurities = this.state.restrictedSecurities;
        let sIndex = restrictedSecurities.findIndex(s => s === restrictedTicker);

        if (!preventRemove && sIndex !== -1) {
            restrictedSecurities.splice(sIndex, 1);
        }

        if (sIndex === -1) {
            restrictedSecurities.push(restrictedTicker);
        }

        this.setState({ restrictedSecurities });
    }

    handleSubmit = async () => {
        // eslint-disable-next-line
        let clientRequest = constructRequest({
            activities: this.state.activitiesToAvoid,
            ideas: this.state.ideasToSupport,
            etfPool: this.state.etfPool,
            restrictedSectors: this.state.sectorPool,
            suggestionInfo: this.state.suggestionInfo
        });

        console.log(clientRequest);

        this.props.onSuccess(clientRequest);
    }


    render() {
        const { clientInfo } = this.state;
        const submitBtnLabel = this.props.mode === 'create'
            ? 'Submit and get suggestions'
            : 'Update and get suggestions';

        return (
            <div>
                <Form>
                    {/* Portfolio info */}
                    <div className="card mb-30">
                        <h3 className="card-title">Portfolio Details</h3>
                        <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={18} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Portfolio Constituents</ControlLabel>
                                    <HelpBlock>Select up to 20 supported securities you want to get screened. </HelpBlock>

                                    <SelectPicker
                                        block={true}
                                        value="Search for ETFs"
                                        style={{
                                            width: '100%'
                                        }}
                                        data={this.state.etfUniverse}
                                        placement="bottomStart"
                                        onSelect={(value, item) => this.handleToggleETFPool(item.symbol, true)} /> {/*  */}

                                    {this.state.etfPool && <TagGroup>
                                        {this
                                            .state
                                            .etfPool
                                            .map((ticker, k) => <OptionTag
                                                key={k}
                                                label={ticker}
                                                selected={true}
                                                showRemover={true}
                                                onSelect={() => this.handleToggleETFPool(ticker)} />)}
                                    </TagGroup>}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={12} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Risk tolerance</ControlLabel>
                                    <HelpBlock>Which level of risk is the client comfortable with?</HelpBlock>
                                    <SelectPicker
                                        searchable={false}
                                        style={{
                                            width: '100%'
                                        }}
                                        cleanable={false}
                                        data={RISK_OPTIONS}
                                        value={this.state.suggestionInfo.risk_level}
                                        onChange={(value, event) => this.handleSuggestionInfoChange(value, {
                                            target: {
                                                name: 'risk_level'
                                            }
                                        })} />
                                </FormGroup>
                            </Col>
                        </Row>
                    </div >
                    {/* Preferences */}
                    <div className="card mb-30">
                        <h3 className="card-title">ACTIVITIES TO AVOID</h3>
                        <h4 className="card-subtitle">Select which activities the client would like to avoid and we will screen the selected securities according to them.</h4>

                        <Row className="mb-20">
                            <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                                <FormGroup>
                                    {/* <ControlLabel>Activities to avoid</ControlLabel>
                                    <HelpBlock>Select which activities the client would like to avoid and we will try to minimize their involvement.</HelpBlock> */}
                                    {this
                                        .state
                                        .activitiesToAvoid
                                        .map((a, k) => <OptionCard
                                            key={k}
                                            label={a.label}
                                            icon={a.icon}
                                            selected={a.selected}
                                            onSelect={() => this.handleSelectActivity(a)} />)}
                                </FormGroup>
                            </Col>
                        </Row>
                    </div>

                    {/* Causes and ideas */}
                    <div className="card mb-30">
                        <h3 className="card-title">Causes and ideas</h3>
                        <h4 className="card-subtitle">Select which causes and ideas the client would like to support and we will screen the selected securities according to them.</h4>

                        <Row className="mb-20">
                            <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                                {this
                                    .state
                                    .ideasToSupport
                                    .map((c, k) => <OptionCard
                                        key={k}
                                        label={c.name}
                                        icon={c.icon}
                                        selected={c.selected}
                                        detailIcon="iconsminds-information"
                                        onDetailIconClick={() => this.handleShowIdeaDetail(c)}
                                        onSelect={(e) => {
                                            if (e.target.className === 'detail-icon') {
                                                return;
                                            }

                                            this.handleSelectIdea(c)
                                        }} />)}
                                {/* <OptionCard
                                    key="more"
                                    label="More causes and ideas added regularly"
                                    icon="iconsminds-synchronize"
                                    selected={false}
                                    disabled={true}
                                    disableImportant={true}
                                    detailIcon="iconsminds-information"
                                /> */}
                            </Col>
                        </Row>
                    </div>
                </Form >

                <FormGroup className="mt-10 text-center">
                    <ButtonToolbar>
                        <Button
                            appearance="primary"
                            className="btn --purple mr-20"
                            style={{
                                width: '260px'
                            }}
                            onClick={this.handleSubmit}>
                            {this.state.isLoading
                                ? 'Loading...'
                                : submitBtnLabel}
                        </Button>
                        <Button
                            appearance="default"
                            className="btn --secondary"
                            onClick={this.props.onCancel}>Cancel</Button>
                    </ButtonToolbar>
                </FormGroup>

                {this.state.isIdeaDetailVisible && <IdeaDetailModal idea={this.state.selectedIdeaDetail} onClose={this.handleHideIdeaDetail} />}
            </div >
        );
    }
}

export default DetailForm;

const constructRequest = (data) => {
    let r = {};
    r.budget = 5000;
    r.activities_to_avoid = data
        .activities
        .filter(a => a.selected)
        .map(a => a.value);
    r.ideas_to_support = data
        .ideas
        .filter(i => i.selected)
        .map(i => i.id);

    // Set portfolio params
    r.default_portfolio_params = {
        suggestion_types: ['etf'],
        ideas_to_support: r.ideas_to_support,
        index_types: _setIndexTypes(data.suggestionInfo),
        etf_pool: data.etfPool,
        risk_level: data.suggestionInfo.risk_level
    };

    return r;
}

const _setIndexTypes = (suggestionInfo) => {
    let t = [];
    if (suggestionInfo.include_index_market) {
        t.push('market');
    }
    if (suggestionInfo.include_index_thematic) {
        t.push('thematic');
    }
    if (suggestionInfo.include_index_sectoral) {
        t.push('sectoral');
    }
    return t;
}

const getDiff = (o1, o2) => {
    return Object
        .keys(o2)
        .reduce((diff, key) => {
            if (o1[key] === o2[key])
                return diff
            return {
                ...diff,
                [key]: o2[key]
            }
        }, {});
}