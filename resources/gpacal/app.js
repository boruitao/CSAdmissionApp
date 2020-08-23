let state = "all";
let gpaCalApp = document.getElementsByClassName("gpa-calculator")[0];
function setCookie(cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = "gpaobj=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
}
    return "";
}
// function postFetchUpdate(url){
//     fetch(url, {
//         method: "POST",
//     })
//     .then(function(response){ return response.text()})
//     .then(function (text) {
//         gpaCalApp.innerHTML = text;
//         initListeners()
//     })
// }

// function bindEvent(cls, url, endState){

//     document.getElementsByClassName(cls)[0].addEventListener(
//         "mousedown",
//         function(evt){
//             postFetchUpdate(url)
//             if (endState) state = endState
//         }
//     );
// }

// function bindIndexedEvent(cls, func){
//     Array.from(document.getElementsByClassName(cls)).forEach( function(elem) {
//         elem.addEventListener(
//             "mousedown",
//             function(evt){
//                 postFetchUpdate(func(elem.getAttribute("data-todo-index")))
//             }
//         )
//     });
// }

function getStudentJsonRequest(sid, firstName, lastName, mid, email, tlis, tread, tspeak, twrite, gverbal, gquant, gwrite){
    let obj = {"sid":sid, "firstname":firstName, "lastname":lastName, "mid":mid, "email":email, 
        "tlisten": Number(tlis), "tread": Number(tread), "tspeak": Number(tspeak), "twrite": Number(twrite), 
        "gverbal": Number(gverbal), "gquant": Number(gquant), "gwrite": Number(gwrite)};
    return obj;
}

function getTransJsonRequest(sid, tid, degree, newUni, newCountry){
    let obj = {"tid":tid,"sid":sid, "degree":degree,"university":newUni, "country":newCountry};
    return obj;
}

function getEntryJsonRequest(eid, tid, ccode, cname, credit, grade){
    let obj = {"eid":eid,"tid":tid, "coursecode":ccode, "coursename":cname, "credit":Number(credit), "grade":Number(grade)};
    return obj;
}

function checkMid(newMid){
    if(!newMid || 0 === newMid.length) return false;
    let isnum = /^\d+$/.test(newMid);
    if(!isnum){
        return false;
    }
    return true;
}

function checkEmail(newEmail){
    if(!newEmail) return false;
    let isMcGillEmail = /.*\@mail.mcgill.ca$/.test(newEmail);
    if(!isMcGillEmail){
        return false;
    }
    return true;
}

function checkToefl(tlisInput, treadInput, tspeakInput, twriteInput){
    if(!tlisInput && !treadInput && !tspeakInput && !twriteInput) return true;
    else if(!tlisInput || !treadInput || !tspeakInput || !twriteInput) return false;
    let isnum = /^\d+$/.test(tlisInput) && /^\d+$/.test(treadInput) && /^\d+$/.test(tspeakInput) && /^\d+$/.test(twriteInput);
    if(!isnum || Number(tlisInput) > 30 || Number(tlisInput) < 0 || Number(treadInput) > 30 || Number(treadInput) < 0
        || Number(tspeakInput) > 30 || Number(tspeakInput) < 0 || Number(twriteInput) > 30 || Number(twriteInput) < 0){
        return false;
    }
    return true;
}

function checkGRE(gverbalInput, gquantInput, gwriteInput){
    if(!gverbalInput && !gquantInput && !gwriteInput) return true;
    else if(!gverbalInput || !gquantInput || !gwriteInput) return false;
    // let isnum = /^\d+$/.test(gverbalInput) && /^\d+$/.test(gquantInput) && /^\d+\.{0,1}\d+$v/.test(gwriteInput);
    // if(!isnum|| Number(gverbalInput) > 170 || Number(gverbalInput) < 130 || Number(gquantInput) > 170 || Number(gquantInput) < 130
    //     || Number(gwriteInput) > 6 || Number(gquantInput) < 0){
    //     return false;
    // }
    if(Number(gverbalInput) <= 170 && Number(gverbalInput) >= 130 && Number(gquantInput) <= 170 && Number(gquantInput) >= 130
        && Number(gwriteInput) <= 6 && Number(gquantInput) >= 0){
        return true;
    }
    return false;
}

