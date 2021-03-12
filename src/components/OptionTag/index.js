import React from 'react';
import { Tag, Icon } from 'rsuite';

const OptionTag = (props) => {
    return (
        <Tag
            className={`OptionTag
            ${props.disabled ? '--disabled' : ''} `}
            color={props.selected
                ? 'violet'
                : 'blue'}
            onClick={props.onSelect}>
            {props.showRemover
                ? <Icon
                    icon="close"
                    style={{
                        marginRight: '5px'
                    }} />
                : ''}

            {props.label}
        </Tag>
    );
};

export default OptionTag;