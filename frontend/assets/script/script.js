const userEmail = document.querySelector('#userEmail');
const userPassword = document.querySelector('#userPassword');
const loginBtn = document.querySelector('#loginButton');
const logoutBtn = document.querySelector('#logoutButton');
const outputDiv = document.querySelector('#outputDiv');


const APIaddress = 'http://localhost:2090';

// log in
if(loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        if(userEmail.value && userPassword.value) {
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
                console.log(token);
    
                return response.json();
            })
            .then(data => {
                console.log(data);
                localStorage.setItem('accountInfo', JSON.stringify(data));
    
                //  --- sendes til anden side når logget ind 
                window.location.href = "./discoverIntro.html";
            })
            .catch(error => {
                alert('There was an error. Wrong username or password.');
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

// on page load
window.addEventListener('load', (e) => {
    const token = localStorage.getItem('cn-authenticate-token');

    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json',

        }
    }
    if (token) fetchOptions.headers['cn-authenticate-token'] = token;
    console.log(fetchOptions.headers);

    // part to render notes
    if (outputDiv) {
        console.log(token);
        fetchOptions.method = 'GET';
        fetch(APIaddress + '/api/notes', fetchOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    let htmlOutput = `
                    <section class="category">
                        <h3>Notes on CSS</h3>
                        <a href="./discoverCategory.html">See more</a>
                    </section>
                    <article class="description">
                        <p>Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore </p>
                    </article>
                    <div class="notes">
                    <article id="noteContent">
                        <p>${data[i].noteContent}</p>
                        <h4>${data[i].noteName}</h4>
                    </article>
                    </div>
                    `;
    
                    outputDiv.innerHTML += htmlOutput;
                }
    
            })
            .catch(error => {
                console.log(error);
            });
    }


});