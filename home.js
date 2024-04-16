window.onload = function () {
  var userEmail = getCookie("userEmail");
  if (userEmail) {
    // alert("Welcome back, " + userEmail + "!");
    renderUsageData(userEmail);
  } else {
    openModal();
    var userEmail = getCookie("userEmail");
    if (userEmail) {
      renderUsageData(userEmail);
    } else {
      renderUsageData("");
    }
  }
};
// Function to open modal
function openModal(prompt) {
  var modal = document.getElementById("emailForm");
  modal.style.display = "block";
}
// Function to close modal
function closeModal() {
  var modal = document.getElementById("emailForm");
  modal.style.display = "none";
}
function submitEmail(event) {
  event.preventDefault();
  var userEmail = document.getElementById("userEmail").value;
  if (validateEmail(userEmail)) {
    setCookie("userEmail", userEmail, 0.0083); // Expires in 3 days
    renderUsageData(userEmail);
    closeModal();
    alert("Email saved successfully!");
  } else {
    alert("Please enter a valid email address!");
  }
}
// Function to validate email format
function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}
// Function to get cookie
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
function checkForEmail(prompt) {
  var userEmail = getCookie("userEmail");
  if (!userEmail) {
    promptElement = document.getElementById("email-prompt");
    promptElement.innerText =
      "Please provide your email. You can't send request before submitting your email";
    promptElement.style.color = "red";
    openModal(prompt);
  }
  if (userEmail) {
    renderUsageData(userEmail);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form");
  const textInput = document.getElementById("textInput");
  const fileInput = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreviewBox");
  const outputText = document.getElementById("outputText");
  form.addEventListener("submit", handleSubmit);
  function handleSubmit(event) {
    event.preventDefault();
    checkForEmail();
    var userEmail = getCookie("userEmail");
    if (!userEmail) {
      return;
    }
    const text = textInput.value;
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("text", text);
    formData.append("file", file);
    formData.append("email", userEmail);

    var button = document.getElementById("questionSubmitButton");
    var submitButton = document.getElementById("questionSubmitButtonAction");
    submitButton.style.display = "none";
    var loadingIndicator = document.createElement("div");
    loadingIndicator.classList.add("loader");
    button.appendChild(loadingIndicator);

    fetch("https://image-processor-a44i.onrender.com/process", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.hasOwnProperty("error")) {
          outputText.innerText = data.error.message;
        } else {
          const html = data.choices[0].message.content;
          const newlineIndex = html.indexOf("\n");
          const innerContent = html.substring(
            newlineIndex + 1,
            html.length - 3
          );
          outputText.innerHTML = innerContent;
          button.removeChild(button.lastChild);
          submitButton.style.display = "block";
          renderUsageData(userEmail);
        }
      })
      .catch((error) => {
        button.removeChild(button.lastChild);
        submitButton.style.display = "block";
        console.error(error);
        outputText.innerHTML =
          "Please upload valid data. Some fields are missing";
      });
  }
  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      filePreview.innerHTML = "";
      const reader = new FileReader();
      reader.onload = function () {
        var preview = null;
        if (file.type.startsWith("image")) {
          preview = document.createElement("img");
        } else if (file.type.startsWith("video")) {
          preview = document.createElement("video");
          preview.controls = true;
        } else {
          alert("File type not supported.");
          return;
        }
        preview.src = reader.result;
        preview.style.textAlign = "center";
        preview.id = "preview-element";
        filePreview.appendChild(preview);
      };
      reader.readAsDataURL(file);
    }
  });
});
const dropbtn = document.querySelector("#videobtn");
const dropdownContent = document.querySelector("#video-content");
const dropbtnImage = document.querySelector("#imagebtn");
const dropdownContentImage = document.querySelector("#image-content");
let isOpen = false;
dropbtn.addEventListener("click", function () {
  isOpen = !isOpen;
  if (isOpen) {
    dropdownContent.style.display = "block";
    dropdownContentImage.style.display = "none";
    isOpenImage = false;
  } else {
    dropdownContent.style.display = "none";
  }
});
const dropdownContentLinks = dropdownContent.querySelectorAll("a");
dropdownContentLinks.forEach((link) => {
  link.addEventListener("click", function () {
    isOpen = false;
    dropdownContent.style.display = "none";
    const selectedText = this.textContent;
    document.getElementById("textInput").value = selectedText;
  });
});
let isOpenImage = false;
dropbtnImage.addEventListener("click", function () {
  isOpenImage = !isOpenImage;
  if (isOpenImage) {
    dropdownContentImage.style.display = "block";
    dropdownContent.style.display = "none";
    isOpen = false;
  } else {
    dropdownContentImage.style.display = "none";
  }
});
const dropdownContentImageLinks = dropdownContentImage.querySelectorAll("a");
dropdownContentImageLinks.forEach((link) => {
  link.addEventListener("click", function () {
    isOpenImage = false; // Close dropdown on any link click
    dropdownContentImage.style.display = "none";
    const selectedText = this.textContent;
    document.getElementById("textInput").value = selectedText;
  });
});
function renderUsageData(email) {
  var url =
    "https://image-processor-a44i.onrender.com/usage?email=" +
    encodeURIComponent(email);
  fetch(url, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    })
    .catch((error) => {
      console.error(error);
    });
}
function renderData(usageData) {
  var container = document.getElementById("usageDataWrapper");
  container.innerHTML = "";
  container.style.color = "white";
  // Loop through the usage data and create HTML elements
  console.log(usageData);
  if (usageData.length == 0) {
    var entry = document.createElement("div");
    entry.classList.add("usage");
    var noData = document.createElement("h3");
    noData.textContent = "No usage data found.";
    entry.appendChild(noData);
    var firstChild = container.firstChild;
    container.insertBefore(entry, firstChild);
    return;
  }
  usageData.forEach(function (data) {
    var entry = document.createElement("div");
    entry.classList.add("usage");

    var questionContainer = document.createElement("div");
    questionContainer.classList.add("question-container");

    var uploadedFileContainer = document.createElement("div");
    uploadedFileContainer.id = "uploadedFile";
    uploadedFileContainer.classList.add("uploaded-file");
    var videoPattern = /\/video\//i;
    var previewFile = null;
    if (videoPattern.test(data.fileUrl)) {
      previewFile = document.createElement("video");
      previewFile.controls = true;
    } else {
      previewFile = document.createElement("img");
      previewFile.alt = "File Preview";
    }
    previewFile.src = data.fileUrl;
    previewFile.classList.add("uploaded-file-content");
    uploadedFileContainer.appendChild(previewFile);

    var questionTextContainer = document.createElement("div");
    questionTextContainer.id = "questionText";
    questionTextContainer.textContent = data.questionText;

    questionContainer.appendChild(uploadedFileContainer);
    questionContainer.appendChild(questionTextContainer);

    var answerContainer = document.createElement("div");
    answerContainer.id = "answerText";
    answerContainer.classList.add("answer-container");
    const html = data.answerText;
    const newlineIndex = html.indexOf("\n");
    const innerContent = html.substring(newlineIndex + 1, html.length - 3);
    answerContainer.innerHTML = innerContent;

    entry.appendChild(questionContainer);
    entry.appendChild(answerContainer);
    var firstChild = container.firstChild;
    container.insertBefore(entry, firstChild);
  });
}
