let hexcolor = "";
let innerhexcolor = "";

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
    loadConfig();
}

//loadDatabase
function hexData() {
    firebase.database().ref(webspace + "/grid").on('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            childKey = childSnapshot.key; childData = childSnapshot.val();
            if (childData != "") {
                document.getElementById("innerhex" + childKey).innerHTML = "<img class='hex-icon' src='https://www.google.com/s2/favicons?sz=128&domain=" + childData + "' draggable='false'>";
            } else {
                document.getElementById("innerhex" + childKey).innerHTML = "";
            }

        });
    });
}

function hexToRgb(hex) {
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        throw new Error("Invalid hex color format.");
    }

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
}

function loadConfig() {
    firebase.database().ref(webspace + "/config/background/").on("value", data => {
        bg = data.val();
        document.getElementById("bgSelector").value = bg;
        if (bg.startsWith("data:image")||bg.startsWith("http")) {
            document.body.style.background = "url(" + bg + ")";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundSize = "cover";
        } else {
            document.body.style.background = bg;
        }
    })
    firebase.database().ref(webspace + "/config/webspace_bg/").on("value", data => {
        spacebg = data.val();
        document.getElementById("bgOpacitySelector").value = spacebg*100;
        document.getElementById("container").style.background = "rgba(0,0,0,"+spacebg+")";
    })
    firebase.database().ref(webspace + "/config/iconsize/").on("value", data => {
        size = data.val();
        document.getElementById("iconSizeSelector").value = size;
        for (icon of document.getElementsByClassName("hex-icon")) {
            icon.style.width = size + "%";
        }
    })
    firebase.database().ref(webspace + "/config/hexcolors/").on("value", data => {
        colors = data.val();
        inner = colors["inner"];
        border = colors["main"];
        opacity = colors["opacity"];
        document.getElementById("hexColSelector").value = border;
        document.getElementById("innerColSelector").value = inner;
        document.getElementById("hexOpacitySelector").value = opacity*100;
        for (hex of document.getElementsByClassName("hex")) {
            color = hexToRgb(border);
            r = color[0];
            g = color[1];
            b = color[2];
            hexcolor = "rgba("+r+","+g+","+b+","+opacity+")";
            hex.style.backgroundColor = hexcolor;
        }
        for (innerhex of document.getElementsByClassName("hex-inner")) {
            color = hexToRgb(inner);
            r = color[0];
            g = color[1];
            b = color[2];
            innerhexcolor = "rgba("+r+","+g+","+b+","+opacity+")"
            innerhex.style.backgroundColor = innerhexcolor;
        }
    })
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
            hexs.style.backgroundColor = hexcolor;
        }
    }
}

function enterhex(hex) {
    hovered = hex;
    if (!(selected.includes(hex))) {
        document.getElementById(hex).style.backgroundColor = "white";
    }
    isread = false
    firebase.database().ref(webspace + "/grid/" + hex.replace('hex', '')).on("value", data => {
        if (!isread) {
            isread = true;
            read = data.val().replace("www.","").replace(".com","").replace(".net","").replace(".org","").replace(".io","").replace(".html","")
            document.getElementById("selection-name").innerHTML = read;
        }
    })
}

function leavehex(hex) {
    hovered = "";
    if (!(selected.includes(hex))) {
        document.getElementById(hex).style.backgroundColor = hexcolor;
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

function closeConfigs() {
    document.getElementById("configBox").style.visibility = "hidden";
}

function openConfigs() {
    document.getElementById("configBox").style.visibility = "visible";
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

function saveConfigs() {
    hexInnerColor = document.getElementById("innerColSelector").value;
    hexMainColor = document.getElementById("hexColSelector").value;
    hexOpacity = document.getElementById("hexOpacitySelector").value;
    bgData = document.getElementById("bgSelector").value;
    bgOpData = document.getElementById("bgOpacitySelector").value;
    iconData = document.getElementById("iconSizeSelector").value;
    if (!(hexInnerColor == "" || hexMainColor == "" || bgData == "" || iconData == "")) {
        firebase.database().ref(webspace + "/config/").update({
            hexcolors: {
                "main": hexMainColor,
                "inner": hexInnerColor,
                "opacity": (Number(hexOpacity) / 100)
            },
            background: bgData,
            webspace_bg:(Number(bgOpData) / 100),
            iconsize: Number(iconData)
        });
    }
}

function restoreConfigs() {
    if (confirm("Restore original configuration?")) {
        firebase.database().ref(webspace + "/config/").update({
            hexcolors: {
                "main": '#454545',
                "inner": '#888888',
                "opacity": 0.9
            },
            background: "black",
            webspace_bg:0.5,
            iconsize: 80
        });
    }
}