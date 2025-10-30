//loading webspace
totalHex = 48;
hexCount = 0;
var testMobile = /iPhone|Android|iPad/i.test(navigator.userAgent);
function loadWebSpace() {
    commands = "onclick='selecthex(this.id)' onmouseenter='enterhex(this.id)' onmouseleave='leavehex(this.id)' oncontextmenu='hexMenu(event,this.id)'";
    collums = Math.floor(window.screen.width / 110);
    lines = 48 / collums;
    for (l = 0; l < lines; l++) {
        document.getElementById("webspace").innerHTML += "<div class='hex-grid' id='l" + l + "'></div>";
        for (c = 0; c < collums; c++) {
            if (hexCount < totalHex) {
                document.getElementById("l" + l).innerHTML += "<div class='hex' id='hex" + hexCount + "' " + commands + "><div onmousedown='draghex(this.id)' onmouseup='enddraghex(this.id)' id='innerhex" + hexCount + "' class='hex-inner'></div></div>";
                hexCount += 1;
            }
        }
    }
    hexData();
}

//loadDatabase
function hexData() {
    firebase.database().ref(webspace + "/grid").on('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            childKey = childSnapshot.key; childData = childSnapshot.val();
            if (childData != "") {
                document.getElementById("innerhex" + childKey).innerHTML = "<img src='https://www.google.com/s2/favicons?sz=128&domain=" + childData + "' draggable='false'>";
            } else {
                document.getElementById("innerhex" + childKey).innerHTML = "";
            }

        });
    });
}


//management
keyPressed = [];
document.addEventListener('keydown', function (event) {
    keyPressed.push(event.key);
    console.log(event.key);
});
document.addEventListener('keyup', function (event) {
    keyPressed = keyPressed.filter(item => item != event.key);
});
selected = [];
hovered = ""
dragging = "";

function openHex(hex) {
    isopen = false;
    firebase.database().ref(webspace + "/grid/" + hex).on("value", data => {
        if (!isopen && data.val() != "") {
            isopen = true;
            window.open('https://' + data.val(), '_blank');
        }
    })
}

function selecthex(hex) {
    if (selected.includes(hex)) {
        if (keyPressed.includes("Control")) {
            selected = selected.filter(item => item != hex);
        } else {
            openHex(hex.replace('hex', ''))
        }
    } else {
        if (keyPressed.includes("Control")) {
            selected.push(hex);
        } else {
            selected = [hex];
        }
    }
    for (hexs of document.getElementsByClassName('hex')) {
        if (selected.includes(hexs.id)) {
            hexs.style.backgroundColor = "lime";
        } else {
            hexs.style.backgroundColor = "#454545";
        }
    }
}

function enterhex(hex) {
    hovered = hex;
    if (!(selected.includes(hex))) {
        document.getElementById(hex).style.backgroundColor = "white";
    }
}

function leavehex(hex) {
    hovered = "";
    if (!(selected.includes(hex))) {
        document.getElementById(hex).style.backgroundColor = "#454545";
    }
}

function hexMenu(e, hex) {
    e.preventDefault();
    if (keyPressed.includes("Control") && !(selected.includes(hex))) {
        selected.push(hex);
    } else if (!keyPressed.includes("Control")) {
        selected = [hex];
    }
    document.getElementById("editBox").style.visibility = "visible";
    document.getElementById("ehexs").innerHTML = "";
    document.getElementById("ehexdats").innerHTML = "Hexagonal";
    for (hexs of selected) {
        document.getElementById("ehexs").innerHTML += hexs + ",";
    }
}

function draghex(hex) {
    dragging = hex;
}
function enddraghex(hex) {
    if (dragging != hex) {
        console.log("Dragged: " + dragging + " to " + hex);
        gotFrom = false;
        gotTo = false;
        firebase.database().ref(webspace + "/grid/" + dragging.replace('innerhex', '')).on("value", data => {
            if (!gotFrom) {
                gotFrom = data.val();
                firebase.database().ref(webspace + "/grid/" + hex.replace('innerhex', '')).on("value", data => {
                    if (!gotTo) {
                        gotTo = data.val();
                        if (gotFrom != "" && gotTo == "") {
                            firebase.database().ref(webspace + "/grid/").update({
                                [hex.replace('innerhex', '')]: gotFrom,
                                [dragging.replace('innerhex', '')]: ""
                            });
                        }
                    }
                })
            }
        })
    }
    dragging = "";
}

//functionalities
function addLink() {
    link = document.getElementById("linkin").value;
    added = false;
    if (link) {
        firebase.database().ref(webspace + "/grid").on('value', function (snapshot) {
            if (!added) {
                snapshot.forEach(function (childSnapshot) {
                    childKey = childSnapshot.key; childData = childSnapshot.val();
                    if (childData == "" && !added) {
                        added = true;
                        firebase.database().ref(webspace + "/grid/").update({
                            [childKey]: link.replace('https://', '')
                        });
                    }
                });
            }
        });
    }
}

function goLink() {
    link = document.getElementById("linkin").value;
    if (link) {
        window.open('https://' + link, '_blank');
    }
}

function closeEditor() {
    document.getElementById("editBox").style.visibility = "hidden";
}

function openAllHex() {
    opened = false;
    firebase.database().ref(webspace + "/grid/").on('value', function (snapshot) {
        if (!opened) {
            opened = true;
            snapshot.forEach(function (childSnapshot) {
                childKey = childSnapshot.key; childData = childSnapshot.val();
                if (childData != "" && selected.includes('hex' + childKey)) {
                    window.open('https://' + childData, '_blank');
                }
            });
        }
    });
    closeEditor();
}

function readAllHex() {
    opened = false;
    firebase.database().ref(webspace + "/grid/").on('value', function (snapshot) {
        if (!opened) {
            opened = true;
            snapshot.forEach(function (childSnapshot) {
                childKey = childSnapshot.key; childData = childSnapshot.val();
                if (childData != "" && selected.includes('hex' + childKey)) {
                    document.getElementById("ehexdats").innerHTML += "<br><a href='" + childData + "'>" + childKey + " | " + childData + "</a>";
                }
            });
        }
    });
}

function deleteHex() {
    if (confirm("Delete this " + selected.length + " itens?")) {
        for (hexs of selected) {
            item = hexs.replace("hex", "");
            firebase.database().ref(webspace + "/grid/").update({
                [item]: ""
            });
        }
        closeEditor();
    }
}