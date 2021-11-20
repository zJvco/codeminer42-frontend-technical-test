const patientsNav = document.querySelector("nav .patients-list");

// Function to consult API and return a response
async function consultAPI(endpoint="") {
    url = "https://cm42-medical-dashboard.herokuapp.com/" + endpoint;
    response = await fetch(url);
    return response;
}

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

function formatDate(dt) {
    return `${dt.getFullYear()}/${dt.getMonth()}/${dt.getDate()}`;
}

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

async function showDashboard(patientId) {
    patientsNav.classList.remove("show");
    const contentSections = document.querySelectorAll("main section");

    contentSections.forEach(section => {
        section.classList.remove("move");
    });

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

const menuBtn = document.querySelector(".nav-menu");
menuBtn.addEventListener("click", () => {
    patientsNav.classList.toggle("show");
});