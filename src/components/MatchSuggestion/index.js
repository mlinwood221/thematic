import React from 'react';
import {Progress} from 'rsuite';

import {getColorByScore} from './../../service/util/score';

const MatchSuggestion = (props) => {
    return (
        <div
            className="card --clickable"
            style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '130px'
        }}>
            <Progress.Circle
                style={{
                width: '80px',
                display: 'inline-block'
            }}
                percent={parseInt(props.data.score * 10)}
                strokeColor={getColorByScore(props.data.score)}/>
            <h3
                style={{
                display: 'inline-block',
                fontWeight: '400',
                fontSize: '16px',
                marginLeft: '10px',
                lineHeight: '21px',
                width: '75%'
            }}>{props.data.etf.name}</h3>
        </div>
    );
};

export default MatchSuggestion;