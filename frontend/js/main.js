function goBack() {
  if (window.location.pathname.includes("/pages/")) {
    window.location.href = "../index.html";
  } else {
    window.location.href = "index.html";
  }
}

function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (sidebar) sidebar.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
}

function uploadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    const profilePic = document.getElementById("profilePic");
    if (profilePic) {
      profilePic.src = reader.result;
      localStorage.setItem("profilePhoto", reader.result);
    }
  };

  reader.readAsDataURL(file);
}

function openProfile() {
  const modal = document.getElementById("profileModal");

  document.getElementById("profileName").value =
    localStorage.getItem("userName") || "";

  document.getElementById("profilePhone").value =
    localStorage.getItem("userPhone") || "";

  document.getElementById("profileEmail").value =
    localStorage.getItem("userEmail") || "";

  if (modal) modal.style.display = "block";
}

function closeProfile() {
  const modal = document.getElementById("profileModal");
  if (modal) modal.style.display = "none";
}

function saveProfile() {
  const name = document.getElementById("profileName").value.trim();
  const phone = document.getElementById("profilePhone").value.trim();
  const email = document.getElementById("profileEmail").value.trim();

  if (name === "" || phone === "" || email === "") {
    alert("Please fill all profile details");
    return;
  }

  localStorage.setItem("userName", name);
  localStorage.setItem("userPhone", phone);
  localStorage.setItem("userEmail", email);
  localStorage.setItem("isLoggedIn", "true");

  document.getElementById("userName").innerText = name;
  document.getElementById("userPhone").innerText = "📞 " + phone;
  document.getElementById("userEmail").innerText = "✉ " + email;

  alert("Profile saved successfully");
  closeProfile();
}

function openLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "block";
}

function closeLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "none";
}

function loginUser() {
  const name = document.getElementById("loginName").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (name === "" || password === "") {
    alert("Please enter name and password");
    return;
  }

  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userName", name);

  document.getElementById("userName").innerText = name;

  alert("Login successful");
  closeLogin();
}

function logoutUser() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userName");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("profilePhoto");

  document.getElementById("userName").innerText = "Guest User";
  document.getElementById("userPhone").innerText = "📞 Not added";
  document.getElementById("userEmail").innerText = "✉ Not added";

  const profilePic = document.getElementById("profilePic");
  if (profilePic) {
    profilePic.src = "https://via.placeholder.com/100";
  }

  alert("Logged out");
}

function loadProfile() {
  const name = localStorage.getItem("userName");
  const phone = localStorage.getItem("userPhone");
  const email = localStorage.getItem("userEmail");
  const photo = localStorage.getItem("profilePhoto");

  if (name && document.getElementById("userName")) {
    document.getElementById("userName").innerText = name;
  }

  if (phone && document.getElementById("userPhone")) {
    document.getElementById("userPhone").innerText = "📞 " + phone;
  }

  if (email && document.getElementById("userEmail")) {
    document.getElementById("userEmail").innerText = "✉ " + email;
  }

  if (photo && document.getElementById("profilePic")) {
    document.getElementById("profilePic").src = photo;
  }
}

function changeContactPhoto(imgElement) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = function () {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
      imgElement.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  input.click();
}

// ================= LIVE ENERGY DASHBOARD =================

async function fetchData() {
  try {
    const res = await fetch("http://10.0.0.10:3000/data");
    const data = await res.json();

    if (document.getElementById("voltage")) {
      document.getElementById("voltage").innerText =
        Number(data.voltage).toFixed(2) + " V";
    }

    if (document.getElementById("power")) {
      document.getElementById("power").innerText =
        Number(data.power).toFixed(2) + " W";
    }

    if (document.getElementById("current")) {
      document.getElementById("current").innerText =
        Number(data.current).toFixed(2) + " A";
    }

    if (document.getElementById("energy")) {
      document.getElementById("energy").innerText =
        Number(data.energy).toFixed(6) + " kWh";
    }

    if (document.getElementById("prediction")) {
      document.getElementById("prediction").innerText =
        "Rs " + Number(data.predictedCost).toFixed(0);
    }
  } catch (error) {
    console.log("Error fetching data:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadProfile();

  fetchData();
  setInterval(fetchData, 2000);
});
