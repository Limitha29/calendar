document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const addEventBtn = document.getElementById("add-event-btn");
  const addEventContainer = document.getElementById("add-event-container");

  // Populate day dropdown based on selected month
  monthSelect.addEventListener("change", () => {
    const month = parseInt(monthSelect.value);
    daySelect.innerHTML = '<option value="">--Select Day--</option>';

    if (!month) return;

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
    const resultDiv = document.getElementById("result");

    resultDiv.textContent = "Loading...";

    try {
      const response = await fetch("http://127.0.0.1:3000/get-day-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ day, month })
      });

      const data = await response.json();

      if (!response.ok) {
        resultDiv.textContent = data.error || "Unknown error";
        return;
      }

      let output = `Date: ${data.date} <br> Day: <b>${data.weekday}</b>`;
      if (data.events && data.events.length > 0) {
        output += `<br>🎉 Holidays/Events:<div style="text-align: left; margin-top: 8px;">`;
        data.events.forEach(event => {
          const descPart = event.description
            ? `<div style="margin-left: 20px; margin-top: 2px; font-size: 0.9em;"><i>${event.description}</i></div>`
            : "";
          output += `
            <div style="margin-bottom: 6px; display: flex; align-items: flex-start;">
              <div style="font-weight: bold; margin-right: 6px;">•</div>
              <div>
                <div><b>${event.name}</b></div>
                ${descPart}
              </div>
            </div>`;
        });
        output += `</div>`;
      } else {
        output += `<br>No national holiday on this day.`;
      }

      resultDiv.innerHTML = output;
    } catch (err) {
      resultDiv.textContent = "Error connecting to server.";
      console.error("❌ Fetch error:", err);
    }
  });

  // Add Event Button click logic
  addEventBtn.addEventListener("click", async () => {
    const name = prompt("Enter event/holiday name:");
    if (!name) return;

    const type = prompt("Enter event type (e.g., Festival, International):") || "General";
    const description = prompt("Optional description:") || "";

    const day = daySelect.value;
    const month = monthSelect.value;
    const dateStr = `2026-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    const newEvent = [{
      date: dateStr,
      name,
      type,
      description
    }];

    try {
      const response = await fetch("http://127.0.0.1:3000/add-holidays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
