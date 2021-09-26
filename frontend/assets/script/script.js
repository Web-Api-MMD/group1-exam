const userEmail = document.querySelector('#userEmail');
const userPassword = document.querySelector('#userPassword');
const loginBtn = document.querySelector('#loginButton');
const logoutBtn = document.querySelector('#logoutButton');
const signupBtn = document.querySelector('#signupButton');
const addNote = document.querySelector('#submitButton');
const outputDiv = document.querySelector('#outputDiv');
const noAccess = document.querySelector('#noAccess');
const categorySelect = document.querySelector('#categories');
const ownNotes = document.querySelector('#ownNotes');
const loggedInNav = document.querySelector('#navLoggedIn');
const loggedOutNav = document.querySelector('#navLoggedOut');
const noteName = document.querySelector('#noteName');
const noteContent = document.querySelector('#newNoteContent');
const newNoteOutput = document.querySelector('#newNote');
const closeModal = document.getElementsByClassName("close")[0];
const noNotes = document.querySelector('#noNotes');
const hasNotes = document.querySelector('#hasNotes');

const APIaddress = 'http://localhost:2090';

// const token = localStorage.getItem('cn-authenticate-token');


//nav based on log in or not
window.addEventListener('load', (e) => {
    const token = localStorage.getItem('cn-authenticate-token');

    if (token) {
        console.log('vi har fandeme en token vennerne og den er: ' + token);

        loggedInNav.classList.remove("hidden");
        loggedOutNav.classList.add("hidden");
    }
});


//sign up 
if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = {
            userName: userName.value,
            userEmail: userEmail.value,
            userPassword: userPassword.value
        }

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        }
        console.log(user)

        fetch(APIaddress + '/api/accounts/', fetchOptions)
            .then(response => response.json())
            .then(data => {
                // console.log(data)
                alert(`User created as ${data.userName} with role: ${data.userRole.roleName} <br> Now, please log in and start writing notes`);

                // redirect to login page

            })
            .catch(error => {
                alert('Something went wrong, try again')
            })
    });
};


let accountInfo;
// log in
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        if (userEmail.value && userPassword.value) {
            const payload = {
                userEmail: userEmail.value,
                userPassword: userPassword.value
            }

            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }

            fetch(APIaddress + '/api/accounts/login', fetchOptions)
                .then(response => {
                    const token = response.headers.get('cn-authenticate-token');
                    localStorage.setItem('cn-authenticate-token', token);
                    console.log(response);

                    return response.json();
                })
                .then(data => {
                    // localStorage.setItem('accountInfo', JSON.stringify(data));
                    localStorage.setItem('accountInfo', JSON.stringify(data)); // stringify else it only output [object] Object
                    const accountInfo = localStorage.getItem('accountInfo');
                    console.log(accountInfo);

                    // console.log(accountInfo);

                    console.log(accountInfo);
                    //  --- sendes til anden side når logget ind 
                    window.location.href = "./discoverIntro.html"; // udkommentér senere
                })
                .catch(error => {
                    console.log(error);
                    alert('Wrong username or password. Please try again');
                })

        } else {
            alert('Please enter user email and password');
        }

    });
}

// log out
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); // no refresh - else no redirect
        window.localStorage.removeItem('cn-authenticate-token');
        window.localStorage.removeItem('accountInfo');

        console.log('Account logged out yo');
        window.location.href = "/frontend/index.html";
    });
}

// on page load for notes overview
window.addEventListener('load', (e) => {
    const token = localStorage.getItem('cn-authenticate-token');

    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json',

        }
    }
    if (token) fetchOptions.headers['cn-authenticate-token'] = token;
    // console.log(fetchOptions.headers);

    // part to render notes
    if (outputDiv && token) {
        console.log(token);
        fetchOptions.method = 'GET';
        fetch(APIaddress + '/api/notes/', fetchOptions)
            .then(response => {
                //console.log(response);
                return response.json()
            })
            .then(data => {
                // console.log(data);
                console.log(accountInfo);
                for (let i = 0; i < 8; i++) { // i < data.length
                    let htmlOutput = `
                    <section class="category">
                        <h3>Notes on ${data[i].noteCategory.categoryName}</h3>
                        <a href="./discoverCategory.html">See more</a>
                    </section>
                    <article class="description">
                        <p>Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore </p>
                    </article>
                    <div class="notes">
                    <article class="noteContent">
                        <p>${data[i].noteContent}</p>
                        <h4>${data[i].noteName}</h4>
                    </article>
                    </div>
                    `;

                    outputDiv.innerHTML += htmlOutput;
                    noAccess.classList.add("hidden");
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
});

//render notes by userID
window.addEventListener('load', (e) => {
    const token = localStorage.getItem('cn-authenticate-token');
    const accountInfo = localStorage.getItem('accountInfo');
    console.log(JSON.stringify(accountInfo));

    accountInfoObj = JSON.parse(accountInfo); // convert accountInfo from string to object
    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json',

        },
    }
    if (token) fetchOptions.headers['cn-authenticate-token'] = token;

    // part to render notes

    if (ownNotes && token) {
        console.log(JSON.stringify(accountInfo));
        const loggedInID = accountInfoObj.userID;

        fetchOptions.method = 'GET';
        fetch(APIaddress + '/api/notes/user/' + loggedInID, fetchOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    const currentNoteID = data[i].noteID;
                    console.log(currentNoteID);
                    let htmlOutput = `
                    <article class="noteContent">
                        <h4>${data[i].noteName}</h4>
                        <p>${data[i].noteContent}</p>
                    </article>
                    `;
                    hasNotes.innerHTML += htmlOutput;
                }
                noNotes.classList.add('hidden');
                })
            .catch(error => {
                console.log(error);
            });
    };
});



// add note to database
if (addNote) {
    const token = localStorage.getItem('cn-authenticate-token');

    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    }
    if (token) fetchOptions.headers['cn-authenticate-token'] = token;

    if (token) {
        console.log(token);
        fetchOptions.method = 'GET';
        fetch(APIaddress + '/api/categories/', fetchOptions)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data[0].categoryID);
                console.log(data[0].categoryName);
                for (let i = 0; i < data.length; i++) {
                    let htmlOutput = `
                        <option value="${data[i].categoryID}">${data[i].categoryName}</option>
                    `;

                    categorySelect.innerHTML += htmlOutput;
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    addNote.addEventListener('click', (e) => {
        e.preventDefault();
        const newNote = {
            noteName: noteName.value,
            noteContent: noteContent.value,
            noteCategory: {
                categoryID: categorySelect.value
            },
            noteAuthor: 5
        }

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newNote)
            // body: newNote
        }
        console.log(JSON.stringify(newNote));
        console.log(APIaddress);


        fetch(APIaddress + '/api/notes/', fetchOptions)
            .then(response => response.json())
            .then(data => {
                const newNoteModal = `
                    <div class="modal-content">
                        <h2>You added a note:</h2>
                        <h3>${data.noteName}</h3>
                        <span>${data.noteCategory.categoryName}</span>
                        <p>${data.noteContent}</p>
                        <br>
                        <p>Click anywhere to add another note</p>
                    </div>
                `;
                newNoteOutput.innerHTML += newNoteModal;
                newNoteOutput.style.display = "block";

                window.onclick = function (event) {
                    if (event.target == newNoteOutput) {
                        newNoteOutput.style.display = "none";

                        //reload page
                        location.reload();
                        return false;
                    }
                };

                console.log(data);
            })
            .catch(error => {
                console.log(error);
                console.log(JSON.stringify(error));
                alert('Something went wrong, try again')
            })
    });
}