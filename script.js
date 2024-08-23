// Helper function to parse date
function parseDate(dateStr) {
  return new Date(dateStr);
}

function formatNumber(num) {
  // Ensure num is a number
  if (typeof num !== "number") {
    num = parseFloat(num);
  }

  // Convert the number to a string with two decimal places
  const formattedNumber = num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formattedNumber;
}

// Add transaction row in the form
// Initialize Flatpickr on the date inputs
flatpickr("#start_date", {
  dateFormat: "d M Y",
  onChange: function (selectedDates, dateStr, instance) {
    instance.close();
  },
});

flatpickr("#end_date", {
  dateFormat: "d M Y",
  onChange: function (selectedDates, dateStr, instance) {
    instance.close();
  },
});

// Initialize Flatpickr for dynamic transaction dates
document.getElementById("add_transaction_btn").addEventListener("click", () => {
  const container = document.getElementById("transactions_container");
  const index = container.children.length + 1;

  const transactionHTML = `
      <div class="transaction-section" style="position: relative;">
          <span class="delete-icon"></span> <!-- Delete icon added here -->
          <label for="transaction_type_${index}">Transaction Type:</label>
          <select id="transaction_type_${index}">
              <option value="">--Select--</option>
              <option value="Payment">Payment</option>
              <option value="Lend">Lend</option>
          </select>
          
          <label for="transaction_date_${index}">Transaction Date:</label>
          <input type="date" id="transaction_date_${index}">
          
          <label for="transaction_amount_${index}">Amount (Rs.):</label>
          <input type="number" id="transaction_amount_${index}" step="0.01">
      </div>
  `;

  container.insertAdjacentHTML("beforeend", transactionHTML);

  flatpickr(`#transaction_date_${index}`, {
    dateFormat: "d M Y",
    onChange: function (selectedDates, dateStr, instance) {
      instance.close();
    },
  });

  // Add event listener to the delete icon
  container.lastElementChild
    .querySelector(".delete-icon")
    .addEventListener("click", function () {
      this.parentElement.remove(); // Remove the transaction box
      recalculate(); // Recalculate after removal (if needed)
    });
});

// Calculate interest and update the table
document.getElementById("calculate_btn").addEventListener("click", () => {
  const borrowerName = document.getElementById("borrower_name").value;

  // Validation for borrower name
  if (!borrowerName.trim()) {
    alert("Please enter the borrower's name.");
    return;
  }

  const startDateInput = document.getElementById("start_date").value;
  const endDateInput = document.getElementById("end_date").value;
  const initialPrincipalInput =
    document.getElementById("initial_principal").value;
  const annualInterestRateInput =
    document.getElementById("interest_rate").value;

  const startDate = parseDate(startDateInput);
  const endDate = parseDate(endDateInput);
  const initialPrincipal = parseFloat(initialPrincipalInput);
  const annualInterestRate = parseFloat(annualInterestRateInput) / 100;

  // Validation for the first section
  if (startDate > endDate) {
    alert("Please ensure the Start Date is before the End Date.");
    return;
  }

  if (!startDateInput || isNaN(Date.parse(startDateInput))) {
    alert("Please enter a valid Start Date.");
    return;
  }

  if (!endDateInput || isNaN(Date.parse(endDateInput))) {
    alert("Please enter a valid End Date.");
    return;
  }

  if (isNaN(initialPrincipal) || initialPrincipal <= 0) {
    alert("Please enter a valid amount for the Initial Principal.");
    return;
  }

  if (isNaN(annualInterestRate) || annualInterestRate < 0) {
    alert("Please enter a valid percentage for the Annual Interest Rate.");
    return;
  }

  let transactions = [];
  const container = document.getElementById("transactions_container");
  for (let i = 0; i < container.children.length; i++) {
    const transactionType = document.getElementById(
      `transaction_type_${i + 1}`
    ).value;
    const transactionDateInput = document.getElementById(
      `transaction_date_${i + 1}`
    ).value;
    const transactionAmountInput = document.getElementById(
      `transaction_amount_${i + 1}`
    ).value;

    if (!transactionType && !transactionDateInput && !transactionAmountInput) {
      continue; // Skip empty transaction boxes
    }

    // if (
    //   (transactionType && (!transactionDateInput || !transactionAmountInput)) ||
    //   (transactionDateInput && (!transactionType || !transactionAmountInput)) ||
    //   (transactionAmountInput && (!transactionType || !transactionDateInput))
    // ) {
    //   alert(`Please fully complete or remove transaction ${i + 1}.`);
    //   return;
    // }

    const transactionDate = parseDate(transactionDateInput);
    const transactionAmount = parseFloat(transactionAmountInput);

    // Validation for each transaction
    // Transaction date validation
    if (transactionDate > endDate || transactionDate < startDate) {
      alert(
        "Please ensure the Transaction Date is within the Start and End Date range."
      );
      return;
    }

    if (!transactionDateInput || isNaN(Date.parse(transactionDateInput))) {
      alert(`Please enter a valid Transaction Date for transaction ${i + 1}.`);
      return;
    }

    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      alert(`Please enter a valid amount for transaction ${i + 1}.`);
      return;
    }

    if (transactionType === "--select--") {
      alert(
        "Please select whether the borrower made a payment or you lent additional funds."
      );
      return;
    }

    transactions.push([transactionDate, transactionAmount, transactionType]);
  }

  // Proceed with the calculation if all inputs are valid
  const resultData = calculateInterest(
    startDate,
    endDate,
    initialPrincipal,
    annualInterestRate,
    transactions
  );
  displayResult(
    resultData,
    (annualInterestRate * 100).toFixed(2),
    borrowerName
  );
});

