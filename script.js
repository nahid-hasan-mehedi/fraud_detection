// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Basic fraud detection thresholds
    const MAX_TRANSACTION_AMOUNT = 5000; // Example threshold

    // Fetch valid cities from GeoDB Cities API
    async function isValidCity(city) {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'c7d83dbe03msh75140758721c5d0p1ab93ejsnf1275ef35e42',  //  API key
                'X-RapidAPI-Host': 'city-by-api-ninjas.p.rapidapi.com'  //API host
            }
        };

        try {
            const usresponse = await fetch(`https://city-by-api-ninjas.p.rapidapi.com/v1/city?name=${city}&country=US&limit=1`, options);
            const caresponse = await fetch(`https://city-by-api-ninjas.p.rapidapi.com/v1/city?name=${city}&country=CA&limit=1`, options);
            if (!usresponse.ok || !caresponse.ok) {
                throw new Error(`API call failed with status ${usresponse.status} , ${caresponse.status}`);
            }
            const data1 = await usresponse.json();
            const data2 = await caresponse.json();
            const data = data1.concat(data2);

            const cities = data.map(e => e.name);

            return cities.length > 0;
        } catch (error) {
            console.error('Error fetching cities:', error);
            return [];
        }
    }

    // Event listener for form submission
    document.getElementById('payment-form').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent page reload

        const cardNumber = document.getElementById('card-number').value;
        const transactionAmount = parseFloat(document.getElementById('transaction-amount').value);
        let location = document.getElementById('location').value;
        const resultElement = document.getElementById('result');
        let resultMessage = "Transaction is Safe.";

        // Normalize the user's input for location (to match fetched cities)
        location = location.toLowerCase().trim();

        // Get valid cities from the API dynamically
        const validCity = await isValidCity(location);
        console.log("Valid City", location, validCity)

        // Run fraud checks
        if (!luhnCheck(cardNumber)) {
            resultMessage = "Fraud Detected: Invalid Card Number.";
        } else if (transactionAmount > MAX_TRANSACTION_AMOUNT) {
            resultMessage = "Fraud Detected: Transaction Amount Too High.";
        } else if (!validCity) {
            resultMessage = "Fraud Detected: Location is Suspicious.";
        }

        // Display result
        resultElement.textContent = resultMessage;
        console.log('Result:', resultMessage); // Debugging: log the result message
    });

    console.log("DOM fully loaded and script executed");

    // Luhn Algorithm to validate card number
    function luhnCheck(cardNumber) {
        let sum = 0;
        let shouldDouble = false;

        // Remove any spaces or non-numeric characters from the input
        const sanitizedNumber = cardNumber.replace(/\D/g, '');  // Keep only digits

        // Loop through the sanitized card number digits from right to left
        for (let i = sanitizedNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitizedNumber[i], 10);  // Convert the character to an integer

            // Double every second digit
            if (shouldDouble) {
                digit *= 2;
                // If doubling the digit results in a number greater than 9, subtract 9
                if (digit > 9) {
                    digit -= 9;
                }
            }

            // Add the digit to the sum
            sum += digit;

            // Toggle whether to double the next digit or not
            shouldDouble = !shouldDouble;
        }

        // If the sum is divisible by 10, the card number is valid
        return sum % 10 === 0;
    }
});
