webspace = localStorage.getItem("webspace");
spacepass = localStorage.getItem("spacepass");

logged = false;

const firebaseConfig = {
    apiKey: "AIzaSyDKW9C2RP0tOdcyeOBmsZRii5nzzqBFeow",
    authDomain: "hexspaces.firebaseapp.com",
    databaseURL: "https://hexspaces-default-rtdb.firebaseio.com",
    projectId: "hexspaces",
    storageBucket: "hexspaces.firebasestorage.app",
    messagingSenderId: "898528888809",
    appId: "1:898528888809:web:ff6e271bdefb7589276d78"
};
firebase.initializeApp(firebaseConfig);

function logSpace() {
    spaceinput = document.getElementById("space-code").value;
    passwordinput = document.getElementById("space-pass").value;
    if (spaceinput != "" && passwordinput != "") {
        var spaceref = firebase.database().ref(spaceinput + "/status");
        var passref = firebase.database().ref(spaceinput + "/password");
        var isSpaceCreated;
        var isJoining = false;
        spaceref.on("value", data => {
            isSpaceCreated = data.val();
            if (!isJoining) {
                isJoining = true;
                if (isSpaceCreated == "created") {
                    passref.on("value", data => {
                        canPass = data.val();
                        if (canPass == passwordinput) {
                            localStorage.setItem("webspace", spaceinput);
                            localStorage.setItem("spacepass", passwordinput);
                            window.location = "index.html";
                        } else {
                            document.getElementById("login-error").innerHTML = "Incorrect Password";
                            document.getElementById("space-pass").style.borderColor = "red";
                        }
                    })
                } else {
                    document.getElementById("login-error").innerHTML = "Incorrect Space-Code";
                    document.getElementById("space-code").style.borderColor = "red";
                }
            }
        });
    } else {
        document.getElementById("login-error").innerHTML = "All the inputs need a value";
        document.getElementById("space-code").style.borderColor = "yellow";
        document.getElementById("space-pass").style.borderColor = "yellow";
    }
}

function createSpace() {
    spaceinput = document.getElementById("space-code").value;
    passwordinput = document.getElementById("space-pass").value;
    if (spaceinput != "" && passwordinput != "") {
        var spaceref = firebase.database().ref(spaceinput + "/status");
        var isSpaceCreated;
        var isJoining = false;
        spaceref.on("value", data => {
            isSpaceCreated = data.val();
            if (!isJoining) {
                isJoining = true;
                if (isSpaceCreated == null) {
                    firebase.database().ref("/").child(spaceinput).update({
                        password: passwordinput,
                        status: "created",
                        grid:[
                            "","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""
                        ]
                    });
                    window.location = "log.html";
                } else {
                    document.getElementById("login-error").innerHTML = "This space already exists";
                    document.getElementById("space-code").style.borderColor = "red";
                }
            }
        });
    } else {
        document.getElementById("login-error").innerHTML = "All the inputs need a value";
        document.getElementById("space-code").style.borderColor = "yellow";
        document.getElementById("space-pass").style.borderColor = "yellow";
    }
}

function loadWebspaceData() {
    if (webspace != undefined && spacepass != undefined) {
        var spaceref = firebase.database().ref(webspace + "/status");
        var passref = firebase.database().ref(webspace + "/password");
        var isSpaceCreated;
        var isJoining = false;
        spaceref.on("value", data => {
            isSpaceCreated = data.val();
            if (!isJoining) {
                isJoining = true;
                if (isSpaceCreated == "created") {
                    passref.on("value", data => {
                        canPass = data.val();
                        if (canPass == spacepass) {
                            logged = true;
                            loadWebSpace();
                            document.getElementById("space-name").innerHTML = webspace;
                            console.log("logged: " + logged);
                        } else {
                            window.location = "log.html";
                        }
                    })
                } else {
                    window.location = "log.html";
                }
            }
        });
    } else {
        window.location = "log.html";
    }
    console.log("logged: " + logged);
}

function logout(){
    localStorage.removeItem("webspace");
    localStorage.removeItem("spacepass");
    window.location = "log.html";
}