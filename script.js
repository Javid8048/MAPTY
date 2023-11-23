'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

document.documentElement.querySelector("head").querySelector("title").textContent = "Mapty";

class Workout {
    date = new Date();
    id = Date.now();
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }
    calcPace() { this.pace = this.duration / this.distance; return this.pace;}
}
class Cycling extends Workout {
    type = "cycling"
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed() { this.speed = this.distance / (this.duration / 60);  return this.speed; }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Application architecture ///
class App {
    #map;
    #mapEvent;
    #workouts = [];
    #clicks = 0;
    constructor() {
        this._getLocalStorage();
        this._getPosition();

        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField);
        containerWorkouts.addEventListener("click", this._moveToPopup.bind(this))
    }

    _getPosition() { navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function (error) { console.log(error.message) })}

    _loadMap(position) {
        const { latitude, longitude } = position.coords
        this.#map = L.map('map').setView([latitude, longitude], 13);
        console.log(`https://www.google.com/maps/@${latitude},${longitude},14z `)

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this))

        this.#workouts.forEach(work => this._renderWorkout(work));
        this.#workouts.forEach(work => this._renderWorkoutMarker(work));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
    }
    _hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
        form.style.display = "none";
        form.classList.add("hidden");
        setTimeout(()=> form.style.display = "grid",1000);
    }

    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    }

    _newWorkout(e) {
        e.preventDefault();
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;
        // const validInputs = function (...inputs) { inputs.every(inp => Number.isFinite(inp)) }
        // const allPositive = function (...inputs) { inputs.every(inp => inp > 0) }

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDistance.value;
        if (type === "running") {
            const cadence = +inputCadence.value;
            // if (!validInputs(distance, duration, cadence) && !allPositive(distance, duration, cadence)) return alert("Values show only be position 1");
            workout = new Running([lat, lng], distance, duration, cadence);
        } else {
            const elevation = +inputElevation.value;
            // if (!validInputs(distance, duration, elevation) && !allPositive(distance, duration)) return alert("Values show only be position");
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        this.#workouts.push(workout);
        console.log(this.#workouts);
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
        this._setLocalStorage();
        
        this._hideForm();
    }

    _renderWorkoutMarker(workout) {
        L.marker([workout.coords[0], workout.coords[1]]).addTo(this.#map).bindPopup(L.popup(
            {
                maxWindth: 250, minWidth: 100, closeOnClick: false, autoClose: false, keepInView: true, className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`)
            .openPopup();
    }
    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">
                ${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}               
              </span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>`;
        
          if(workout.type === "running") {
            html += `
          <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
        </li> `
          }
          if(workout.type === "cycling") {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
          </li> `;
          }

          form.insertAdjacentHTML("afterend", html);        
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest(".workout");
        // console.log(workoutEl)
        if(!workoutEl) return;
        const workout = this.#workouts.find(work => work.id === +workoutEl.dataset.id );
        // console.log(workout);
        this.#map.setView(workout.coords, 13, {
            pan: {
                duration: 1,
            }
        });
        this.clicks();
        console.log(this.#workouts);
    }

    _setLocalStorage() {
        localStorage.setItem("workouts", JSON.stringify(this.#workouts));
    }
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem("workouts"));
        if(!data) return;
        data.forEach(d => d.__proto__ = d.type === "running" ? Running : Cycling )
        this.#workouts = data;
        // this.#workouts.forEach(work => this._renderWorkout(work));
    }

    clicks() {
        this.#clicks++;
        console.log(this.#clicks)
    }

    reset() {
        localStorage.removeItem("workouts");
        location.reload();
    }

}
const app = new App();