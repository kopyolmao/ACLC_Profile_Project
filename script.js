// Fake live updating follower counter with random fluctuations and slot machine animation
const followerCountElement = document.getElementById("follower-count");

// Function to format the number with "K" for thousands
function formatNumber(number) {
    if (number >= 1000) {
        return (number / 1000).toFixed(1) + "K";
    }
    return number.toString();
}

// Function to simulate slot machine-like animation
function animateNumberChange(newNumber, element) {
    const duration = 500; // Animation duration in milliseconds
    const startNumber = parseFloat(element.textContent.replace("K", "")) * 1000 || 0;
    const range = newNumber - startNumber;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Ensure progress doesn't exceed 1
        const currentValue = startNumber + range * progress;

        // Update the displayed number
        element.textContent = formatNumber(Math.floor(currentValue));

        if (progress < 1) {
            requestAnimationFrame(updateNumber); // Continue the animation
        }
    }

    requestAnimationFrame(updateNumber); // Start the animation
}

// Function to simulate live follower count updates with random fluctuations
function updateFollowerCount() {
    let currentCount = 2300; // Starting count
    const minCount = 2200; // Minimum follower count
    const maxCount = 2400; // Maximum follower count
    const interval = 2000; // Update interval in milliseconds

    const intervalId = setInterval(() => {
        // Randomly decide if the count goes up or down
        const change = Math.random() < 0.5 ? -10 : 10; // Randomly add or subtract 10
        currentCount += change;

        // Ensure the count stays within the min and max range
        if (currentCount < minCount) currentCount = minCount;
        if (currentCount > maxCount) currentCount = maxCount;

        // Animate the number change
        animateNumberChange(currentCount, followerCountElement);
    }, interval);
}

// Start the fake live counter after a delay
setTimeout(updateFollowerCount, 2000); // Start after 2 seconds

// Prevent right-click and dragging on the profile picture
const profilePic = document.querySelector(".profile-pic");

profilePic.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Disable right-click menu
    alert("Right-click is disabled to protect the image.");
});

profilePic.addEventListener("dragstart", (e) => {
    e.preventDefault(); // Disable dragging
    alert("Dragging is disabled to protect the image.");
});