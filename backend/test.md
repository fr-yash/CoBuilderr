```javascript
// Function to check if a number is prime
/**
* Checks if a given number is a prime number.
*
* @param {number} num The number to check. Must be an integer greater than 1.
* @returns {boolean} True if the number is prime, false otherwise. Returns false for invalid input.
* @throws {Error} If input is not a valid integer greater than 1.
*/
function isPrime(num) {
// Error handling for invalid input
if (!Number.isInteger(num) || num <= 1) { throw new Error("Invalid input: Number must be an integer greater than 1."); }
    // Optimization: 2 is the only even prime number if (num <=3) { return num> 1;
    }

    // Optimization: Check divisibility only by 6k ± 1
    if (num % 2 === 0 || num % 3 === 0) {
    return false;
    }

    // Optimized primality test: Check divisibility only up to the square root of num
    for (let i = 5; i * i <= num; i +=6) { if (num % i===0 || num % (i + 2)===0) { return false; } } return true; } //
        Example usage with error handling: const numbersToCheck=[2, 3, 4, 5, 10, 17, 25, 101, -5, 1, 0, 2.5, 'abc' ];
        numbersToCheck.forEach(num=> {
        try {
        const isNumPrime = isPrime(num);
        console.log(`${num} is prime: ${isNumPrime}`);
        } catch (error) {
        console.error(`Error checking ${num}: ${error.message}`);
        }
        });


        //Further improvements could include:
        //1. Asynchronous operation for very large numbers to prevent blocking the main thread.
        //2. Memoization to cache previously checked prime numbers for faster subsequent checks.
        //3. Probabilistic primality tests (like Miller-Rabin) for extremely large numbers where deterministic tests
        become computationally expensive.

        ```