function calculateInterest(
  startDate,
  endDate,
  initialPrincipal,
  annualInterestRate,
  transactions
) {
  let data = [];
  let principal = initialPrincipal;

  // Initial entry
  data.push({
    date: startDate
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .replace(",", ""),
    debit: formatNumber(principal), // Use formatNumber function here
    credit: formatNumber(0), // Ensure 2 decimal places
    days: 0,
    interest: formatNumber(0), // Ensure 2 decimal places
    balance: formatNumber(principal), // Use formatNumber function here
  });

  let currentDate = startDate;

  // Sort transactions by date
  transactions.sort((a, b) => a[0] - b[0]);

  while (currentDate < endDate) {
    let nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 365);
    let transaction = null;

    if (transactions.length > 0 && transactions[0][0] < nextDate) {
      transaction = transactions.shift();
      nextDate = transaction[0];
    }

    if (nextDate > endDate) {
      nextDate = endDate;
    }

    const days = (nextDate - currentDate) / (1000 * 60 * 60 * 24);
    const interest = (principal * annualInterestRate * days) / 365;
    let balanceAfterInterest = principal + interest;

    let credit = formatNumber(0);
    let debit = formatNumber(0);

    if (transaction) {
      const [transactionDate, transactionAmount, transactionType] = transaction;
      if (transactionType === "Payment") {
        principal = balanceAfterInterest - transactionAmount;
        credit = formatNumber(transactionAmount); // Use formatNumber function here
      } else if (transactionType === "Lend") {
        principal = balanceAfterInterest + transactionAmount;
        debit = formatNumber(transactionAmount); // Use formatNumber function here
      }
    } else {
      principal = balanceAfterInterest;
    }

    data.push({
      date: nextDate
        .toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        .replace(",", ""),
      debit: debit,
      credit: credit,
      days: days.toFixed(0),
      interest: formatNumber(interest), // Use formatNumber function here
      balance: formatNumber(principal), // Use formatNumber function here
    });

    currentDate = nextDate;
  }

  return data;
}

function displayResult(data, interestRate, borrowerName) {
  const table = document.getElementById("result_table");
  const thead = table.querySelector("thead");

  // Add borrower's name to the top of the table
  const borrowerHeading = document.getElementById("borrower_name_heading");
  if (borrowerHeading) {
    borrowerHeading.textContent = `Borrower: ${borrowerName}`;
    borrowerHeading.style.display = "block"; // Ensure visibility
  } else {
    const newHeading = document.createElement("h3");
    newHeading.id = "borrower_name_heading";
    newHeading.textContent = `Borrower: ${borrowerName}`;
    table.parentElement.insertBefore(newHeading, table);
  }

  // Update the interest rate in the heading
  const interestRateHeading = document.getElementById("interest_rate_heading");
  // Check if the heading exists before trying to update it
  if (interestRateHeading) {
    interestRateHeading.textContent = `Interest @ ${interestRate}%pa (Rs.)`;
  } else {
    console.error("Interest rate heading element not found.");
  }
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  data.forEach((row) => {
    const tr = document.createElement("tr");
    for (const key in row) {
      const td = document.createElement("td");
      td.textContent = row[key];
      td.style.textAlign = key === "days" ? "center" : "right"; // Right-align numerical columns
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });

  table.style.display = "table";

  // Format the balance correctly for the final balance line
  const finalBalance = formatNumber(
    parseFloat(data[data.length - 1].balance.replace(/,/g, ""))
  );
  document.getElementById(
    "final_balance"
  ).textContent = `The Ending Balance as of ${
    data[data.length - 1].date
  } is: Rs. ${finalBalance}`;

  // Adjust output to the viewport
  const outputSection = document.getElementById("output_section");
  const outputHeight = outputSection.getBoundingClientRect().height;
  const viewportHeight = window.innerHeight;

  // Check if output is larger than the viewport
  if (outputHeight > viewportHeight) {
    // Scroll output to the top of the viewport if it exceeds the viewport height
    outputSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    // Push the content above the output upwards to fit the output nicely in the viewport
    outputSection.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}

// Function to scroll to the top
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Show button when user scrolls to the end of output
window.addEventListener("scroll", function () {
  var outputEndMarker = document.getElementById("output_end_marker");
  var goToTopBtn = document.getElementById("goToTopBtn");

  // Get the position of the output_end_marker relative to the viewport
  var markerPosition = outputEndMarker.getBoundingClientRect().top;

  // Check if the marker is visible in the viewport
  if (markerPosition <= window.innerHeight) {
    goToTopBtn.style.display = "block";
  } else {
    goToTopBtn.style.display = "none";
  }
});

function hideOutput() {
  const table = document.getElementById("result_table");
  table.style.display = "none";
  document.getElementById("final_balance").textContent = "";

  const borrowerNameHeading = document.getElementById("borrower_name_heading");
  if (borrowerNameHeading) {
    borrowerNameHeading.style.display = "none";
  }

  const goToTopButton = document.getElementById("goToTopBtn");
  if (goToTopButton) goToTopButton.style.display = "none";
}

document.getElementById("start_date").addEventListener("input", hideOutput);
document.getElementById("end_date").addEventListener("input", hideOutput);
document
  .getElementById("initial_principal")
  .addEventListener("input", hideOutput);
document.getElementById("interest_rate").addEventListener("input", hideOutput);

document
  .getElementById("transactions_container")
  .addEventListener("input", hideOutput);

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", hideOutput);
});

