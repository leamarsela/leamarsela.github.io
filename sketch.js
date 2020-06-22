const mapid = L.map('mapid').setView([0, 0], 1);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const title_url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(title_url, { attribution });
tiles.addTo(mapid);

function month(arg){
    let getmonth = arg.getMonth();
    
    if (String(getmonth).length == 1){
        return '0' + getmonth;
    } else {
        return getmonth;
    }
}


async function getData() {

    const now = new Date(Date.now());
    const before = new Date(now.valueOf() - (7 * 24 * 60 * 60 * 1000));
    
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

    for(let i = 0; i < data.features.length; i++) {
        const lat = data.features[i].geometry.coordinates[1];
        const long = data.features[i].geometry.coordinates[0];
        const mag = data.features[i].properties.mag;
        const location = data.features[i].properties.place;

        lats.push(lat);
        longs.push(long);
        
        if(!mag) {
            mags.push(0);
        } else {
            mags.push(mag);
        }

        locations.push(location);
    }

    let tBody = document.getElementById('tData');
    
    let dataBody = '';
    for (let i = 0; i < locations.length; i++) {
        dataBody += `
                    <tr>
                        <th scope="row">${i}</th>
                        <td>${longs[i]}</td>
                        <td>${lats[i]}</td>
                        <td>${locations[i]}</td>
                        <td>${mags[i]}</td>
                    </tr> `
    }
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
        L.marker([lats[i], longs[i]], { icon: myIcon }).addTo(mapid);
    }
}

getData();

