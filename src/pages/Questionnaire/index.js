import React, { Component } from 'react';
import OptionCard from './../../components/OptionCard';
import OptionTag from './../../components/OptionTag';
import IdeaDetailModal from './../../components/IdeaDetailModal';
import { SECTORS, RISK_OPTIONS, ACTIVITIES, ACLASSES } from './../../service/data/general';
import { THEMES } from './../../service/data/themes';
import { SECURITIES } from './../../service/data/securities';
import { Row, Col, Button, Placeholder, SelectPicker, TagGroup, Modal } from 'rsuite';
import ClientAPI from './../../api/client';

const themes = () => THEMES;
const activities = () => ACTIVITIES;

class Questionnaire extends Component {
    state = {
        currentStep: 0,
        restrictedSecurities: [],
        adviser: {},
        activitiesToAvoid: activities(),
        ideasToSupport: themes(),
        clientInfo: {
            age: "",
            retirement: "",
            budget: "",
            first_name: "",
            last_name: "",
            email: ""
        },
        isEmbedModalVisible: false,
        copySuccess: false
    }

    componentDidMount() {
        this.fetchCurrent();
    }

    getQuestionnaireBaseUrl = () => {
        if(process.env.NODE_ENV ==='development'){
            return "http://localhost:3000"
        }
        if(process.env.NODE_ENV==='production'){
            return "https://app.usethematic.com"
        }
    }

    fetchCurrent = async () => {
        try {
            this.setState({ isLoading: true });
            let res = await ClientAPI.current();
            this.setState({
                adviser: res.data
            });
        } catch (error) {
            console.log("error")
            alert("There has been an error...")
        } finally {
            this.setState({ isLoading: false });
            return;
        }
    }

    handleSelectIdea = (idea) => {
        let ideasToSupport = this.state.ideasToSupport;
        let index = ideasToSupport.findIndex(c => c.id === idea.id);
        ideasToSupport[index].selected = !idea.selected;
        this.setState({ ideasToSupport });
    }

    handleShowIdeaDetail = (idea) => {
        this.setState({ isIdeaDetailVisible: true, selectedIdeaDetail: idea });
    }

