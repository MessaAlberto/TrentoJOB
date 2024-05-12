document.addEventListener('DOMContentLoaded', function () {
  const switchers = [...document.querySelectorAll('.switcher')]

  switchers.forEach(item => {
    item.addEventListener('click', function () {
      switchers.forEach(item => item.parentElement.classList.remove('is-active'))
      this.parentElement.classList.add('is-active')
      const bottomButton = document.querySelector('.bottom-button-list')
      bottomButton.classList.toggle('organisation');
    })
  })
});

function goBack() {
  window.location.href = "/index.html";
}

function goToLogin() {
  window.location.href = "/login.html";
}

function signUp() {
  var formData = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  // Make a new XMLHttpRequest
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/auth/register", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  // Manage the response
  xhr.onload = function () {
    if (xhr.status === 200) {
      window.location.href = "/login.html";
    } else {
      alert("An error occurred during registration.")
    }
  };

  console.log(JSON.stringify(formData));
  xhr.send(JSON.stringify(formData));
}