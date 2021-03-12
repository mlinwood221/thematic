import {THEMES} from './../data/themes';
import {ACTIVITIES} from './../data/general';
import {SECTORS} from './../data/sectors';

export const getThemeNameByID = (id) => {
    const theme = THEMES.find(t => t.id === id);
    return theme
        ? theme.name
        : 'n/a';
}

export const getActivityNameByID = (id) => {
    const activity = ACTIVITIES.find(a => a.value === id);
    return activity
        ? activity.label
        : 'n/a';
}

export const getSectorNameByID = (id) => {    
    const sector = SECTORS.find(s => s.id === id);
    return sector
        ? sector.label
        : 'n/a';    
}