document.getElementById("download_pdf_btn").addEventListener("click", () => {
  const tablealert = document.getElementById("result_table");
  if (
    tablealert.style.display === "none" ||
    !tablealert.querySelector("tbody").hasChildNodes()
  ) {
    alert("Please calculate the balance before downloading the PDF.");
    return;
  }
  const { jsPDF } = window.jspdf;

  // Create a new jsPDF instance with landscape orientation
  const doc = new jsPDF({
    orientation: "landscape", // Set orientation to landscape
    unit: "pt",
    format: "a4",
  });

  // Get the borrower name from the input field
  const borrowerName = document.getElementById("borrower_name").value || "N/A";

  // Add the borrower's name at the top of the PDF, centered and bolded
  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  doc.text(`Borrower: ${borrowerName}`, doc.internal.pageSize.width / 2, 30, {
    align: "center",
  });

  // Get the final balance text
  const finalBalanceText = document.getElementById("final_balance").textContent;

  // Get the table element
  const resultTable = document.getElementById("result_table");

  // Use autoTable to automatically handle table pagination
  doc.autoTable({
    html: resultTable,
    startY: 50, // Start position on the Y-axis
    margin: { top: 50, bottom: 50 },
    theme: "grid",
    styles: {
      overflow: "linebreak", // Enable line breaks
      fontSize: 12,
      cellPadding: 8,
      valign: "middle",
      halign: "right", // Right align table data
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: "center", // Center align table headers
      valign: "middle",
    },
    bodyStyles: {
      valign: "middle", // Vertically center the table data
      cellPadding: 8, // Consistent spacing in the PDF
    },
    columnStyles: {
      0: { cellWidth: "auto", whiteSpace: "nowrap" }, // Date column
      1: { cellWidth: "auto", whiteSpace: "nowrap" }, // Debit column
      2: { cellWidth: "auto", whiteSpace: "nowrap" }, // Credit column
      3: { cellWidth: "auto", whiteSpace: "nowrap" }, // Days column
      4: { cellWidth: 180, whiteSpace: "normal" }, // Interest column
      5: { cellWidth: 180, whiteSpace: "normal" }, // Balance column
    },
    didParseCell: (data) => {
      // Applying background color only if it's a td element
      if (data.section === "body") {
        data.cell.styles.fillColor = "#f0f8ff"; // Apply background color
      }
    },
    showHead: "everyPage",
  });

  // Add the final balance after the table
  const finalY = doc.lastAutoTable.finalY; // Get Y position after the table
  const splitFinalBalanceText = doc.splitTextToSize(
    finalBalanceText,
    doc.internal.pageSize.width - 80
  );
  // Adjust margin at the bottom to prevent cutting off
  if (
    finalY + splitFinalBalanceText.length * 10 + 60 >
    doc.internal.pageSize.height
  ) {
    doc.addPage();
  }
  doc.setFont("Helvetica", "bold"); // Set font to bold
  doc.text(
    splitFinalBalanceText,
    doc.internal.pageSize.width / 2,
    finalY + 40, // Adding more space between the table and final balance line
    {
      align: "center", // Center align the final balance text
    }
  );

  // Save the PDF
  doc.save(`Balance_${borrowerName}.pdf`);
});
