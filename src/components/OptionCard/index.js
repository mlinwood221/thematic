import React from 'react';

const OptionCard = (props) => {
    return (
        <div
            className={`OptionCard
            ${props.disabled ? '--disabled' : ''}
            ${props.selected
                    ? '--selected'
                    : ''}`}
            style={props.detailIcon && !props.disableImportant ? { marginBottom: "30px" } : {}}
            onClick={props.onSelect}>
            <i className={props.icon}></i>

            <p>{props.label}</p>

            {props.detailIcon && !props.disableImportant && <div className="detail-icon" onClick={props.onDetailIconClick}>
                Why is it important?
            </div>}
        </div>
    );
};

export default OptionCard;