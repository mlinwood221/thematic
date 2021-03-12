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
        sectorPool: [],
        originalClient: null,
        clientInfo: this.props.mode === 'create'
            ? newClientInfo()
            : this.props.client,
        suggestionInfo: {
            include_etfs: true,
            risk_level: 1,
            include_index_market: true,
            include_index_thematic: true,
            include_index_sectoral: true
        }
    }

    personalInfoForm = React.createRef();

    componentDidMount() {
        if (this.props.mode === 'edit') {
            this.setState({
                originalClient: JSON.parse(JSON.stringify(this.state.clientInfo))
            });
            this.setSelectedItems();
        } else {
            this.unselectItems();
        }
    }

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
        const personalInfoForm = this.personalInfoForm.current;
        const info = personalInfoForm.state.clientInfo;

        if (!info.first_name || !info.last_name || !info.budget || !info.date_of_birth || !info.retirement_date) {
            alert('Please enter required information (marked with *).')
            return;
        }

        // eslint-disable-next-line
        let clientRequest = constructRequest({
            info,
            activities: this.state.activitiesToAvoid,
            ideas: this.state.ideasToSupport,
            restrictedSecurities: this.state.restrictedSecurities,
            etfPool: this.state.etfPool,
            restrictedSectors: this.state.sectorPool,
            suggestionInfo: this.state.suggestionInfo
        });

        if (this.props.mode === 'create') {
            try {
                this.setState({ isLoading: true });
                let res = await ClientAPI.create(clientRequest);
                this
                    .props
                    .onSuccess(res.data.id);
            } catch (error) {
                console.log("error")
                alert("There hes been an error...")
            } finally {
                this.setState({ isLoading: false });
                return;
            }
        }

        try {
            let updateRequest = getDiff(this.state.originalClient, clientRequest); // get only the updated fields
            if (Object.keys(updateRequest).length === 0) {
                alert("No updates made");
                return;
            }
            updateRequest.id = this.state.clientInfo.id;
            this.setState({ isLoading: true });
            await ClientAPI.update(updateRequest);
            this
                .props
                .onSuccess(updateRequest.id);
        } catch (error) {
            console.log("error")
            alert("There hes been an error updating client...")
        } finally {
            this.setState({ isLoading: false });
            return;
        }
    }


    render() {
        const { clientInfo } = this.state;
        const submitBtnLabel = this.props.mode === 'create'
            ? 'Submit and get suggestions'
            : 'Update and get suggestions';

        return (
            <div>
                <Form>
                    {/* Personal info */}
                    <div className="card mb-30">
                        <h3 className="card-title">Personal Data</h3>

                        <PersonalInfoForm ref={this.personalInfoForm} info={this.state.clientInfo} />
                    </div>

                    {/* Preferences */}
                    <div className="card mb-30">
                        <h3 className="card-title">ACTIVITIES TO AVOID</h3>
                        <h4 className="card-subtitle">Select which activities the client would like to avoid and we will try to minimize their involvement.</h4>

                        {/* <Row className="mb-20">
                            <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Socially Responsible</ControlLabel>
                                    <HelpBlock
                                        style={{
                                            width: '60%',
                                            float: 'left'
                                        }}>The client is interested in SRI</HelpBlock>
                                    <Toggle
                                        checked={clientInfo.preferences.socially_responsible}
                                        onChange={(value) => this.handleClientInfoPreferenceChange(value, {
                                            target: {
                                                name: 'socially_responsible'
                                            }
                                        })} />
                                </FormGroup>
                            </Col>

                            <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Faith-based</ControlLabel>
                                    <HelpBlock
                                        style={{
                                            width: '70%',
                                            float: 'left'
                                        }}>The client wants to align investments with his/her faith</HelpBlock>
                                    <Toggle
                                        disabled={true}
                                        checked={clientInfo.preferences.faith_based}
                                        onChange={(value) => this.handleClientInfoPreferenceChange(value, {
                                            target: {
                                                name: 'faith_based'
                                            }
                                        })} />
                                </FormGroup>
                            </Col>
                        </Row> */}

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
                        <h4 className="card-subtitle">Select which causes and ideas the client would like to support and we will try to maximize exposure to them.</h4>

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

                    {/* Portfolio info */}
                    <div className="card mb-30">
                        <h3 className="card-title">Portfolio info</h3>

                        <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={6} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>ETF Tactical Exposure</ControlLabel>
                                    <HelpBlock
                                        style={{
                                            width: '70%',
                                            float: 'left',
                                            marginRight: "20px"
                                        }}>Get tactical exposure to selected client criteria with ETFs</HelpBlock>
                                    <Toggle
                                        disabled={true}
                                        // checked={this.state.suggestionInfo.include_etfs}
                                        checked={true}
                                        onChange={(value) => this.handleSuggestionInfoChange(value, {
                                            target: {
                                                name: 'include_etfs'
                                            }
                                        })} />
                                </FormGroup>
                            </Col>

                            <Col xs={20} xsOffset={2} md={7} mdOffset={1}>
                                <FormGroup>
                                    <ControlLabel>Direct Tactical Exposure</ControlLabel>
                                    <HelpBlock
                                        style={{
                                            width: '70%',
                                            float: 'left',
                                            marginRight: "20px",
                                            paddingTop: "0px"
                                        }}><span style={{ fontSize: "10px", color: "#6565da" }}>Coming Soon</span><br></br>Get tactical exposure to selected client criteria with direct indexing</HelpBlock>
                                    <Toggle
                                        disabled={true}
                                        checked={false}
                                    />
                                </FormGroup>
                            </Col>

                            {/* <Col xs={20} xsOffset={2} md={7} mdOffset={1}>
                                <FormGroup>
                                    <ControlLabel>Full Portfolio</ControlLabel>
                                    <HelpBlock
                                        style={{
                                            width: '70%',
                                            float: 'left',
                                            marginRight: "20px",
                                            paddingTop: "0px"
                                        }}><span style={{ fontSize: "10px", color: "#6565da" }}>Coming Soon</span><br></br>Get full portfolio suggestion for selected client criteria</HelpBlock>
                                    <Toggle
                                        disabled={true}
                                        checked={false}
                                    />
                                </FormGroup>
                            </Col> */}

                            {
                                // this.state.suggestionInfo.include_etfs &&
                                // <Col
                                //     xs={20}
                                //     xsOffset={2}
                                //     md={24}
                                //     mdOffset={0}
                                //     style={{
                                //         background: '#fcfcfc',
                                //         border: '1px solid #eee',
                                //         height: 'auto',
                                //         margin: '15px 0',
                                //         padding: '15px 15px'
                                //     }}
                                // >
                                //     <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                //         <FormGroup>
                                //             <ControlLabel>Market Indices</ControlLabel>
                                //             <HelpBlock
                                //                 style={{
                                //                     width: '60%',
                                //                     float: 'left'
                                //                 }}>Include ETFs that track <br></br>market indices</HelpBlock>
                                //             <Toggle
                                //                 checked={this.state.suggestionInfo.include_index_market}
                                //                 onChange={(value) => this.handleSuggestionInfoChange(value, {
                                //                     target: {
                                //                         name: 'include_index_market'
                                //                     }
                                //                 })} />
                                //         </FormGroup>
                                //     </Col>

                                //     <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                //         <FormGroup>
                                //             <ControlLabel>Thematic Indices</ControlLabel>
                                //             <HelpBlock
                                //                 style={{
                                //                     width: '60%',
                                //                     float: 'left'
                                //                 }}>Include ETFs that track thematic indices</HelpBlock>
                                //             <Toggle
                                //                 checked={this.state.suggestionInfo.include_index_thematic}
                                //                 onChange={(value) => this.handleSuggestionInfoChange(value, {
                                //                     target: {
                                //                         name: 'include_index_thematic'
                                //                     }
                                //                 })} />
                                //         </FormGroup>
                                //     </Col>

                                //     <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                //         <FormGroup>
                                //             <ControlLabel>Custom ETFs</ControlLabel>
                                //             <HelpBlock
                                //                 style={{
                                //                     width: '50%',
                                //                     float: 'left'
                                //                 }}>Select and define your own ETF pool</HelpBlock>
                                //             <SelectPicker
                                //                 block={false}
                                //                 value="Search for ETFs"
                                //                 disabled={true}
                                //                 style={{
                                //                     width: '40%',
                                //                     float: 'right',
                                //                     marginTop: '-15px'
                                //                 }}
                                //                 data={[{
                                //                     label: 'COMING SOON'
                                //                 }
                                //                 ]}
                                //                 placement="bottom"
                                //                 onSelect={(value, item) => { }} /> {/*  */}
                                //         </FormGroup>
                                //     </Col>
                                // </Col>
                                // }

                                <Col xs={20} xsOffset={2} md={24} mdOffset={0}></Col>
                            }
                            {/* <Col xs={20} xsOffset={2} md={6} mdOffset={0} className="mt-25">
                                <FormGroup>
                                    <ControlLabel>Direct Indexing</ControlLabel>
                                    <HelpBlock
                                        style={{
                                            width: '70%',
                                            float: 'left'
                                        }}>Allow direct indexing</HelpBlock>
                                    <Toggle
                                        checked={this.state.suggestionInfo.direct_indexing}
                                        disabled={true}
                                        onChange={(value) => this.handleSuggestionInfoChange(value, {
                                            target: {
                                                name: 'direct_indexing'
                                            }
                                        })} />
                                </FormGroup>
                            </Col> */}

                            <Col xs={20} xsOffset={2} md={8} mdOffset={0}>
                                {this.state.suggestionInfo.direct_indexing && <p className="coming-soon-directindexing">Coming soon</p>}
                            </Col>
                        </Row>

                        <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={20} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Asset Classes</ControlLabel>
                                    <HelpBlock>What asset classes would you like your client to be invested in? <br></br></HelpBlock>

                                    <TagGroup>
                                        <OptionTag
                                            label="US Equities - Market Indices"
                                            selected={this.state.suggestionInfo.include_index_market}
                                            onSelect={() => this.handleSuggestionInfoChange(
                                                !this.state.suggestionInfo.include_index_market, {
                                                target: {
                                                    name: 'include_index_market'
                                                }
                                            })}
                                        />
                                        <OptionTag
                                            label="US Equities - Thematic Indices"
                                            selected={this.state.suggestionInfo.include_index_thematic}
                                            onSelect={(value) => this.handleSuggestionInfoChange(
                                                !this.state.suggestionInfo.include_index_thematic, {
                                                target: {
                                                    name: 'include_index_thematic'
                                                }
                                            })}
                                        />
                                        <OptionTag
                                            label="US Equities - Sectoral Indices"
                                            selected={this.state.suggestionInfo.include_index_sectoral}
                                            onSelect={(value) => this.handleSuggestionInfoChange(
                                                !this.state.suggestionInfo.include_index_sectoral, {
                                                target: {
                                                    name: 'include_index_sectoral'
                                                }
                                            })}
                                        />
                                        {/* <OptionTag
                                            label="International Equities"
                                            disabled={true}
                                            selected={false}
                                        />
                                        <OptionTag
                                            label="Real Estate"
                                            disabled={true}
                                            selected={false}
                                        />
                                        <OptionTag
                                            label="Commodities"
                                            disabled={true}
                                            selected={false}
                                        />
                                        <OptionTag
                                            label="More Coming Soon"
                                            disabled={true}
                                            selected={false}
                                        /> */}
                                    </TagGroup>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={18} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Define your ETF Pool</ControlLabel>
                                    <HelpBlock>You can restrict our suggestions to the ETFs you want to work with for this client. <br></br> <strong>Skip if you want to consider all the ETFs in available universe</strong>. </HelpBlock>

                                    <SelectPicker
                                        block={true}
                                        value="Search for ETFs"
                                        style={{
                                            width: '100%'
                                        }}
                                        data={ETFS}
                                        placement="topStart"
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

                        <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={18} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Sector Restrictions</ControlLabel>
                                    <HelpBlock>Which sectors would you like to <strong>exclude</strong> from this portfolio?</HelpBlock>

                                    <SelectPicker
                                        block={true}
                                        value="Search for sectors"
                                        style={{
                                            width: '100%'
                                        }}
                                        data={SECTORS}
                                        placement="topStart"
                                        onSelect={(value, item) => this.handleToggleSectors(item, true)} /> {/*  */}

                                    {this.state.sectorPool && <TagGroup>
                                        {this
                                            .state
                                            .sectorPool
                                            .map((sector, k) => <OptionTag
                                                key={k}
                                                label={sector.label}
                                                selected={true}
                                                showRemover={true}
                                                onSelect={() => this.handleToggleSectors(sector)} />)}
                                    </TagGroup>}
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={18} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Sector Restrictions</ControlLabel>
                                    <HelpBlock>Which sectors would you like to <strong>exclude</strong> from this portfolio?</HelpBlock>

                                    <TagGroup>
                                        {this
                                            .state
                                            .sectors
                                            .map((s, k) => <OptionTag
                                                key={k}
                                                label={s.label}
                                                selected={s.selected}
                                                onSelect={() => this.handleSelectSector(s)} />)}
                                    </TagGroup>
                                </FormGroup>
                            </Col>
                        </Row> */}

                        <Row className="mb-50">
                            <Col xs={20} xsOffset={2} md={18} mdOffset={0}>
                                <FormGroup>
                                    <ControlLabel>Security Restrictions</ControlLabel>
                                    <HelpBlock>Which securities would you like to exclude from this portfolio?</HelpBlock>

                                    <SelectPicker
                                        block={true}
                                        value="Search"
                                        style={{
                                            width: '100%'
                                        }}
                                        data={SECURITIES}
                                        placement="topStart"
                                        onSelect={(value, item) => this.handleToggleRestrictedSecurity(item.symbol, true)} /> {/*  */}

                                    {this.state.restrictedSecurities && <TagGroup>
                                        {this
                                            .state
                                            .restrictedSecurities
                                            .map((ticker, k) => <OptionTag
                                                key={k}
                                                label={ticker}
                                                selected={true}
                                                showRemover={true}
                                                onSelect={() => this.handleToggleRestrictedSecurity(ticker)} />)}
                                    </TagGroup>}
                                </FormGroup>
                            </Col>
                        </Row>
                    </div >
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
    let r = data.info;
    r.budget = parseInt(data.info.budget);
    r.preferences.activities_to_avoid = data
        .activities
        .filter(a => a.selected)
        .map(a => a.value);
    r.preferences.ideas_to_support = data
        .ideas
        .filter(i => i.selected)
        .map(i => i.id);

    // Set portfolio params
    r.default_portfolio_params = {
        suggestion_types: ['etf'],
        ideas_to_support: r.preferences.ideas_to_support,
        index_types: _setIndexTypes(data.suggestionInfo),
        sector_restrictions: data
            .restrictedSectors
            .map(i => i.id),
        security_restrictions: data.restrictedSecurities,
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