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



const APIaddress = 'http://localhost:2090';


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
                alert(`User created as ${data.userName} with role: ${data.userRole.roleName}`);

                // redirect to login page

            })
            .catch(error => {
                alert('Something went wrong, try again')
            })
    });
};

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
                    console.log(data);
                    localStorage.setItem('accountInfo', JSON.stringify(data));

                    //  --- sendes til anden side når logget ind 
                    window.location.href = "./discoverIntro.html";
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

// // log out
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); // no refresh - else no redirect
        window.localStorage.removeItem('cn-authenticate-token');
        window.localStorage.removeItem('accountInfo');

        console.log('Account logged out yo');
        window.location.href = "/frontend/index.html";


        // loginDiv.classList.toggle('hidden');
        // logoutDiv.classList.toggle('hidden');
    });
}

// on page load for notes
window.addEventListener('load', (e) => {
    // const token = localStorage.getItem('cn-authenticate-token');

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
                // console.log(response);
                return response.json()
            })
            .then(data => {
                console.log(data);

                for (let i = 0; i < data.length; i++) {
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

    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json',

        }
    }
    if (token) fetchOptions.headers['cn-authenticate-token'] = token;


    // part to render notes
    if (ownNotes && token) {
        console.log(token);
        fetchOptions.method = 'GET';
        fetch(APIaddress + '/api/notes/user/', fetchOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    let htmlOutput = `
                    <article class="noteContent">
                        <p>${data[i].noteContent}</p>
                        <h4>${data[i].noteName}</h4>
                    </article>
                    `;

                    ownNotes.innerHTML += htmlOutput;
                    noAccess.classList.add("hidden");
                }

            })
            .catch(error => {
                console.log(error);
            });
    }
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
                return response.json()
            })
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    let htmlOutput = `
                        <option value="${data[i].categoryName}">${data[i].categoryName}</option>
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
                categoryName: categorySelect.value
            }
        }

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newNote)
        }

        fetch(APIaddress, fetchOptions)
            .then(response => response.json())
            .then(data => {
                // this is obviously here for the current VERY simple frontend interface...
                console.log(data)
            })
            .catch(error => {
                alert('Something went wrong, try again')
            })
    });
}