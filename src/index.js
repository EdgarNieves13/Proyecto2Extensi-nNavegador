// form fields
const form = document.querySelector('.form-data');
const region = document.querySelector('.region-name');
const apiKey = document.querySelector('.api-key');

// results
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');
const usage = document.querySelector('.carbon-usage');
const fossilfuel = document.querySelector('.fossil-fuel');
const myregion = document.querySelector('.my-region');
const clearBtn = document.querySelector('.clear-btn');

// Step 4: Event listeners
form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', (e) => reset(e));
init();

// Step 6: Handle form submission
function handleSubmit(e) {
  e.preventDefault();
  setUpUser(apiKey.value, region.value);
}

// Step 7: Set up user data
function setUpUser(apiKey, regionName) {
  localStorage.setItem('apiKey', apiKey);
  localStorage.setItem('regionName', regionName);
  loading.style.display = 'block';
  errors.textContent = '';
  clearBtn.style.display = 'block';
  // make initial call
  displayCarbonUsage(apiKey, regionName);
}

// Step 8: Display carbon usage
async function displayCarbonUsage(apiKey, region) {
  try {
    await axios
      .get('https://api.co2signal.com/v1/latest', {
        params: {
          countryCode: region,
        },
        headers: {
          'auth-token': apiKey,
        },
      })
      .then((response) => {
        let CO2 = Math.floor(response.data.data.carbonIntensity);
        // calculateColor(CO2);
        loading.style.display = 'none';
        form.style.display = 'none';
        myregion.textContent = region;
        usage.textContent =
          Math.round(response.data.data.carbonIntensity) +
          ' grams (grams C02 emitted per kilowatt hour)';
        fossilfuel.textContent =
          response.data.data.fossilFuelPercentage.toFixed(2) +
          '% (percentage of fossil fuels used to generate electricity)';
        results.style.display = 'block';
      });
  } catch (error) {
    console.log(error);
    loading.style.display = 'none';
    results.style.display = 'none';
    errors.textContent =
      'Sorry, we have no data for the region you have requested.';
  }
}

// Step 12: Calculate color
function calculateColor(value) {
  let co2Scale = [0, 150, 600, 750, 800];
  let colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'];
  let closestNum = co2Scale.sort((a, b) => {
    return Math.abs(a - value) - Math.abs(b - value);
  })[0];
  console.log(value + ' is closest to ' + closestNum);
  let num = (element) => element > closestNum;
  let scaleIndex = co2Scale.findIndex(num);
  let closestColor = colors[scaleIndex];
  console.log(scaleIndex, closestColor);
  chrome.runtime.sendMessage({
    action: 'updateIcon',
    value: {
      color: closestColor,
    },
  });
}

// Step 10: Set default icon color
chrome.runtime.sendMessage({
  action: 'updateIcon',
  value: {
    color: 'green',
  },
});