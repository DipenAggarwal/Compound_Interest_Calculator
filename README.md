# Loan Interest Calculator Web Application

## Overview

The **Loan Interest Calculator Web Application** is a user-friendly tool designed to help users calculate the interest on loans with various features such as handling partial payments, additional lending, and different compounding intervals. The application also provides a feature for generating a well-formatted PDF report of the loan calculations, including detailed transaction history and the final balance.

## Features

- **User Input for Loan Calculations:**
  - Allows users to input various details such as loan amount, interest rate, payment intervals, and more.
  - Users can specify whether interest is compounded half-yearly, quarterly, or without compounding.

- **Dynamic Transaction Management:**
  - Users can add multiple transactions (payments, credits, etc.) and see the effects on the loan balance in real-time.
  - Each transaction box includes a delete option, allowing users to remove transactions easily.

- **Real-Time Calculation and Visualization:**
  - Displays an interactive table showing the detailed breakdown of interest, payments, and the remaining balance.
  - Columns for dates, debit, credit, days, interest, and balance are all dynamically adjusted and responsive.

- **PDF Generation:**
  - Generates a PDF report in landscape format with all calculations, ensuring proper formatting and spacing.
  - Includes borrower name, detailed table of transactions, and the final balance.
  - The PDF is automatically formatted to prevent column wrapping and includes clear spacing between sections.

- **Responsive Design:**
  - The application is fully responsive and works seamlessly across various devices, including desktops, tablets, and mobile phones.
  - Ensures optimal viewing experience with adaptive layouts and elements.

## Usage Instructions

1. **Launching the Application:**
   - Open the `index.html` file in your browser to launch the application.
   
2. **Adding Loan Details:**
   - Enter the loan amount, interest rate, and other details as required.
   - Add transactions such as payments or additional lending in the transaction section.
   
3. **Generating Calculations:**
   - The application will automatically update the loan balance and interest based on your inputs.
   - Use the "Generate PDF" button to download a detailed report of the loan calculations.

4. **Deleting Transactions:**
   - To remove a transaction, click on the delete icon (trash bin) on the top-right corner of the transaction box.
   - The remaining items will adjust automatically.

## Technologies Used

- **HTML5**: For the structure of the web page.
- **CSS3**: For styling the web page, including responsiveness and interactive elements.
- **JavaScript (ES6)**: For dynamic content handling, real-time calculations, and event-driven functionality.
- **Icons8**: For the delete icon used in the transaction boxes.

## Project Structure

- index.html      # Main HTML file that includes the structure of the web application
- script.js       # JavaScript file containing all the dynamic functionalities and event handlers
- styles.css      # CSS file for styling and responsive design
