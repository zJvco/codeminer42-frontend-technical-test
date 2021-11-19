// Function to consult API and return a response
async function consultAPI(endpoint="") {
    url = "https://cm42-medical-dashboard.herokuapp.com/" + endpoint;
    response = await fetch(url);
    return response;
}

async function listPatients() {
    const patList = JSON.parse(await (await consultAPI("patients")).text());
    const aptList = JSON.parse(await (await consultAPI("appointments")).text());

    const nav = document.querySelector("nav");

    for (let i = 0; i < patList.length; i++) {
        nav.innerHTML += `
        <a href="#" onclick="showDashboard(${patList[i].id})">
            ${patList[i].name}
            <i class="fas fa-angle-right"></i>
        </a>
        `;
    }
}

async function showDashboard(patientId) {
    const singlePatient = JSON.parse(await (await consultAPI(`patients/${patientId}`)).text());
    
}

document.addEventListener("DOMContentLoaded", () => {
    listPatients();
});