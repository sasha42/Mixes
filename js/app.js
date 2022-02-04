export default class DomApp {
  constructor() {
    console.log("App started");

    // Get the mix URL from parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const mixUrl = urlParams.get("q");

    if (mixUrl !== null && mixUrl !== "") {
      // Make a request to Firebase if URL is present
      console.log(`Got URL ${mixUrl}`);
      this.submitUrl(mixUrl);
    } else {
      console.log("No URL specified");
      this.updatePage("❌ No URL specified");
    }
  }

  submitUrl(url) {
    // Create the URL
    const baseUrl = "https://b4cr11wfgd.execute-api.us-east-1.amazonaws.com/default/mixes-testing?q=";
    const fullUrl = baseUrl + url;

    // Send the URL to the Firebase function
    const result = fetch(fullUrl, {
      method: "GET",
    })
      .then((res) => {
        status = res.status;
        return res.json();
      })
      .then((jsonResponse) => {
        //.then((response) => response.json())
        //.then((data) => {
        console.log(jsonResponse);
        if (status != 200) {
          console.log("❌ FAIL");
          console.log(status);
          this.updatePage(`❌ Function returned ${status}`);
        } else {
          console.log("✅ SAVED");
          this.updatePage("✅ Saved");
        }
      })
      .catch((error) => {
        console.log("❌ FAIL");
        console.log(error);
        this.updatePage("❌ Function failed");
      });
  }

  updatePage(state) {
    // Hide spinning loader element
    let loader = document.getElementById("loader");
    loader.classList.add("fadeAway");

    // Wait for animation to be done
    setTimeout(function () {
      // Remove spinning loader element
      loader.style.display = "none";

      // Show confirmation box
      let container = document.getElementById("app");
      container.style.display = "block";

      // Show result text
      let resultText = document.getElementById("resultText");
      resultText.innerHTML = state;
    }, 200);
  }
}

window.onload = () => {
  new DomApp();
};
