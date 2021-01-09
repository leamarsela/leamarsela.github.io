const mapid = L.map('mapid', 
                    {zoomControl: false,
                    zoom: 4,
                    minZoom: 4,
                    maxZoom: 4}).setView([-2.5, 117.5], 4);
const bounds = [
    [5, 94],
    [-5, 141]
];
mapid.fitBounds(bounds);
mapid.setMaxBounds(bounds);

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const title_url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(title_url, { attribution });
tiles.addTo(mapid);


function month(arg){
    let getmonth = arg.getMonth();
    
    if (String(getmonth).length == 1){
        return '0' + (getmonth + 1);
    } else {
        return (getmonth + 1);
    }
}

function utcTime(arg) {
    let tempUtcTime = new Date(arg);
    let yearTime = tempUtcTime.getUTCFullYear();

    let tempMonthTime = tempUtcTime.getUTCMonth() + 1;
    let monthTime = '';
    if(String(tempMonthTime).length == 1) {
        monthTime = '0' + tempMonthTime;
    } else {
        monthTime = tempMonthTime;
    }

    
    let tempDateTime = tempUtcTime.getUTCDate();
    let dateTime = ''
    if(String(tempDateTime).length == 1) {
        dateTime = '0' + tempDateTime;
    } else {
        dateTime = tempDateTime;
    }


    let tempHourTime = tempUtcTime.getUTCHours();
    let hourTime = '';
    if(String(tempHourTime).length == 1) {
        hourTime = '0' + tempHourTime;
    } else {
        hourTime = tempHourTime
    }
    
    let tempMinuteTime = tempUtcTime.getUTCMinutes(); 
    let minuteTime = '';
    if(String(tempMinuteTime).length == 1) {
        minuteTime = '0' + tempMinuteTime;
    } else {
        minuteTime = tempMinuteTime;
    }

    return (dateTime + '-' + monthTime + '-' + yearTime + '; ' + hourTime + ':' + minuteTime);
}

async function getData() {

    const now = new Date(Date.now());
    const before = new Date(now.valueOf() - (30 * 24 * 60 * 60 * 1000));
    
    const beforeYear = before.getFullYear();
    const beforeMonth = month(before);
    const beforeDate = before.getDate();

    const nowYear = now.getFullYear();
    const nowMonth = month(now);
    const nowDate = now.getDate();
    
    const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' 
                + beforeYear + '-' + beforeMonth + '-' + beforeDate + '&endtime='
                + nowYear + '-' + nowMonth + '-' + nowDate;

    const response = await fetch(url);
    const data = await response.json();
    
    const lats = [];
    const longs = [];
    const mags = [];
    const locations = [];
    const originalTimes = [];
    const updatedTimes = [];

    console.log(data.features.length);

    for(let i = 0; i < data.features.length; i++) {
        const lat = data.features[i].geometry.coordinates[1].toFixed(2);
        const long = data.features[i].geometry.coordinates[0].toFixed(2);
        const mag = data.features[i].properties.mag;
        const location = data.features[i].properties.place;
        
        // Indonesia
        if(lat <= 6 && lat >= -11 && long <= 141 && long >= 94) {
            lats.push(lat);
            longs.push(long);
            
            if(!mag) {
                mags.push(0);
            } else {
                mags.push(mag);
            }
            
            locations.push(location);
            
            const originalTime = data.features[i].properties.time;
            const updatedTime = data.features[i].properties.updated;
    
            originalTimes.push(utcTime(originalTime));
            updatedTimes.push(utcTime(updatedTime));
        }        
    }

    console.log(locations);

    // let tBody = document.getElementsByTagName('tbody')[0];
    let tBody = document.getElementById('tData');

    let dataBody = '';
    for(let i = 0; i < locations.length; i++)
        dataBody += `
                    <tr>
                        <td>${i+1}</td>
                        <td>${locations[i]}</td>
                        <td>${lats[i]}</td>
                        <td>${longs[i]}</td>
                        <td>${mags[i]}</td>
                        <td>${originalTimes[i]}</td>
                        <td>${updatedTimes[i]}</td>
                    </tr> `

    
    tBody.innerHTML = dataBody;

    const totalData = document.getElementById('totalData');
    totalData.innerHTML = ` Earthquake Total Data: ${locations.length} <br>
                            Start Date: ${before} <br>
                            End of Date: ${now}
                        `;
    totalData.style.fontWeight = 'Bold';

    
    for(let i = 0; i < lats.length; i++) {
        const myIcon = L.icon({
            iconUrl: 'circle.png',
            iconSize: [Math.abs(parseFloat(mags[i])), Math.abs(parseFloat(mags[i]))],
            iconAnchor: [0, 0],

        });
        L.marker([lats[i], longs[i]], { icon: myIcon})
            .addTo(mapid)
            .bindPopup(String('No: ' + (i + 1)));
        
    }
}

getData();

setInterval(getData, 86400);