function checkTable(ccode, cname, credit, grade){
    if(!ccode.value && !cname.value && !credit.value && !grade.value){
        return true;
    } else if (!ccode.value || !cname.value || !credit.value || !grade.value){
        return false;
    } 
    if(Number(credit.value) >= 0 && Number(grade.value) >= 0 && Number(grade.value) <= 4){
        return true;
    }
    // else if(!(/^[+-]?(\d*\.)?\d+$/.test(credit.value))){
    //     return false;
    // } else if(!(/^[+-]?(\d*\.)?\d+$/.test(grade.value)) || Number(grade.value) > 4 ||  Number(grade.value) < 0){
    //     return false;
    // }
    return false;
}

function checkTransInfo(trans, newUni, newCountry){
    let invalidUni = trans.getElementsByClassName("invalid-uni")[0];
    let invalidCountry = trans.getElementsByClassName("invalid-country")[0];
    let isValid = true;
    if(!newUni.value){
        invalidUni.innerHTML = "Please specify the university."
        isValid = false;
    }else{
        invalidUni.innerHTML = "";
    }
    if(newCountry.value == "-"){
        invalidCountry.innerHTML = "Please specify the country of the university."
        isValid = false;
    }else{
        invalidCountry.innerHTML = "";
    }
    return isValid;
}

function checkStudentInfo(firstNameInput, lastNameInput, midInput, emailInput, tlisInput, 
    treadInput, tspeakInput, twriteInput, gverbalInput, gquantInput, gwriteInput){
    let invalidNameP = document.getElementsByClassName("invalid-name")[0];
    let invalidMidP = document.getElementsByClassName("invalid-mid")[0];
    let invalidEmailP = document.getElementsByClassName("invalid-email")[0];
    let invalidToefL = document.getElementsByClassName("invalid-toefl")[0];
    let invalidGreP = document.getElementsByClassName("invalid-gre")[0];

    let isValid = true;
    if(!firstNameInput.value || !lastNameInput.value){
        invalidNameP.innerHTML = "Please specify your full name.";
        isValid = false;
    }else{
        invalidNameP.innerHTML = "";
    }

    if(!checkMid(midInput.value)){
        invalidMidP.innerHTML = "Please specify your McGill ID correctly.";
        isValid = false;
    } else{
        invalidMidP.innerHTML = "";
    }

    if(!checkEmail(emailInput.value)){
        invalidEmailP.innerHTML = "Please specify your McGill Email in the following format: last.first@mail.mcgill.ca.";
        isValid = false;
    } else {
        invalidEmailP.innerHTML = "";
    }
    
    if(!checkToefl(tlisInput.value, treadInput.value, tspeakInput.value, twriteInput.value)){
        invalidToefL.innerHTML = "Please specify your TOEFL correctly.";
        isValid = false;
    } else {
        invalidToefL.innerHTML = "";
    }

    if(!checkGRE(gverbalInput.value, gquantInput.value, gwriteInput.value)){
        invalidGreP.innerHTML = "Please specify your GRE scre correctly.";
        isValid = false;
    } else {
        invalidGreP.innerHTML = "";
    }
    return isValid;
}

function addNewTranscript(){
    let transcript = document.getElementById("transcripts").firstChild;
    let newTrans = transcript.cloneNode(true);
    let inputs = newTrans.getElementsByTagName('input');
    for (i = 0; i < inputs.length; ++i) {
        inputs[i].value = "";
    }

    //unselect the country options
    newTrans.getElementsByClassName("country")[0].value = "-";
    newTrans.getElementsByClassName("gpa-scale-label")[0].innerHTML = "";
    newTrans.getElementsByClassName("gpa-scale-table-div")[0].innerHTML = "";

    let arButton = newTrans.getElementsByClassName("addrow")[0];
    let ttable = newTrans.getElementsByClassName("trans-table")[0];
    while(ttable.rows.length > 6){
        ttable.deleteRow(-1);
    }
    arButton.addEventListener(
        "click",
        function(evt){
            addRows(ttable, 3);
        }
    );
    document.getElementById("transcripts").appendChild(newTrans);
}

// function generateRandomId(){
//     let result           = '';
//     let chars       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let len = chars.length;
//     for ( let i = 0; i < 10; i++ ) {
//         result += chars.charAt(Math.floor(Math.random() * len));
//     }
//     return result;
// }

