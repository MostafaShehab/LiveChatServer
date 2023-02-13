module.exports.formatDateFromTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
}
