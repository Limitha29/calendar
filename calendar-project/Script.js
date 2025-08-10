document.addEventListener("DOMContentLoaded", () => {
    const monthSelect = document.getElementById("month");
    const daySelect = document.getElementById("day");
    const addEventBtn = document.getElementById("add-event-btn");
    const addEventContainer = document.getElementById("add-event-container");
    const resultDiv = document.getElementById("result");
    const animationBg = document.getElementById("animation-bg");

    // --- Animation Functions ---
    
    function clearAnimations() {
        animationBg.innerHTML = '';
    }

    function createSnowfall() {
        clearAnimations();
        for (let i = 0; i < 150; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            const size = Math.random() * 4 + 2; // size between 2px and 6px
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${Math.random() * 100}%`;
            snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`; // duration between 5s and 10s
            snowflake.style.animationDelay = `${Math.random() * 5}s`;
            animationBg.appendChild(snowflake);
        }
    }

    function createFireworks() {
        clearAnimations();
        const colors = ['#ffc75f', '#ff80ed', '#4361ee', '#70e000', '#f9c74f'];
        for (let i = 0; i < 25; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = `${Math.random() * 100}%`;
            firework.style.top = `${Math.random() * 50 + 50}%`; // Start from bottom half
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Stagger the launch
            setTimeout(() => {
                animationBg.appendChild(firework);
                // After launch, trigger explosion
                setTimeout(() => firework.classList.add('explode'), 1000);
            }, Math.random() * 2000); // launch over 2 seconds
        }
    }

    function handleHolidayAnimations(events = []) {
        clearAnimations(); // Clear any previous animations first
        if (!events || events.length === 0) return;

        const eventName = events[0].name.toLowerCase();

        if (eventName.includes('christmas')) {
            createSnowfall();
        } else if (eventName.includes('new year')) {
            createFireworks();
        }
        // You can add more holidays here, e.g.,
        // else if (eventName.includes('diwali')) { createDiyaAnimation(); }
    }

    // --- Core Logic (with animation hooks) ---

    // Populate day dropdown based on selected month
    monthSelect.addEventListener("change", () => {
        const month = parseInt(monthSelect.value);
        daySelect.innerHTML = '<option value="">-- Select Day --</option>';

        if (!month) {
            updateAddEventVisibility();
            return;
        }

        const daysInMonth = new Date(2026, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }

        updateAddEventVisibility();
    });

    // Show/hide Add Event button based on selection
    function updateAddEventVisibility() {
        const month = monthSelect.value;
        const day = daySelect.value;
        if (month && day) {
            addEventContainer.style.display = "block";
        } else {
            addEventContainer.style.display = "none";
        }
    }

    daySelect.addEventListener("change", updateAddEventVisibility);

    // Handle form submission to fetch weekday and event
    document.getElementById("date").addEventListener("submit", async (e) => {
        e.preventDefault();

        const month = Number(monthSelect.value);
        const day = Number(daySelect.value);

        resultDiv.textContent = "Loading...";
        resultDiv.classList.remove("error");
        clearAnimations(); // Clear animations on new search

        try {
            const response = await fetch("http://127.0.0.1:3000/get-day-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ day, month })
            });

            const data = await response.json();

            if (!response.ok) {
                resultDiv.textContent = data.error || "Unknown error";
                resultDiv.classList.add("error");
                return;
            }
            
            // --- Trigger Animation ---
            handleHolidayAnimations(data.events);

            let output = `<p>Date: ${data.date}</p> <p>Day: <b>${data.weekday}</b></p>`;
            if (data.events && data.events.length > 0) {
                output += `<p class="event-heading">🎉 Holidays/Events:</p><div class="events-list">`;
                data.events.forEach(event => {
                    const descPart = event.description ? `<div class="event-description"><i>${event.description}</i></div>` : "";
                    output += `
                    <div class="event-item">
                        <div class="event-name"><b>• ${event.name}</b></div>
                        ${descPart}
                    </div>`;
                });
                output += `</div>`;
            } else {
                output += `<p>No national holiday on this day.</p>`;
            }

            resultDiv.innerHTML = output;

        } catch (err) {
            resultDiv.textContent = "Error connecting to server.";
            resultDiv.classList.add("error");
            console.error("❌ Fetch error:", err);
        }
    });

    // Add Event Button click logic (no changes here)
    addEventBtn.addEventListener("click", async () => {
        const name = prompt("Enter event/holiday name:");
        if (!name) return;
        const type = prompt("Enter event type (e.g., Festival, International):") || "General";
        const description = prompt("Optional description:") || "";
        const day = daySelect.value;
        const month = monthSelect.value;
        const dateStr = `2026-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const newEvent = [{ date: dateStr, name, type, description }];
        try {
            const response = await fetch("http://127.0.0.1:3000/add-holidays", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEvent)
            });
            const data = await response.json();
            if (!response.ok) {
                alert("❌ " + (data.error || "Error adding event"));
            } else {
                alert("✅ Event added successfully!");
            }
        } catch (err) {
            console.error("❌ Error adding event:", err);
            alert("❌ Error connecting to server.");
        }
    });
});