function insertData(mainPage, transTable, data){
    //insert student's general info to the review page
    let studentDiv = document.createElement('div');
    studentDiv.setAttribute('class', 'student-info-review');
    let student_ul = document.createElement('ul');
    student_ul.setAttribute('id', 'student-review');
    let li = document.createElement('li');
    li.innerHTML = "First Name:".bold() + "   " + data['student']['firstname'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "Last Name:".bold() + "   " + data['student']['lastname'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "McGill ID:".bold() + "   " + data['student']['mid'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "McGill Email:".bold() + "   " + data['student']['email'];
    student_ul.appendChild(li);

    li = document.createElement('li');
    li.innerHTML = "TOEFL listening:".bold() + "   " + data['student']['tlisten'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "TOEFL reading:".bold() + "   " + data['student']['tread'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "TOEFL speaking:".bold() + "   " + data['student']['tspeak'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "TOEFL writing:".bold() + "   " + data['student']['twrite'];
    student_ul.appendChild(li);

    li = document.createElement('li');
    li.innerHTML = "GRE verbal:".bold() + "   " + data['student']['gverbal'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "GRE quantitative:".bold() + "   " + data['student']['gquant'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "GRE analytical writing:".bold() + "   " + data['student']['gwrite'];
    student_ul.appendChild(li);

    studentDiv.appendChild(student_ul);
    mainPage.appendChild(studentDiv);

    //insert student's transcripts info to the review page
    for(let i=0; i<data["transcripts"].length; i++){
        let transDiv = document.createElement('div');
        transDiv.setAttribute('class', 'trans-info-review');
        let trans_ul = document.createElement('ul');
        trans_ul.setAttribute('id', 'trans-review');
        li = document.createElement('li');
        li.innerHTML = "University:".bold() + "   " + data['transcripts'][i]['trans_info']['university'];
        trans_ul.appendChild(li);
        li = document.createElement('li');
        li.innerHTML = "Country:".bold() + "   " + data['transcripts'][i]['trans_info']['country'];
        trans_ul.appendChild(li);
        transDiv.appendChild(trans_ul);
        
        let clonedTable = transTable.cloneNode(true);
        while(clonedTable.rows.length > 1){
            clonedTable.deleteRow(-1);
        }
        addRows(clonedTable, data['transcripts'][i]['trans_table'].length, data['transcripts'][i]['trans_table']);
        transDiv.appendChild(clonedTable);
        mainPage.appendChild(transDiv);
    }
}

function addRows(transTable, numRows, data){
    for(let i=0; i<numRows; i++){
        let row = transTable.insertRow(-1);
        row.setAttribute('class', 'table-head-row');                
        let td = row.insertCell(0);
        if(!data){
            let ele = document.createElement('input');
            ele.type = 'text';
            ele.setAttribute('class', 'ccode-entry');
            td.appendChild(ele);
        } else {
            td.innerHTML = data[i]["coursecode"];
        }

        td = row.insertCell(1);
        if(!data){
            let ele = document.createElement('input');
            ele.type = 'text';
            ele.setAttribute('class', 'cname-entry');
            td.appendChild(ele);
        } else {
            td.innerHTML = data[i]["coursename"];
        }
        

        td = row.insertCell(2);
        if(!data){
            let ele = document.createElement('input');
            ele.type = 'text';
            ele.setAttribute('class', 'credit-entry');
            td.appendChild(ele);
        } else {
            td.innerHTML = data[i]["credit"];
        }
        
        td = row.insertCell(3);
        if(!data){
            let ele = document.createElement('input');
            ele.type = 'text';
            ele.setAttribute('class', 'grade-entry');
            td.appendChild(ele);
        } else {
            td.innerHTML = data[i]["grade"];
        }
        
    }
}
function initListeners(){
    // bindIndexedEvent(
    //     "destroy",
    //     function(index){return "/delete/" + state + "/" + index}
    // );
    // bindIndexedEvent(
    //     "toggle",
    //     function(index){return "/toggle/" + state + "/" + index}
    // );
    // bindEvent("toggle-all", "/toggle-all/" + state);
    // bindEvent("todo-all", "/list/all", "all");
    // bindEvent("todo-active",  "/list/active", "active");
    // bindEvent("todo-completed", "/list/completed", "completed");
    // bindEvent("clear-completed", "/clear-completed/" + state);
    // window.onbeforeunload = function (e) {
    //     return "Please click 'Stay on this Page' if you did this unintentionally";
    // };
    let globalData = {};
    if(getCookie("gpaobj")){
        globalData = JSON.parse(getCookie("gpaobj"))
    }
    console.log(globalData);

    //student's general information
    let firstNameInput = document.getElementsByClassName("student-first-name")[0];
    let lastNameInput = document.getElementsByClassName("student-last-name")[0];
    let midInput = document.getElementsByClassName("new-student-mid")[0];
    let emailInput = document.getElementsByClassName("new-student-email")[0];

    //toefl scores
    let tlisInput = document.getElementsByClassName("toefl-listening")[0];
    let treadInput = document.getElementsByClassName("toefl-reading")[0];
    let tspeakInput = document.getElementsByClassName("toefl-speaking")[0];
    let twriteInput = document.getElementsByClassName("toefl-writing")[0];

    //gre scores
    let gverbalInput = document.getElementsByClassName("gre-verbal")[0];
    let gquantInput = document.getElementsByClassName("gre-quant")[0];
    let gwriteInput = document.getElementsByClassName("gre-writing")[0];

    if(globalData["student"]){
        firstNameInput.value = globalData["student"]["firstname"];
        lastNameInput.value = globalData["student"]["lastname"];
        midInput.value = globalData["student"]["mid"];
        emailInput.value = globalData["student"]["email"];
        if(globalData["toeflEntered"] === true){
            tlisInput.value = globalData["student"]["tlisten"];
            treadInput.value = globalData["student"]["tread"];
            tspeakInput.value = globalData["student"]["tspeak"];
            twriteInput.value = globalData["student"]["twrite"];
        }
        if(globalData["greEntered"] === true){
            gverbalInput.value = globalData["student"]["gverbal"];
            gquantInput.value = globalData["student"]["gquant"];
            gwriteInput.value = globalData["student"]["gwrite"];
        }
    }

    let firstTransTable = document.getElementsByClassName("trans-table")[0];
    let reviewButton = document.getElementsByClassName("review")[0];
    let addTransButton = document.getElementsByClassName("add-trans")[0];
    let removeTransButton = document.getElementsByClassName("remove-trans")[0];

    let mainPage = document.getElementsByClassName("main")[0];

    //insert data from previous page
    
    if(globalData["transcripts"]){
        let numTrans = globalData["transcripts"].length;
        let numTransInPage = document.getElementsByClassName("transcript").length;
        for(let i=numTransInPage; i < numTrans; i++){
            addNewTranscript();
        }
        for(let i=0; i<numTrans; i++){
            let trans = document.getElementsByClassName("transcript")[i];
            let degreeSelect = trans.getElementsByClassName("degree-select")[0];
            let uniInput = trans.getElementsByClassName("uni")[0];
            //let countrySelect = trans.getElementsByClassName("country")[0];
            uniInput.value = globalData["transcripts"][i]["trans_info"]["university"];
            //countrySelect.value = globalData["transcripts"][i]["trans_info"]["country"];
            degreeSelect.value = globalData["transcripts"][i]["trans_info"]["degree"];
            let numRows = globalData["transcripts"][i]["trans_table"].length;
            let numRowsInPage = trans.getElementsByClassName("ccode-entry").length;
            for(let i=numRowsInPage; i < numRows; i+=3){
                addRows(trans.getElementsByClassName("trans-table")[0],3);
            }
            for(let j=0; j<numRows; j++){
                trans.getElementsByClassName("ccode-entry")[j].value = globalData["transcripts"][i]["trans_table"][j]["coursecode"];
                trans.getElementsByClassName("cname-entry")[j].value = globalData["transcripts"][i]["trans_table"][j]["coursename"];
                trans.getElementsByClassName("credit-entry")[j].value = globalData["transcripts"][i]["trans_table"][j]["credit"];
                trans.getElementsByClassName("grade-entry")[j].value = globalData["transcripts"][i]["trans_table"][j]["grade"];
            }
        }
    }
    //add addrow button event listener and country selector event listener
    let numTrans = document.getElementsByClassName("transcript").length;
    console.log(numTrans);
    for(let i=0; i<numTrans; i++){
        let t = document.getElementsByClassName("transcript")[i];
        let addrowButton = t.getElementsByClassName("addrow")[0];
        // let countrySelector = t.getElementsByClassName("country")[0];
        // let gpaScaleTable = t.getElementsByClassName("gpa-scale-table-div")[0];
        let transTable = t.getElementsByClassName("trans-table")[0];
        // countrySelector.addEventListener(
        //     "click",
        //     function(evt){
                
        //     }
        // )
        addrowButton.addEventListener(
            "click",
            function(evt){
                addRows(transTable, 3);
            }
        );
    }

    addTransButton.addEventListener(
        "click",
        function(evt){
            addNewTranscript();
        }
    ); 

    removeTransButton.addEventListener(
        "click",
        function(evt){
            let all_trans = document.getElementById("transcripts");
            if(all_trans.childElementCount > 1){
                all_trans.removeChild(all_trans.lastChild);
            }
        }
    ); 

    window.onunload = function (e) {
        let data = {}
        //let sid = generateRandomId();
        data["student"] = getStudentJsonRequest(0, firstNameInput.value, lastNameInput.value, 
            midInput.value, emailInput.value, tlisInput.value, treadInput.value, tspeakInput.value, twriteInput.value,
            gverbalInput.value, gquantInput.value, gwriteInput.value);
        // parse transcript tables
        let all_trans = [];
        let numTrans = document.getElementsByClassName("transcript").length;
        for(let i=0; i<numTrans; i++){
            let trans_obj = {};
            //let tid = generateRandomId();
            let trans = document.getElementsByClassName("transcript")[i];
            let degree = trans.getElementsByClassName("degree-select")[0];
            let newUni = trans.getElementsByClassName("uni")[0];
            let newCountry = trans.getElementsByClassName("country")[0];
            trans_obj["trans_info"] = getTransJsonRequest(0, 0, degree.value, newUni.value, newCountry.value);
            let numRow = trans.getElementsByClassName("ccode-entry").length;
            let entries = [];
            for(let j=0; j<numRow; j++){
                let ccode = trans.getElementsByClassName("ccode-entry")[j];
                let cname = trans.getElementsByClassName("cname-entry")[j];
                let credit = trans.getElementsByClassName("credit-entry")[j];
                let grade = trans.getElementsByClassName("grade-entry")[j];
                //let eid = generateRandomId();
                if(ccode.value === "" || cname.value === "" || credit.value === "" || grade.value === "") continue;
                entries.push(getEntryJsonRequest(0, 0, ccode.value, cname.value, credit.value, grade.value));
            }
            trans_obj["trans_table"] = entries;
            all_trans.push(trans_obj);
        }
        data["transcripts"] = all_trans;
        console.log(data);
        setCookie(JSON.stringify(data), 7);
    };

    reviewButton.addEventListener(
        "click",
        function(evt){
            if(checkStudentInfo(firstNameInput, lastNameInput, midInput, 
                emailInput, tlisInput, treadInput, tspeakInput, twriteInput, gverbalInput, gquantInput, gwriteInput)){
                // parse student general information 
                let data = {}
                //let sid = generateRandomId();
                data["student"] = getStudentJsonRequest(0, firstNameInput.value, lastNameInput.value, 
                    midInput.value, emailInput.value, tlisInput.value, treadInput.value, tspeakInput.value, twriteInput.value,
                    gverbalInput.value, gquantInput.value, gwriteInput.value);
                if(data["student"]["tlisten"] === 0 && data["student"]["tread"] === 0 && data["student"]["tspeak"] === 0 && data["student"]["twrite"] === 0){
                    data["toeflEntered"] = false;
                } else {
                    data["toeflEntered"] = true;
                }
                if(data["student"]["gverbal"] === 0 && data["student"]["gquant"] === 0 && data["student"]["gwrite"] === 0){
                    data["greEntered"] = false;
                } else {
                    data["greEntered"] = true;
                }
                // parse transcript tables
                let all_trans = [];
                let numTrans = document.getElementsByClassName("transcript").length;
                for(let i=0; i<numTrans; i++){
                    let trans_obj = {};
                    //let tid = generateRandomId();
                    let trans = document.getElementsByClassName("transcript")[i];
                    let degree = trans.getElementsByClassName("degree-select")[0];
                    let newUni = trans.getElementsByClassName("uni")[0];
                    let newCountry = trans.getElementsByClassName("country")[0];
                    if(!checkTransInfo(trans, newUni, newCountry)){
                        return;
                    }
                    trans.getElementsByClassName("gpa-scale-label")[0].innerHTML = "";
                    trans.getElementsByClassName("gpa-scale-table-div")[0].innerHTML = "";
                    trans_obj["trans_info"] = getTransJsonRequest(0, 0, degree.value, newUni.value, newCountry.value);
                    let numRow = trans.getElementsByClassName("ccode-entry").length;
                    let entries = [];
                    trans.getElementsByClassName("invalid-table")[0].innerHTML = "";
                    for(let j=0; j<numRow; j++){
                        let ccode = trans.getElementsByClassName("ccode-entry")[j];
                        let cname = trans.getElementsByClassName("cname-entry")[j];
                        let credit = trans.getElementsByClassName("credit-entry")[j];
                        let grade = trans.getElementsByClassName("grade-entry")[j];
                        //let eid = generateRandomId();
                        if(!checkTable(ccode, cname, credit, grade)){
                            trans.getElementsByClassName("invalid-table")[0].innerHTML = "Please fill in the table correctly.";
                            return;
                        }
                        if(ccode.value === "" || cname.value === "" || credit.value === "" || grade.value === "") continue;
                        entries.push(getEntryJsonRequest(0, 0, ccode.value, cname.value, credit.value, grade.value));
                    }
                    if(entries.length == 0){
                        trans.getElementsByClassName("invalid-table")[0].innerHTML = "The transcript table cannot be empty.";
                        return;
                    } else {
                        trans.getElementsByClassName("invalid-table")[0].innerHTML = "";
                    }
                    trans_obj["trans_table"] = entries;
                    all_trans.push(trans_obj);
                }
                data["transcripts"] = all_trans;
                console.log(data);
                
                // store the current page
                // console.log(mainPage.cloneNode(true));
                window.sessionStorage.setItem('main-page', mainPage.cloneNode(true).innerHTML);
                while(mainPage.childElementCount > 0){
                    mainPage.removeChild(mainPage.lastChild);
                }
                let reviewMessage = document.createElement('h3');
                reviewMessage.innerHTML = "Please review your information";
                reviewMessage.setAttribute('class', 'message');
                mainPage.appendChild(reviewMessage);
                insertData(mainPage, firstTransTable, data);
                globalData = {};

                let buttonsDiv = document.createElement('div');
                buttonsDiv.setAttribute('class', 'back-submit-div');
                let back = document.createElement('button');
                back.setAttribute('class', 'back');
                back.innerHTML = "Back";
                back.addEventListener(
                    "click",
                    function(evt){
                        while(mainPage.childElementCount > 0){
                            mainPage.removeChild(mainPage.lastChild);
                        }
                        let storedPage = window.sessionStorage.getItem('main-page');
                        // console.log(storedPage);
                        // console.log(storedPage.innerHTML);
                        //while(storedPage.childElementCount > 0){
                         //   mainPage.appendChild(storedPage.removeChild(storedPage.firstChild));
                        //}
                        mainPage.innerHTML = storedPage;
                        setCookie(JSON.stringify(data), 7);
                        initListeners();                      
                    }
                );
                buttonsDiv.appendChild(back);

                let submit = document.createElement('button');
                submit.setAttribute('class', 'submit');
                submit.innerHTML = "Submit";
                submit.addEventListener(
                    "click",
                    function(evt){
                        fetch("/add/" + state, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        })
                        .then(function(response){ return response.text()})
                        .then(function (text) {
                            let inputs = mainPage.getElementsByTagName('input');
                            for (i = 0; i < inputs.length; ++i) {
                                inputs[i].value = "";
                            }
                            document.cookie = "gpaobj= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
                            gpaCalApp.innerHTML = text;
                        //    initListeners()
                        })
                    }
                );
                buttonsDiv.appendChild(submit);
                mainPage.appendChild(buttonsDiv);
            }
        }
    );

    // reviewButton.addEventListener(
    //     "click",
    //     function(evt){
    //         if(checkValidity(newNameInput, newMidInput, newEmailInput,newGpaInput, newGreInput)){
    //             fetch("/add/" + state, {
    //                 method: "POST",
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify(getJsonRequest(newNameInput.value,
    //                      newMidInput.value, newEmailInput.value, 
    //                      newGpaInput.value, newGreInput.value, 
    //                      newTransUni.value,newTransCountry.value ))
    //             })
    //             .then(function(response){ return response.text()})
    //             .then(function (text) {
    //                 newNameInput.value = "";
    //                 newMidInput.value = "";
    //                 newEmailInput.value = "";
    //                 newGpaInput.value = "";
    //                 newGreInput.value = "";
    //                 newTransUni = "";
    //                 newTransCountry = "";
    //                 todoApp.innerHTML = text;
    //             //    initListeners()
    //             })
    //         }
    //     }
    // );
}
initListeners()