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

class Workout {
    date = new Date();
    id = Date.now();
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence;
        this.calcPace();
    }
    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Cycling([39, -12], 27, 95, 523);
console.log(run1, cycling1);

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Application architecture ///
class App {
    #map;
    #mapEvent;
    #workouts = [];
    constructor() {
        this._getPosition();

        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._showForm.bind(this))
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function (error) { console.log(error.message) })
    }

    _loadMap(position) {
        const { latitude, longitude } = position.coords
        this.#map = L.map('map').setView([latitude, longitude], 13);
        console.log(`https://www.google.com/maps/@${latitude},${longitude},14z `)

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this))
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }

    _newWorkout(e) {
        e.preventDefault();
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
        form.classList.add("hidden");
        const { lat, lng } = this.#mapEvent.latlng
        L.marker([lat, lng]).addTo(this.#map).bindPopup(L.popup(
            {
                maxWindth: 250, minWidth: 100, closeOnClick: false, autoClose: false, keepInView: true, className: "running-popup"
            }))
            .setPopupContent("work <br> out")
            .openPopup()

        const validInputs = function(...inputs) {
            inputs.every(inp => Number.isFinite(inp))
        }
        const allPositive = function(...inputs) {
            inputs.every(inp => inp > 0)
        }

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDistance.value;
        if(type === "running") {
            const cadence = +inputCadence.value;
            if (!validInputs(distance, duration, cadence) && !allPositive(distance, duration, cadence)){
                 return alert("Values show only be position");
            }
        } else {
            const elevation = inputElevation.value;
            if (!validInputs(distance, duration, cadence)){
                return alert("Values show only be position");
           }
        }
    }
}

const app = new App();