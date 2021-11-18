// Function to consult API and return a response
async function consultAPI(endpoint="") {
    url = "https://cm42-medical-dashboard.herokuapp.com/" + endpoint;
    response = await fetch(url);
    return response;
}

// Patient class
class Patient {
    constructor() {
        this.endpoint = "patients/";
    }

    async getPatients() {
        let data = await (await consultAPI(this.endpoint)).text();
        return JSON.parse(data);
    }

    async getPatientsById(id) {
        let data = await (await consultAPI(this.endpoint + id)).text();
        return JSON.parse(data);
    }
}

// Appointment class
class Appointment {
    constructor() {
        this.endpoint = "appointments/";
    }

    async getAppointments() {
        let data = await (await consultAPI(this.endpoint)).text();
        return JSON.parse(data);
    }

    async getAppointmentsById(id) {
        let data = await (await consultAPI(this.endpoint + id)).text();
        return JSON.parse(data);
    }
}

// Function to add zero in numbers less than 10
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// Function to convert ISO date in EN date
function convertDate(dt) {
    return `${dt.getFullYear()}/${dt.getMonth()}/${dt.getDate()} ${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`;
}

// Create and load calendar
async function createCalendar(patient, appointment) {
    let patientsList = await patient.getPatients();
    let appointmentsList = await appointment.getAppointments();

    const scheduleColor = "#3498DB";
    let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    // Get current Week
    let curr = new Date();
    let firstDay = curr.getDate() - (curr.getDay() - 1);
    let lastDay = firstDay + 4;

    for (let i = 0; i < appointmentsList.length; i++) {
        for (let j = 0; j < patientsList.length; j++) {
            if (appointmentsList[i].patientId == patientsList[j].id) {
                let aptStartTime = new Date(appointmentsList[i].startTime);
                let aptEndTime = new Date(appointmentsList[i].endTime);

                // Checking if the date is between first day and last day in this week;
                if (aptStartTime.getDate() < firstDay || aptStartTime.getDate() > lastDay) continue;

                let day = days[aptStartTime.getDay()];
                let time = `${addZero(aptStartTime.getHours())}-${addZero(aptStartTime.getMinutes())}`;

                // If return 1 is 1 hour, return 0 is 30 minutes, return Nan the agenda is not completed 
                let totalTime = parseInt(addZero(aptEndTime.getHours())) - parseInt(addZero(aptStartTime.getHours()));

                const boxEl = document.querySelector(`.${day}-${time}`);

                // Cheking if the hour isn't compatible with the doctor agenda
                if (boxEl != null) {
                    boxEl.style.border = "none";
                    boxEl.style.backgroundColor = scheduleColor;

                    let nameEl = document.createElement("h6");
                    let descriptionEl = document.createElement("p");

                    let invisibleDivInfo = document.createElement("div");
                    invisibleDivInfo.classList.add("invisible-info");
                    invisibleDivInfo.classList.add(`info-${appointmentsList[i].status}`);
                    let typeEl = document.createElement("span");
                    let statusEl = document.createElement("span");

                    typeEl.innerText = `Type: ${appointmentsList[i].type}`;
                    statusEl.innerText = `Status: ${appointmentsList[i].status}`;

                    invisibleDivInfo.appendChild(typeEl);
                    invisibleDivInfo.appendChild(statusEl);

                    nameEl.innerText = `[${patientsList[j].name}]`;
                    descriptionEl.innerText = appointmentsList[i].description;

                    boxEl.appendChild(nameEl);
                    boxEl.appendChild(descriptionEl);
                    boxEl.appendChild(invisibleDivInfo);

                    // 1 hour in calendar
                    if (totalTime == 1) {
                        boxEl.style.gridRow = "span 2";
                        boxEl.style.height = "100%";
                        let temp = parseInt(time.slice(time.indexOf("-") + 1)) + 30;
                        let calc = temp > 59 ? (parseInt(time.slice(0, time.indexOf("-"))) + 1).toString() + "-00" : parseInt(time.slice(0, time.indexOf("-"))).toString() + "-" + temp.toString();
                        document.querySelector(`.${day}-${calc}`).remove();
                    }
                }
            }
        }
    }
}

// Create and load history data
async function createHistory(patient, appointment) {    
    let patientsList = await patient.getPatients();
    let appointmentsList = await appointment.getAppointments();

    const historyTableTbody = document.querySelector(".history table tbody");

    const icons = {
        "firstVisit": "<i class='fas fa-hospital'></i>",
        "followUp": "<i class='fas fa-stethoscope'></i>",
        "checkUp": "<i class='fas fa-user-md'></i>",
        "exam": "<i class='fas fa-file-medical-alt'></i>",
        "surgery": "<i class='fas fa-syringe'></i>"
    }

    for (let i = 0; i < appointmentsList.length; i++) {
        for (let j = 0; j < patientsList.length; j++) {
            if (appointmentsList[i].patientId == patientsList[j].id) {
                let dateStartTime = new Date(appointmentsList[i].startTime);
                let dateEndTime = new Date(appointmentsList[i].endTime);
                historyTableTbody.innerHTML += `
                <tr>
                    <td>${appointmentsList[i].endTime == null ? convertDate(dateStartTime) : convertDate(dateStartTime) + ' - ' + addZero(dateEndTime.getHours()) + ':' + addZero(dateEndTime.getMinutes())}</td>
                    <td><span id="status-${appointmentsList[i].status}">${appointmentsList[i].status}</span></td>
                    <td>${patientsList[j].name}</td>
                    <td>${icons[appointmentsList[i].type]} ${appointmentsList[i].type}</td>
                </tr>
                `
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const patient = new Patient();
    const appointment = new Appointment();

    createCalendar(patient, appointment);
    createHistory(patient, appointment);
});
