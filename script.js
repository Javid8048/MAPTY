'use strict';

document.documentElement.querySelector("head").querySelector("title").textContent = "Mapty";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {
    constructor() {
        this._getPosition();
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap, function (error) { console.log(error.message) })
    }

    _loadMap(position) {
        const { latitude, longitude } = position.coords
        map = L.map('map').setView([latitude, longitude], 13);
        console.log(`https://www.google.com/maps/@${latitude},${longitude},14z `)
    
        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    
        map.on('click', function (mapE) {
            mapEvent = mapE; 
            form.classList.remove("hidden");
            inputDistance.focus();
        })
    }

    _showForm() {}

    _toggleElevationField() {}
}

const app = new App();


let map, mapEvent;




form.addEventListener("submit", function (e) {
    e.preventDefault();
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
    form.classList.add("hidden");
    const { lat, lng } = mapEvent.latlng
    L.marker([lat, lng]).addTo(map).bindPopup(L.popup(
        {
            maxWindth: 250, minWidth: 100, closeOnClick: false, autoClose: false, keepInView: true, className: "running-popup"
        }))
        .setPopupContent("work <br> out")
        .openPopup()
})


inputType.addEventListener("change", function(value) {
    console.log(value)
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
})