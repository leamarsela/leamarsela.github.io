const mapid = L.map('mapid',
                    {zoomControl: true,
                     zoom: 4,
                     minZoom: 4,
                     maxZoom: 4}).setView([-2.5, 117.5], 4)

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


async function getData() {

  const url = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';

  const response = await fetch(url, {
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      "Access-Control-Allow-Credentials" : true,
      'Content-Type': 'application/json',
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
    }
  });

  const data = await response.json();

  const tanggal = [];
  const jam = [];
  const lintang = [];
  const bujur = [];
  const magnitude = [];
  const kedalaman = [];
  const wilayah = [];

  for(let i = 0; i < data.Infogempa.gempa.length; i++){
    const tempTanggal = data.Infogempa.gempa[i].Tanggal;
    const tempJam = data.Infogempa.gempa[i].Jam;
    const tempLintang = ((data.Infogempa.gempa[i].Coordinates).split(","))[0];
    const tempBujur = ((data.Infogempa.gempa[i].Coordinates).split(","))[1];
    const tempMagnitude = data.Infogempa.gempa[i].Magnitude;
    const tempKedalaman = data.Infogempa.gempa[i].Kedalaman;
    const tempWilayah = data.Infogempa.gempa[i].Wilayah;

    tanggal.push(tempTanggal);
    jam.push(tempJam);
    lintang.push(tempLintang);
    bujur.push(tempBujur);
    magnitude.push(tempMagnitude);
    kedalaman.push(tempKedalaman);
    wilayah.push(tempWilayah);
  }

  const totalData = document.getElementById('totalData');
  totalData.innerHTML = `Total Data Gempa: ${tanggal.length} <br>
                         Periode Data: ${tanggal[0]} - ${tanggal[tanggal.length - 1]} <br>
                        `;
  totalData.style.fontWeight = 'Bold'


  let tData = document.getElementById('tData');

  let dataBody = '';
  for(let i = 0; i < tanggal.length; i++) {
    dataBody += `
                <tr>
                  <td>${i+1}</td>
                  <td>${tanggal[i]}</td>
                  <td>${jam[i]}</td>
                  <td>${lintang[i]}</td>
                  <td>${bujur[i]}</td>
                  <td>${magnitude[i]}</td>
                  <td>${kedalaman[i]}</td>
                  <td style="text-align:left">${wilayah[i]}</td>
                </tr>`
  }
  tData.innerHTML = dataBody;

  for(let i = 0; i < tanggal.length; i++) {
    const myIcon = L.icon({
      iconUrl: 'circle.png',
      iconSize: [Math.abs(parseFloat(magnitude[i])), Math.abs(parseFloat(magnitude[i]))],
      iconAnchor: [0, 0],
    });

    L.marker([lintang[i], bujur[i]], {icon: myIcon})
        .addTo(mapid)
        .bindPopup(String('No: ' + (i + 1)) + ' ' + String('(Magnitude: ' + magnitude[i] + ')') + ' <br> ' + '<b>' + String(wilayah[i]) + '</b>' + '');
    }

}

getData();

setInterval(getData, 86400);
