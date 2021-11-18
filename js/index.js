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

// Create and load history in doctor page
async function createHistory() {
    const patient = new Patient();
    const appointment = new Appointment();
    
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
    createHistory();
});