    handleHideIdeaDetail = (idea) => {
        this.setState({ isIdeaDetailVisible: false, selectedIdeaDetail: {} });
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

    handleSelectActivity = (activity) => {
        let activitiesToAvoid = this.state.activitiesToAvoid;
        let index = activitiesToAvoid.findIndex(a => a.label === activity.label);
        activitiesToAvoid[index].selected = !activity.selected;
        this.setState({ activitiesToAvoid });
    }

    createClient = async () => {
        let clientInfo = this.state.clientInfo;

        let activities = this.state.activitiesToAvoid
            .filter(a => a.selected)
            .map(a => a.value);
        let ideas = this.state.ideasToSupport
            .filter(i => i.selected)
            .map(i => i.id);

        let defaultParams = {
            suggestion_types: ['etf'],
            ideas_to_support: ideas,
            index_types: ['market', 'thematic', 'sectoral'],
            security_restrictions: this.state.restrictedSecurities,
            risk_level: 3
        }

        let req = {
            budget: parseInt(clientInfo.budget),
            date_of_birth: new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(clientInfo.age))).toISOString(),
            retirement_date: new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(clientInfo.retirement))).toISOString(),
            email: clientInfo.email,
            first_name: clientInfo.first_name,
            last_name: clientInfo.last_name,
            preferences: {
                socially_responsible: true,
                activities_to_avoid: activities,
                ideas_to_support: ideas
            },
            default_portfolio_params: defaultParams
        }

        try {
            let res = await ClientAPI.create(req);
        } catch (error) {
            alert("There has been an error creating a new client - check whether the client with this email already exists")
        } finally {
            this.setState({ isLoading: false });
            return;
        }
    }

    nextStep = () => {
        let currentStep = this.state.currentStep;
        currentStep++;
        this.setState({ currentStep })

        if (currentStep == 8) {
            this.createClient();
        }
    }

    previousStep = () => {
        let currentStep = this.state.currentStep;
        currentStep--;
        this.setState({ currentStep })
    }

    goToDashboard = () => {
        this.unselectItems();

        let clientInfo = this.state.clientInfo;
        clientInfo = {
            age: "",
            retirement: "",
            budget: "",
            first_name: "",
            last_name: "",
            email: ""
        }

        this
            .props
            .history
            .push('/clients');
    }

    retake = () => {
        this.unselectItems();

        let clientInfo = this.state.clientInfo;
        clientInfo = {
            age: "",
            retirement: "",
            budget: "",
            first_name: "",
            last_name: "",
            email: ""
        }

        let currentStep = this.state.currentStep;
        currentStep = 0;

        this.setState({ currentStep, clientInfo });
    }

    handleInfoChange = (event) => {
        let clientInfo = this.state.clientInfo;
        clientInfo[event.target.name] = event.target.value;
        this.setState({ clientInfo });
    }

    handleShowEmbed = () => {
        this.setState({ isEmbedModalVisible: true })
    }

    handleHideEmbed = () => {
        this.setState({ isEmbedModalVisible: false })
    }

    copyToClipboard = (e) => {
        this.textArea.select();
        document.execCommand('copy');
        // This is just personal preference.
        // I prefer to not show the the whole text area selected.
        e.target.focus();
        this.setState({ copySuccess: true });
    };

    openInNewTab = (e) => {
        let link = this.textArea.value;
        window.open(link, '_blank');
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

        let restrictedSecurities = this.state.restrictedSecurities;
        restrictedSecurities = [];

        this.setState({ activitiesToAvoid, ideasToSupport, restrictedSecurities });
    }

    renderStep = (idx) => {
        switch (idx) {
            case 0:
                return <div className="step-1">
                    <Row>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8}>
                            <img
                                src="/img/questionnaire.png" alt="Questionnaire" className="questionnaire-logo" />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} xsOffset={6} md={12} mdOffset={6}>
                            <h4 className="initial-title">Let's build you a personalized portfolio</h4>
                            <p className="initial-subtitle">It will take only 1 minute, so we can create <br></br> a portfolio tailored specifically to you</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button onClick={this.nextStep} className="questionnaire-button">
                                OK let's go
                                    </Button>
                        </Col>
                    </Row>
                </div>
            case 1:
                return <div className="step-2">
                    <Row className="mb-30">
                        <Col xs={16} xsOffset={4} md={16} mdOffset={4}>
                            <h3 className="standard-question">Which causes and ideas would you like to support with your investments?</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                            <div className="centered">
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
                            </div>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button onClick={this.nextStep} className="questionnaire-button">
                                Continue
                                    </Button>
                            <br></br>
                            <br></br>
                            <a onClick={this.previousStep} className="questionnaire-secondary-button">Go back</a>
                        </Col>
                    </Row>
                    {this.state.isIdeaDetailVisible && <IdeaDetailModal idea={this.state.selectedIdeaDetail} onClose={this.handleHideIdeaDetail} />}
                </div>
            case 2:
                return <div className="step-3">
                    <Row className="mb-30">
                        <Col xs={16} xsOffset={4} md={16} mdOffset={4}>
                            <h3 className="standard-question">Activities you want to avoid investing in</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                            <div className="centered">
                                {this
                                    .state
                                    .activitiesToAvoid
                                    .map((a, k) => <OptionCard
                                        key={k}
                                        label={a.label}
                                        icon={a.icon}
                                        selected={a.selected}
                                        onSelect={() => this.handleSelectActivity(a)} />)}
                            </div>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button onClick={this.nextStep} className="questionnaire-button">
                                Continue
                                    </Button>
                            <br></br>
                            <br></br>
                            <a onClick={this.previousStep} className="questionnaire-secondary-button">Go back</a>
                        </Col>
                    </Row>
                </div>
            case 3:
                return <div className="step-4">
                    <Row className="mb-30">
                        <Col xs={16} xsOffset={4} md={16} mdOffset={4}>
                            <h3 className="standard-question">Are there any specific companies <br></br> that must be excluded?</h3>
                        </Col>
                    </Row>
                    <Row style={{ textAlign: "center" }}>
                        <Col xs={20} xsOffset={2} md={24} mdOffset={0}>
                            <SelectPicker
                                block={true}
                                value="Search"
                                style={{
                                    width: '100%'
                                }}
                                data={SECURITIES}
                                placement="bottom"
                                onSelect={(value, item) => this.handleToggleRestrictedSecurity(item.symbol, true)} />

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
                        </Col>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button onClick={this.nextStep} className="questionnaire-button">
                                Continue
                                    </Button>
                            <br></br>
                            <br></br>
                            <a onClick={this.previousStep} className="questionnaire-secondary-button">Go back</a>
                        </Col>
                    </Row>
                </div>
            case 4:
                return <div className="step-5">
                    <Row className="mb-30">
                    </Row>
                    <Row style={{ textAlign: "center" }}>
                        <form>
                            <h2 className="sentence">I'm <input
                                value={this.state.clientInfo.age}
                                onChange={this.handleInfoChange}
                                name="age"
                                className="sentence-input"
                                type="text"
                            /> years old</h2>
                        </form>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button disabled={!this.state.clientInfo.age || isNaN(parseInt(this.state.clientInfo.age)) || parseInt(this.state.clientInfo.age) < 18 || parseInt(this.state.clientInfo.age) > 110} onClick={this.nextStep} className="questionnaire-button">
                                Continue
                                    </Button>
                            <br></br>
                            <br></br>
                            <a onClick={this.previousStep} className="questionnaire-secondary-button">Go back</a>
                        </Col>
                    </Row>
                </div>
            case 5:
                return <div className="step-6">
                    <Row className="mb-30">
                    </Row>
                    <Row style={{ textAlign: "center" }}>
                        <form>
                            <h2 className="sentence">I would like to retire in <input
                                value={this.state.clientInfo.retirement}
                                onChange={this.handleInfoChange}
                                name="retirement"
                                className="sentence-input" type="text" /> years</h2>
                        </form>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button disabled={!this.state.clientInfo.retirement || isNaN(parseInt(this.state.clientInfo.retirement)) || parseInt(this.state.clientInfo.retirement) < 1} onClick={this.nextStep} className="questionnaire-button">
                                Continue
                                    </Button>
                            <br></br>
                            <br></br>
                            <a onClick={this.previousStep} className="questionnaire-secondary-button">Go back</a>
                        </Col>
                    </Row>
                </div>
            case 6:
                return <div className="step-7">
                    <Row className="mb-30">
                    </Row>
                    <Row style={{ textAlign: "center" }}>
                        <form>
                            <h2 className="sentence">I would like to start investing $<input
                                className="sentence-input-long"
                                name="budget"
                                value={this.state.clientInfo.budget}
                                onChange={this.handleInfoChange}
                                type="text"
                            /></h2>
                        </form>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button disabled={!this.state.clientInfo.budget || isNaN(parseInt(this.state.clientInfo.budget)) || parseInt(this.state.clientInfo.budget) < 100} onClick={this.nextStep} className="questionnaire-button">
                                Continue
                                    </Button>
                            <br></br>
                            <br></br>
                            <a onClick={this.previousStep} className="questionnaire-secondary-button">Go back</a>
                        </Col>
                    </Row>
                </div>
            case 7:
                return <div className="step-8">
                    <Row className="mb-30" style={{ textAlign: "center" }}>
                        <h3 className="sentence">Got it! Let us know your contact info so our <br></br>advisor can reach you for a free discovery call</h3>
                    </Row>
                    <Row style={{ textAlign: "center" }}>
                        <form>
                            <h3 className="sentence"><input
                                value={this.state.clientInfo.first_name}
                                name="first_name"
                                onChange={this.handleInfoChange}
                                style={{ width: "250px", marginRight: "20px", marginBottom: "20px" }} className="sentence-input-boxed" type="text" placeholder="First Name" /><input name="last_name" value={this.state.clientInfo.last_name}
                                    onChange={this.handleInfoChange} style={{ width: "250px" }} className="sentence-input-boxed" type="text" placeholder="Last Name" /></h3>
                            <h3 className="sentence"><input
                                name="email"
                                value={this.state.clientInfo.email}
                                onChange={this.handleInfoChange}
                                style={{ width: "520px" }}
                                className="sentence-input-boxed" type="text" placeholder="Email" /></h3>
                        </form>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={8} xsOffset={8} md={8} mdOffset={8} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button disabled={!this.state.clientInfo.first_name || !this.state.clientInfo.last_name || !this.state.clientInfo.email || !this.state.clientInfo.email.match(/.+@.+\../)} onClick={() => { window.alert("This is just a showcase of onboarding form. Click on 'Embed to Website' button to get the real one. Once your prospects fill these details, they will appear in your Advisor Dasboard clients list.") }} className="questionnaire-button">
                                Continue
                                    </Button>
                            <br></br>
                            <br></br>
                            <a onClick={this.previousStep} className="questionnaire-secondary-button">Go back</a>
                        </Col>
                    </Row>
                </div>
            case 8:
                return <div className="step-8">
                    <Row className="mb-30" style={{ textAlign: "center" }}>
                        <h3 className="sentence"><i>This form creates a new prospect/client in the advisor dasboard</i></h3>
                    </Row>
                    <Row style={{ marginTop: "20px" }}>
                        <Col xs={16} xsOffset={4} md={16} mdOffset={4} style={{ textAlign: "center", marginTop: "20px" }}>
                            <Button onClick={this.goToDashboard} className="questionnaire-button" style={{ marginRight: "50px" }}>
                                Go to Advisor Dashboard
                                        </Button>
                            <Button onClick={this.retake} className="questionnaire-button">
                                Retake the questionnaire
                                        </Button>
                        </Col>
                    </Row>
                </div>
        }
    }

    render() {
        return (
            <div>
                <Row>
                    <Col xs={20} xsOffset={2} md={16} mdOffset={4}>
                        <h1 className="page-title">Personalized onboarding form for your website</h1>
                        <Button
                            onClick={this.handleShowEmbed}
                            appearance="link"
                            className="btn --outline page-action-btn mr-20">
                            Embed to website
                        </Button>
                        <div className="card Questionnaire-Flow">
                            <Row>
                                <Col md={6}
                                    style={{ marginTop: "50px" }}>
                                    <img
                                        style={{ width: "100%" }}
                                        src={`${this.state.adviser ? this.state.adviser.logo : "https://dummyimage.com/300x200/f5f5f5/000000.jpg&text=Your+Logo"}`} />

                                    <h5
                                        style={{
                                            textAlign: "center",
                                            fontWeight: "300",
                                            color: "#6565da",
                                            marginTop: "40px"
                                        }}
                                    >YOUR ADVISOR</h5>
                                    <hr
                                        style={{
                                            marginTop: "10px",
                                            width: "70%"
                                        }}></hr>
                                    <p style={{
                                        textAlign: "center",
                                        fontWeight: "500"
                                    }}>{this.state.adviser ? this.state.adviser.advisor_name : "Your Adviser Name"}</p>
                                    <p style={{
                                        textAlign: "center",
                                        fontSize: "13px"
                                    }}>{this.state.adviser ? this.state.adviser.email : "Your Adviser Email"}</p>
                                    <p style={{
                                        textAlign: "center",
                                        fontSize: "13px"
                                    }}>{this.state.adviser ? this.state.adviser.advisor_phone : "Your Adviser Phone"}</p>
                                </Col>
                                <Col style={{
                                    borderLeft: "1px solid #e3e5eb",
                                    minHeight: "380px",
                                    display: "flex",
                                    justifyContent: "center",
                                    flexDirection: "column"
                                }} md={18}>
                                    {this.renderStep(this.state.currentStep)}
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
                {this.state.isEmbedModalVisible && <Modal
                    show={true}
                    onHide={this.handleHideEmbed}
                    size="sm"
                    className="score-breakdown"
                    style={{ textAlign: "center" }}>
                    <Modal.Header>
                        <Modal.Title
                            style={{
                                textAlign: 'center',
                                fontSize: '20px'
                            }}>
                            <p>Copy and paste the following link to let <br></br> your prospects access the onboarding form</p>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ paddingBottom: "0px" }}>
                        <form>
                            <textarea
                                style={{
                                    border: "none",
                                    backgroundColor: "transparent",
                                    resize: "none",
                                    outline: "none",
                                    width: "80%"
                                }}
                                ref={(textarea) => this.textArea = textarea}
                                value={this.state.adviser ? 
                                    this.getQuestionnaireBaseUrl()+"/#/embed/questionnaire/" + this.state.adviser.embed_token 
                                    : "Error"}
                            />
                        </form>
                        {
                            /* Logical shortcut for only displaying the 
                               button if the copy command exists */
                            document.queryCommandSupported('copy') &&
                            <div>
                                <br></br>
                                <Button
                                    appearance="link"
                                    className="btn --outline mb-20"
                                    style={{ width: "35%" }}
                                    onClick={this.copyToClipboard}>
                                    Copy to Clipboard
                                </Button>
                                <Button
                                    appearance="link"
                                    className="btn --outline mb-20"
                                    style={{ width: "35%", marginLeft: "10px" }}
                                    onClick={this.openInNewTab}>
                                    Open in new Tab
                                </Button>
                                <br></br>
                                {this.state.copySuccess ? "Copied!" : ""}
                            </div>
                        }

                        {/* <input style={{ width: "80%" }} disabled={true} value="Bobane pomjeri svoj bmw" />
                        <Button
                            appearance="link"
                            className="btn --outline mb-20"
                            style={{ width: "80%" }}
                            onClick={() => this.copyToClipboard()}>
                            Copy to Clipboard
                        </Button> */}
                    </Modal.Body>
                </Modal>}
            </div>
        );
    }
};

export default Questionnaire;