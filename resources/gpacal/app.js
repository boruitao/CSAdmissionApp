var state = "all";

var gpaCalApp = document.getElementsByClassName("gpa-calculator")[0];
function postFetchUpdate(url){
    fetch(url, {
        method: "POST",
    })
    .then(function(response){ return response.text()})
    .then(function (text) {
        gpaCalApp.innerHTML = text;
        initListeners()
    })
}

function bindEvent(cls, url, endState){

    document.getElementsByClassName(cls)[0].addEventListener(
        "mousedown",
        function(evt){
            postFetchUpdate(url)
            if (endState) state = endState
        }
    );
}

function bindIndexedEvent(cls, func){
    Array.from(document.getElementsByClassName(cls)).forEach( function(elem) {
        elem.addEventListener(
            "mousedown",
            function(evt){
                postFetchUpdate(func(elem.getAttribute("data-todo-index")))
            }
        )
    });
}

function getStudentJsonRequest(sid, firstName, lastName, mid, email, tlis, tread, tspeak, twrite, gverbal, gquant, gwrite){
    var obj = {"sid":sid, "firstname":firstName, "lastname":lastName, "mid":mid, "email":email, 
        "tlisten": Number(tlis), "tread": Number(tread), "tspeak": Number(tspeak), "twrite": Number(twrite), 
        "gverbal": Number(gverbal), "gquant": Number(gquant), "gwrite": Number(gwrite)};
    return obj;
}

function getTransJsonRequest(sid, tid, degree, newUni, newCountry){
    var obj = {"tid":tid,"sid":sid, "degree":degree,"university":newUni, "country":newCountry};
    return obj;
}

function getEntryJsonRequest(eid, tid, ccode, cname, credit, grade){
    var obj = {"eid":eid,"tid":tid, "coursecode":ccode, "coursename":cname, "credit":Number(credit), "grade":grade};
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
    let isnum = /^\d+$/.test(gverbalInput) && /^\d+$/.test(gquantInput) && /^\d+$/.test(gwriteInput);
    if(!isnum|| Number(gverbalInput) > 170 || Number(gverbalInput) < 130 || Number(gquantInput) > 170 || Number(gquantInput) < 130
        || Number(gwriteInput) > 6 || Number(gquantInput) < 0){
        return false;
    }
    return true;
}

function checkTable(ccode, cname, credit, grade){
    if(!ccode.value && !cname.value && !credit.value && !grade.value){
        return true;
    } else if (!ccode.value || !cname.value || !credit.value || !grade.value){
        return false;
    } else if(!(/^\d+$/.test(credit.value))){
        return false;
    }
    return true;
}

function checkTransInfo(trans, newUni, newCountry){
    var invalidUni = trans.getElementsByClassName("invalid-uni")[0];
    var invalidCountry = trans.getElementsByClassName("invalid-country")[0];
    var isValid = true;
    if(!newUni.value){
        invalidUni.innerHTML = "Please specify the university."
        isValid = false;
    }else{
        invalidUni.innerHTML = "";
    }
    if(!newCountry.value){
        invalidCountry.innerHTML = "Please specify the country of the university."
        isValid = false;
    }else{
        invalidCountry.innerHTML = "";
    }
    return isValid;
}

