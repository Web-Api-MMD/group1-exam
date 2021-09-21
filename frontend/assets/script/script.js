const userEmail = document.querySelector('#userEmail');
const userPassword = document.querySelector('#userPassword');
const loginBtn = document.querySelector('#loginButton');
const logoutBtn = document.querySelector('#logoutButton');
const publicArticle = document.querySelector('#publicArticle');


const APIaddress = 'http://localhost:2090';

// log in
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
            const token = response.headers.get('x-authenticate-token');
            localStorage.setItem('x-authenticate-token', token); 
            console.log(token);

            return response.json();
        })
        .then(data => {
            console.log(data);
            localStorage.setItem('accountInfo', JSON.stringify(data));

            loginDiv.classList.toggle('hidden');
            logoutDiv.classList.toggle('hidden');
        })
        .catch(error => {
            alert('There was an error. Wrong username or password.');
        })

    } else {
        alert('Please enter user email and password');
    }

});

// log out
logoutBtn.addEventListener('click', (e) => {
    window.localStorage.removeItem('x-authenticate-token');
    window.localStorage.removeItem('accountInfo');

    console.log('Account logged out yo');

    loginDiv.classList.toggle('hidden');
    logoutDiv.classList.toggle('hidden');
});

// on page load
window.addEventListener('load', (e) => {
    const token = localStorage.getItem('x-authenticate-token');

    const fetchOptions = {
        headers: {
            'Content-Type': 'application/json',
            
        }
    }
    if(token) fetchOptions.headers['x-authenticate-token'] = token;
    console.log(fetchOptions.headers);

    // part to render public article
    fetchOptions.method = 'GET';
    fetch(APIaddress + '/api/notes', fetchOptions)
    .then(response => {
        return response.json()
    })
    .then(data => {
        publicArticle.innerHTML = data.message;
    })
    .catch(error => {
        console.log(error);
    });

});