// Function to consult API and return a response
async function consultAPI(endpoint="") {
    url = "https://cm42-medical-dashboard.herokuapp.com/" + endpoint;
    response = await fetch(url);
    return response;
}

async function listPatients(patient) {
    let patientsList = await patient.getPatients();
    for (let i = 0; i < patientsList.length; i++) {
        
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const patient = new Patient();
    const appointment = new Appointment();

    listPatients(patient);
});