function checkStudentInfo(firstNameInput, lastNameInput, midInput, emailInput, tlisInput, 
    treadInput, tspeakInput, twriteInput, gverbalInput, gquantInput, gwriteInput){
    var invalidNameP = document.getElementsByClassName("invalid-name")[0];
    var invalidMidP = document.getElementsByClassName("invalid-mid")[0];
    var invalidEmailP = document.getElementsByClassName("invalid-email")[0];
    var invalidToefL = document.getElementsByClassName("invalid-toefl")[0];
    var invalidGreP = document.getElementsByClassName("invalid-gre")[0];

    var isValid = true;
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

function generateRandomId(){
    var result           = '';
    var chars       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var len = chars.length;
    for ( var i = 0; i < 10; i++ ) {
        result += chars.charAt(Math.floor(Math.random() * len));
    }
    return result;
}

function insertData(mainPage, transTable, data){
    //insert student's general info to the review page
    var studentDiv = document.createElement('div');
    studentDiv.setAttribute('class', 'student-info-review');
    var student_ul = document.createElement('ul');
    student_ul.setAttribute('id', 'student-review');
    var li = document.createElement('li');
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
    for(var i=0; i<data["transcripts"].length; i++){
        var transDiv = document.createElement('div');
        transDiv.setAttribute('class', 'trans-info-review');
        var trans_ul = document.createElement('ul');
        trans_ul.setAttribute('id', 'trans-review');
        li = document.createElement('li');
        li.innerHTML = "University:".bold() + "   " + data['transcripts'][i]['trans_info']['university'];
        trans_ul.appendChild(li);
        li = document.createElement('li');
        li.innerHTML = "Country:".bold() + "   " + data['transcripts'][i]['trans_info']['country'];
        trans_ul.appendChild(li);
        transDiv.appendChild(trans_ul);
        
        var clonedTable = transTable.cloneNode(true);
        while(clonedTable.rows.length > 1){
            clonedTable.deleteRow(-1);
        }
        addRows(clonedTable, data['transcripts'][i]['trans_table'].length, data['transcripts'][i]['trans_table']);
        transDiv.appendChild(clonedTable);
        mainPage.appendChild(transDiv);
    }
}

function addRows(transTable, numRows, data){
    for(var i=0; i<numRows; i++){
        var row = transTable.insertRow(-1);
        row.setAttribute('class', 'table-head-row');                
        var td = row.insertCell(0);
        if(!data){
            var ele = document.createElement('input');
            ele.type = 'text';
            ele.setAttribute('class', 'ccode-entry');
            td.appendChild(ele);
        } else {
            td.innerHTML = data[i]["coursecode"];
        }

        td = row.insertCell(1);
        if(!data){
            var ele = document.createElement('input');
            ele.type = 'text';
            ele.setAttribute('class', 'cname-entry');
            td.appendChild(ele);
        } else {
            td.innerHTML = data[i]["coursename"];
        }
        

        td = row.insertCell(2);
        if(!data){
            var ele = document.createElement('input');
            ele.type = 'text';
            ele.setAttribute('class', 'credit-entry');
            td.appendChild(ele);
        } else {
            td.innerHTML = data[i]["credit"];
        }
        
        td = row.insertCell(3);
        if(!data){
            var ele = document.createElement('input');
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
    window.onbeforeunload = function (e) {
        return "Please click 'Stay on this Page' if you did this unintentionally";
    };

    //student's general information
    var firstNameInput = document.getElementsByClassName("student-first-name")[0];
    var lastNameInput = document.getElementsByClassName("student-last-name")[0];
    var midInput = document.getElementsByClassName("new-student-mid")[0];
    var emailInput = document.getElementsByClassName("new-student-email")[0];

    //toefl scores
    var tlisInput = document.getElementsByClassName("toefl-listening")[0];
    var treadInput = document.getElementsByClassName("toefl-reading")[0];
    var tspeakInput = document.getElementsByClassName("toefl-speaking")[0];
    var twriteInput = document.getElementsByClassName("toefl-writing")[0];

    //gre scores
    var gverbalInput = document.getElementsByClassName("gre-verbal")[0];
    var gquantInput = document.getElementsByClassName("gre-quant")[0];
    var gwriteInput = document.getElementsByClassName("gre-writing")[0];

    var transTable = document.getElementsByClassName("trans-table")[0];
    var addrowButton = document.getElementsByClassName("addrow")[0];
    
    var reviewButton = document.getElementsByClassName("review")[0];
    var addTransButton = document.getElementsByClassName("add-trans")[0];
    var removeTransButton = document.getElementsByClassName("remove-trans")[0];

    //transcript general info

    reviewButton.addEventListener(
        "click",
        function(evt){
            if(checkStudentInfo(firstNameInput, lastNameInput, midInput, 
                emailInput, tlisInput, treadInput, tspeakInput, twriteInput, gverbalInput, gquantInput, gwriteInput)){
                // parse student general information 
                var data = {}
                var sid = generateRandomId();
                data["student"] = getStudentJsonRequest(sid, firstNameInput.value, lastNameInput.value, 
                    midInput.value, emailInput.value, tlisInput.value, treadInput.value, tspeakInput.value, twriteInput.value,
                    gverbalInput.value, gquantInput.value, gwriteInput.value);
                mainPage = document.getElementsByClassName("main")[0];
                // parse transcript tables
                var all_trans = [];
                var numTrans = document.getElementsByClassName("transcript").length;
                for(var i=0; i<numTrans; i++){
                    var trans_obj = {};
                    var tid = generateRandomId();
                    var trans = document.getElementsByClassName("transcript")[i];
                    var degree = trans.getElementsByClassName("degree-select")[0];
                    var newUni = trans.getElementsByClassName("uni")[0];
                    var newCountry = trans.getElementsByClassName("country")[0];
                    if(!checkTransInfo(trans, newUni, newCountry)){
                        return;
                    }
                    trans_obj["trans_info"] = getTransJsonRequest(sid, tid, degree.value, newUni.value, newCountry.value);
                    var numRow = trans.getElementsByClassName("ccode-entry").length;
                    var entries = [];
                    trans.getElementsByClassName("invalid-table")[0].innerHTML = "";
                    for(var j=0; j<numRow; j++){
                        var ccode = trans.getElementsByClassName("ccode-entry")[j];
                        var cname = trans.getElementsByClassName("cname-entry")[j];
                        var credit = trans.getElementsByClassName("credit-entry")[j];
                        var grade = trans.getElementsByClassName("grade-entry")[j];
                        var eid = generateRandomId();
                        if(!checkTable(ccode, cname, credit, grade)){
                            trans.getElementsByClassName("invalid-table")[0].innerHTML = "Please fill in the table correctly.";
                            return;
                        }
                        if(ccode.value === "" || cname.value === "" || credit.value === "" || grade.value === "") continue;
                        entries.push(getEntryJsonRequest(eid, tid, ccode.value, cname.value, credit.value, grade.value));
                    }
                    trans_obj["trans_table"] = entries;
                    all_trans.push(trans_obj);
                }
                data["transcripts"] = all_trans;
                console.log(data);
                
                // store the current page
                console.log(mainPage.cloneNode(true));
                window.sessionStorage.setItem('main-page', mainPage.cloneNode(true).innerHTML);
                while(mainPage.childElementCount > 0){
                    mainPage.removeChild(mainPage.lastChild);
                }
                var reviewMessage = document.createElement('h3');
                reviewMessage.innerHTML = "Please review your information";
                reviewMessage.setAttribute('class', 'message');
                mainPage.appendChild(reviewMessage);
                insertData(mainPage, transTable, data);
                
                var buttonsDiv = document.createElement('div');
                buttonsDiv.setAttribute('class', 'back-submit-div');
                var back = document.createElement('button');
                back.setAttribute('class', 'back');
                back.innerHTML = "Back";
                back.addEventListener(
                    "click",
                    function(evt){
                        while(mainPage.childElementCount > 0){
                            mainPage.removeChild(mainPage.lastChild);
                        }
                        var storedPage = window.sessionStorage.getItem('main-page');
                        console.log(storedPage);
                        console.log(storedPage.innerHTML);
                        //while(storedPage.childElementCount > 0){
                         //   mainPage.appendChild(storedPage.removeChild(storedPage.firstChild));
                        //}
                        mainPage.innerHTML = storedPage;
                        initListeners();
                    }
                );
                buttonsDiv.appendChild(back);

                var submit = document.createElement('button');
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
                            var inputs = mainPage.getElementsByTagName('input');
                            for (i = 0; i < inputs.length; ++i) {
                                inputs[i].value = "";
                            }
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

    addrowButton.addEventListener(
        "click",
        function(evt){
            addRows(transTable, 3);
        }
    );

    addTransButton.addEventListener(
        "click",
        function(evt){
            var transcript = document.getElementById("transcripts").firstChild;
            var newTrans = transcript.cloneNode(true);
            var inputs = newTrans.getElementsByTagName('input');
            for (i = 0; i < inputs.length; ++i) {
               inputs[i].value = "";
            }
            var arButton = newTrans.getElementsByClassName("addrow")[0];
            var ttable = newTrans.getElementsByClassName("trans-table")[0];
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
    ); 

    removeTransButton.addEventListener(
        "click",
        function(evt){
            var all_trans = document.getElementById("transcripts");
            if(all_trans.childElementCount > 1){
                all_trans.removeChild(all_trans.lastChild);
            }
        }
    ); 
}
initListeners()