// Retrieve the transactions from localStorage, or initialize an empty array if none exists
const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Formatter for currency display in INR with a positive or negative sign
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "INR",
  signDisplay: "always",
});

// Get references to UI elements
const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

// Add event listener to handle form submission
form.addEventListener("submit", addTransaction);

// Function to update the total income, expense, and balance on the UI
function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0); // Calculate total income

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0); // Calculate total expense

  const balanceTotal = incomeTotal - expenseTotal; // Calculate balance

  // Display the calculated values in the UI
  balance.textContent = formatter.format(balanceTotal).substring(1); // Remove INR symbol for balance
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1); // Display expense as a negative value
}

// Function to render the list of transactions in the UI
function renderList() {
  list.innerHTML = ""; // Clear the list

  status.textContent = "";
  if (transactions.length === 0) {
    // Display message if there are no transactions
    status.textContent = "No transactions.";
    return;
  }

  // Loop through each transaction and create list items
  transactions.forEach(({ id, name, amount, date, type }) => {
    const sign = type === "income" ? 1 : -1; // Determine sign based on transaction type

    const li = document.createElement("li");

    // Set up HTML content for each transaction list item
    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;

    list.appendChild(li); // Append each transaction to the list
  });
}

// Initial render of transaction list and update of totals
renderList();
updateTotal();

// Function to delete a transaction by its ID
function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id); // Find transaction by ID
  transactions.splice(index, 1); // Remove the transaction from the array

  updateTotal(); // Update totals
  saveTransactions(); // Save updated transactions to localStorage
  renderList(); // Re-render the transaction list
}

// Function to add a new transaction from form data
function addTransaction(e) {
  e.preventDefault(); // Prevent page reload on form submission

  const formData = new FormData(this); // Collect form data

  // Add new transaction object to transactions array
  transactions.push({
    id: transactions.length + 1, // Generate ID
    name: formData.get("name"), // Get name from form data
    amount: parseFloat(formData.get("amount")), // Convert amount to a number
    date: new Date(formData.get("date")), // Get date and convert to Date object
    type: formData.get("type") === "on" ? "income" : "expense", // Determine type based on input
  });

  this.reset(); // Clear the form fields

  updateTotal(); // Update totals
  saveTransactions(); // Save transactions to localStorage
  renderList(); // Re-render the list with the new transaction
}

// Function to save transactions to localStorage
function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort transactions by date (newest first)
  localStorage.setItem("transactions", JSON.stringify(transactions)); // Store in localStorage
}
