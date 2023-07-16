module.exports = {
    getDate : getDate(),
    getDay : getDay()
}
function getDate(){
    let currentDate = new Date();
    options = {
        weekday : "long",
        year : "numeric",
        month : "long",
        day : "numeric"
    }
    let currentDay = currentDate.toLocaleDateString('sp-US', options);
    return currentDay;
}
function getDay(){
    let currentDate = new Date();
    options = {
        weekday : "long",
    }
    let currentDay = currentDate.toLocaleDateString('sp-US', options);
    return currentDay;
}