const patientsNav = document.querySelector("nav .patients-list");

var currentPatientId = null;

const recentTabBtn = document.getElementById("recent-tab");
const upComingTabBtn = document.getElementById("upcoming-tab");
const historyTab = document.getElementById("history-tab");

const icons = {
    "firstVisit": "<i class='fas fa-hospital'></i>",
    "followUp": "<i class='fas fa-stethoscope'></i>",
    "checkUp": "<i class='fas fa-user-md'></i>",
    "exam": "<i class='fas fa-file-medical-alt'></i>",
    "surgery": "<i class='fas fa-syringe'></i>"
}

// Function to consult API and return a response
async function consultAPI(endpoint="") {
    url = "https://cm42-medical-dashboard.herokuapp.com/" + endpoint;
    response = await fetch(url);
    return response;
}

// Function to add zero in numbers less than 10
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// Function to format the document style of the patient
function formatDocument(n) {
    n = n.split("");
    let temp = "";
    for (let i = 0; i < n.length; i++) {
        if (i == 3 || i == 6) {
            temp += ".";
        }
        else if (i == 9) {
            temp += "-";
        }
        temp += n[i];
    }
    return temp;
}

// Function to format the heath system id style of the patient
function formatHealthSystemId(n) {
    n = n.split("");
    let temp = "";
    for (let i = 0; i < n.length; i++) {
        if (i == 3) {
            temp += ".";
        }
        else if (i == 6) {
            temp += "/";
        }
        temp += n[i];
    }
    return temp;
}

// Function to format date (only date)
function formatDate(dt) {
    return `${dt.getFullYear()}/${dt.getMonth()}/${dt.getDate()}`;
}

// Function to format time (only time)
function formatTime(dt) {
    return `${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`;
}

// Function to set title case in a string
function titleCase(txt) {
    txt = txt.trim().split(" ");
    let temp = "";
    for (let i = 0; i < txt.length; i++) {
        for (let j = 0; j < txt[i].length; j++) {
            if (j == 0) {
                temp += txt[i][j].toUpperCase();
            }
            else {
                temp += txt[i][j];
            }            
        }
        if (i + 1 < txt.length) temp += " "; 
    }
    return temp;
}

// List patients in navbar
async function listPatients() {
    const patList = JSON.parse(await (await consultAPI("patients")).text());
    for (let i = 0; i < patList.length; i++) {
        patientsNav.innerHTML += `
        <a href="#" onclick="showDashboard(${patList[i].id})">
            ${patList[i].name}
            <i class="fas fa-angle-right"></i>
        </a>
        `;
    }
}

const tabTableTbody = document.querySelector(".display-appointments table tbody");

// Display recent info of patient
async function displayRecentTab() {
    const singlePatient = JSON.parse(await (await consultAPI(`patients/${currentPatientId}`)).text());
    const appointmentsList = JSON.parse(await (await consultAPI(`appointments`)).text());

    // Get shortest month
    let biggestMonth = null;
    for (let i = 0; i < appointmentsList.length; i++) {
        if (singlePatient.id == appointmentsList[i].patientId) {
            let curr = new Date(appointmentsList[i].startTime);
            if (biggestMonth != null) {
                if (curr.getMonth() > biggestMonth.getMonth()) {
                    biggestMonth = curr;
                }
            }
            else {
                biggestMonth = curr;
            }
        }
    }

    for (let i = 0; i < appointmentsList.length; i++) {
        let targetMonth = new Date(appointmentsList[i].startTime).getMonth();
        if (singlePatient.id == appointmentsList[i].patientId && targetMonth == biggestMonth.getMonth()) {
            let aptStartDate = new Date(appointmentsList[i].startTime);
            let aptEndDate = new Date(appointmentsList[i].endTime);
            tabTableTbody.innerHTML += `
            <tr>
                <td>
                    <span>${icons[appointmentsList[i].type]}</span>
                    ${formatDate(aptStartDate)} ${isNaN(aptEndDate) == true ? formatTime(aptStartDate) : formatTime(aptStartDate) + " - " + formatTime(aptEndDate)}
                </td>
                <td>${appointmentsList[i].type}</td>
                <td><span id="status-${appointmentsList[i].status}">${appointmentsList[i].status}</span></td>
            </tr>
            `
        }
    }
}

// Display upcoming info of patient
async function displayUpComingTab() {
    
}

// Display history info of patient
async function displayHistoryTab() {

}

// Show all information of the patient
async function showDashboard(patientId) {
    currentPatientId = patientId;
    tabTableTbody.innerHTML = "";

    patientsNav.classList.remove("show");
    const contentSections = document.querySelectorAll("main section");

    contentSections.forEach(section => {
        section.classList.remove("move");
    });

    if (recentTabBtn.className == "selected") displayRecentTab();
    else if (upComingTabBtn.className == "selected") displayUpComingTab();
    else if (historyTab.className == "selected") displayHistoryTab();

    const singlePatient = JSON.parse(await (await consultAPI(`patients/${patientId}`)).text());
    const appointmentsList = JSON.parse(await (await consultAPI(`appointments`)).text());

    let lastDate = null;
    let specialtyName = null;
    for (let i = 0; i < appointmentsList.length; i++) {
        if (singlePatient.id == appointmentsList[i].patientId) {
            if (appointmentsList[i].status == "completed") {
                if (lastDate != null) {
                    let tempdt = new Date(appointmentsList[i].endTime);
                    if (tempdt > lastDate) {
                        lastDate = tempdt;
                        specialtyName = appointmentsList[i].specialty;
                    }
                }
                else {
                    lastDate = new Date(appointmentsList[i].endTime);
                    specialtyName = appointmentsList[i].specialty;
                }
            }
        }
    }

    document.getElementById("patient-name").innerText = `${singlePatient.name}`;
    document.getElementById("patient-doc").innerText = `${formatDocument(singlePatient.document)}`;
    document.getElementById("patient-insurance-plan").innerText = `${singlePatient.insurancePlan}`;
    document.getElementById("patient-heath-system-id").innerText = `${formatHealthSystemId(singlePatient.healthSystemId)}`;
    document.getElementById("last-appointment-specialty").innerText = `${specialtyName == null ? "No Specialty" : titleCase(specialtyName)}`;
    document.getElementById("last-appointment-date").innerText = `${lastDate == undefined ? "No Date" : formatDate(lastDate)}`;

    contentSections.forEach(section => {
        section.classList.add("move");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    listPatients();
});

// Mobile menu toggle class in html
const menuBtn = document.querySelector(".nav-menu");
menuBtn.addEventListener("click", () => {
    patientsNav.classList.toggle("show");
});

recentTabBtn.addEventListener("click", () => {
    tabTableTbody.innerHTML = "";

    recentTabBtn.classList.add("selected");
    upComingTabBtn.classList.remove("selected");
    historyTab.classList.remove("selected");

    displayRecentTab();
});

upComingTabBtn.addEventListener("click", () => {
    tabTableTbody.innerHTML = "";

    recentTabBtn.classList.remove("selected");
    upComingTabBtn.classList.add("selected");
    historyTab.classList.remove("selected");

    displayUpComingTab();
});

historyTab.addEventListener("click", () => {
    tabTableTbody.innerHTML = "";

    recentTabBtn.classList.remove("selected");
    upComingTabBtn.classList.remove("selected");
    historyTab.classList.add("selected");

    displayHistoryTab();
});