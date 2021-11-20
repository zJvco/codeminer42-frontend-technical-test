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

// Function to convert ISO date in EN date
function convertDate(dt) {
    return `${dt.getFullYear()}/${dt.getMonth()}/${dt.getDate()} ${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`;
}

// Create and load calendar
async function createCalendar() {
    const patList = JSON.parse(await (await consultAPI("patients")).text());
    const aptList = JSON.parse(await (await consultAPI("appointments")).text());
    
    const scheduleColor = "#3498DB";
    let days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    // Get current Week
    let curr = new Date();
    let firstDay = curr.getDate() - (curr.getDay() - 1);
    let lastDay = firstDay + 4;
    for (let i = 0; i < aptList.length; i++) {
        for (let j = 0; j < patList.length; j++) {
            if (aptList[i].patientId == patList[j].id) {
                let aptStartTime = new Date(aptList[i].startTime);
                let aptEndTime = new Date(aptList[i].endTime);

                // Checking if the date is between first day and last day in this week;
                if (aptStartTime.getDate() < firstDay || aptStartTime.getDate() > lastDay) continue;

                let day = days[aptStartTime.getDay()];
                let hour = addZero(aptStartTime.getHours());
                let minutes = addZero(aptStartTime.getMinutes());
                let time = `${hour}-${minutes}`;

                // If return 1 is 1 hour, return 0 is 30 minutes, return Nan the agenda is not completed 
                let totalTime = parseInt(addZero(aptEndTime.getHours())) - parseInt(addZero(aptStartTime.getHours()));

                let boxEl = document.querySelector(`.${day}-${time}`);

                // Cheking if the hour isn't compatible with the doctor agenda
                if (boxEl != null) {
                    // Finding a empty agenda in calendar to put the patient witch have the same agenda of other
                    while (true) {
                        if (boxEl.innerHTML != "") {
                            let minTemp = parseInt(minutes) + 30;
                            if (minTemp > 59) {
                                hour = (parseInt(hour) + 1).toString();
                                minutes = "00";
                            }
                            else {
                                minutes = minTemp.toString();
                            }
                            time = `${hour}-${minutes}`;
                            boxEl = document.querySelector(`.${day}-${time}`);
                        }
                        else {
                            break;
                        }
                    }

                    boxEl.style.border = "none";
                    boxEl.style.backgroundColor = scheduleColor;

                    let nameEl = document.createElement("h6");
                    let descriptionEl = document.createElement("p");

                    let invisibleDivInfo = document.createElement("div");
                    invisibleDivInfo.classList.add("invisible-info");
                    invisibleDivInfo.classList.add(`info-${aptList[i].status}`);
                    let typeEl = document.createElement("span");
                    let statusEl = document.createElement("span");

                    typeEl.innerText = `Type: ${aptList[i].type}`;
                    statusEl.innerText = `Status: ${aptList[i].status}`;

                    invisibleDivInfo.appendChild(typeEl);
                    invisibleDivInfo.appendChild(statusEl);

                    nameEl.innerText = `[${patList[j].name}]`;
                    descriptionEl.innerText = aptList[i].description;

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
async function createHistory() {    
    const patList = JSON.parse(await (await consultAPI("patients")).text());
    const aptList = JSON.parse(await (await consultAPI("appointments")).text());

    const historyTableTbody = document.querySelector(".history table tbody");
    const icons = {
        "firstVisit": "<i class='fas fa-hospital'></i>",
        "followUp": "<i class='fas fa-stethoscope'></i>",
        "checkUp": "<i class='fas fa-user-md'></i>",
        "exam": "<i class='fas fa-file-medical-alt'></i>",
        "surgery": "<i class='fas fa-syringe'></i>"
    }
    for (let i = 0; i < aptList.length; i++) {
        for (let j = 0; j < patList.length; j++) {
            if (aptList[i].patientId == patList[j].id && aptList[i].status != "pending") {
                let dateStartTime = new Date(aptList[i].startTime);
                let dateEndTime = new Date(aptList[i].endTime);
                historyTableTbody.innerHTML += `
                <tr>
                    <td>${aptList[i].endTime == null ? convertDate(dateStartTime) : convertDate(dateStartTime) + ' - ' + addZero(dateEndTime.getHours()) + ':' + addZero(dateEndTime.getMinutes())}</td>
                    <td><span id="status-${aptList[i].status}">${aptList[i].status}</span></td>
                    <td>${patList[j].name}</td>
                    <td>${icons[aptList[i].type]} ${aptList[i].type}</td>
                </tr>
                `
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    createCalendar();
    createHistory();
});
