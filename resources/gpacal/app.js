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

function getStudentJsonRequest(sid, newName, newMid, newEmail, newGpa, newGre){
    var obj = {"sid":sid, "name":newName, "mid":newMid, "email":newEmail, "gpa":Number(newGpa), "gre":Number(newGre)};
    return obj;
}

function getTransJsonRequest(sid, tid, newUni, newCountry){
    var obj = {"tid":tid,"sid":sid, "university":newUni, "country":newCountry};
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

function checkGPA(newGpa){
    if(!newGpa) return false;
    let isGpa = /^\d*(\.\d{0,2})?$/.test(newGpa);
    if(!isGpa || Number(newGpa) > 4 || Number(newGpa) < 0){
        return false;
    }
    return true;
}

function checkGRE(newGre){
    if(!newGre || 0 === newGre.length) return true;
    let isnum = /^\d+$/.test(newGre);
    if(!isnum|| Number(newGre) > 340 || Number(newGre) < 0){
        return false;
    }
    return true;
}

function checkValidity(newNameInput, newMidInput, newEmailInput,newGpaInput, newGreInput){
    var invalidNameP = document.getElementsByClassName("invalid-name")[0];
    var invalidMidP = document.getElementsByClassName("invalid-mid")[0];
    var invalidEmailP = document.getElementsByClassName("invalid-email")[0];
    var invalidGpaP = document.getElementsByClassName("invalid-gpa")[0];
    var invalidGreP = document.getElementsByClassName("invalid-gre")[0];

    var isValid = true;
    if(!newNameInput.value){
        invalidNameP.innerHTML = "Please specify your full name.";
        isValid = false;
    }else{
        invalidNameP.innerHTML = "";
    }
    if(!checkMid(newMidInput.value)){
        invalidMidP.innerHTML = "Please specify your McGill ID correctly.";
        isValid = false;
    } else{
        invalidMidP.innerHTML = "";
    }
    if(!checkEmail(newEmailInput.value)){
        invalidEmailP.innerHTML = "Please specify your McGill Email in the following format: last.first@mail.mcgill.ca.";
        isValid = false;
    } else {
        invalidEmailP.innerHTML = "";
    }
    if(!checkGPA(newGpaInput.value)){
        invalidGpaP.innerHTML = "Please specify your GPA in 4.0 scale.";
        isValid = false;
    } else {
        invalidGpaP.innerHTML = "";
    }
    if(!checkGRE(newGreInput.value)){
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
    li.innerHTML = "Full Name:".bold() + "   " + data['student']['name'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "McGill ID:".bold() + "   " + data['student']['mid'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "McGill Email:".bold() + "   " + data['student']['email'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "GPA:".bold() + "   " + data['student']['gpa'];
    student_ul.appendChild(li);
    li = document.createElement('li');
    li.innerHTML = "GRE:".bold() + "   " + data['student']['gre'];
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
    var newNameInput = document.getElementsByClassName("new-student-name")[0];
    var newMidInput = document.getElementsByClassName("new-student-mid")[0];
    var newEmailInput = document.getElementsByClassName("new-student-email")[0];
    var newGpaInput = document.getElementsByClassName("new-student-gpa")[0];
    var newGreInput = document.getElementsByClassName("new-student-gre")[0];
   
    var transTable = document.getElementsByClassName("trans-table")[0];
    var addrowButton = document.getElementsByClassName("addrow")[0];
    
    var reviewButton = document.getElementsByClassName("review")[0];
    var addTransButton = document.getElementsByClassName("add-trans")[0];
    var removeTransButton = document.getElementsByClassName("remove-trans")[0];

    //transcript general info

    reviewButton.addEventListener(
        "click",
        function(evt){
            if(checkValidity(newNameInput, newMidInput, newEmailInput,newGpaInput, newGreInput)){
                // parse student general information 
                var data = {}
                var sid = generateRandomId();
                data["student"] = getStudentJsonRequest(sid, newNameInput.value,
                    newMidInput.value, newEmailInput.value, 
                    newGpaInput.value, newGreInput.value);
                mainPage = document.getElementsByClassName("main")[0];
                // parse transcript tables
                var all_trans = [];
                var numTrans = document.getElementsByClassName("transcript").length;
                for(var i=0; i<numTrans; i++){
                    var trans_obj = {};
                    var tid = generateRandomId();
                    var trans = document.getElementsByClassName("transcript")[i];
                    var newUni = trans.getElementsByClassName("uni")[0];
                    var newCountry = trans.getElementsByClassName("country")[0];
                    trans_obj["trans_info"] = getTransJsonRequest(sid, tid, newUni.value, newCountry.value);
                    var numRow = trans.getElementsByClassName("ccode-entry").length;
                    var entries = [];
                    for(var j=0; j<numRow; j++){
                        var ccode = trans.getElementsByClassName("ccode-entry")[j];
                        var cname = trans.getElementsByClassName("cname-entry")[j];
                        var credit = trans.getElementsByClassName("credit-entry")[j];
                        var grade = trans.getElementsByClassName("grade-entry")[j];
                        var eid = generateRandomId();
                        if(ccode.value === "") continue;
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
                            newNameInput.value = "";
                            newMidInput.value = "";
                            newEmailInput.value = "";
                            newGpaInput.value = "";
                            newGreInput.value = "";
                            newTransUni = "";
                            newTransCountry = "";
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