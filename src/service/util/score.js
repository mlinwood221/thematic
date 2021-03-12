export const getColorByScore = (score, lowPositive) => {
    if (score < 3.5) {
        if (lowPositive) {
            return '#309ef2';
        }
        return '#ef662f';
    }

    if (score < 5) {
        return '#f6cb2f';
    }

    if (score < 7.5) {
        return '#e8d22c';
    }

    return '#3cd516';
}