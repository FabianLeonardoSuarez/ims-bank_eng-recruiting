import React, { useEffect, useState } from "react";
import "./Bank.css";

const CustomerTable = ({ data }) => {
  const [dataTable, setDataTable] = useState(data);
  const headers = Object.keys(dataTable[0]).map((title, index) => (
    <th onClick={() => handleFilterClick(title)} key={index}>
      {title}
    </th>
  ));

  const handleFilterClick = (filter) => {
    console.log(filter);
  };

  const tablerows = dataTable.map((row, index) => (
    <tr key={"row" + index}>
      {Object.keys(row).map((field) => (
        <td key={field + index}>{row[field]}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{tablerows}</tbody>
    </table>
  );
};

export const Bank = () => {
  const URLTRANSACTIONS =
    "https://quietstreamfinancial.github.io/eng-recruiting/transactions.json";
  const CHECKINGTYPE = "checking";
  const SAVINGSTYPE = "savings";
  const [CustomerList, setCustomerList] = useState([]);
  const [Loading, setLoading] = useState(true);

  const formatMoney = (value) => {
    return value == 0 ? "$ 0.00" : "$ " + value.toFixed(2);
  };

  const FilterByCustomer = (data) => {
    let customernameList = new Set(
      data.map(({ customer_name }) => customer_name)
    );
    let prevcustomerList = [];

    customernameList.forEach((customer) => {
      const customerTransactions = data
        .filter((tran) => tran.customer_name == customer)
        .sort((rowa, rowb) => {
          return new Date(rowb.date) - new Date(rowa.date);
        });

      const LastTransaction = new Date(customerTransactions[0].date)
        .toISOString()
        .slice(0, 19)
        .replace(/-/g, "/")
        .replace("T", " ");

      const CheckingTransList = customerTransactions.filter(
        (transaction) => transaction.account_type == CHECKINGTYPE
      );
      const TotalChecking =
        CheckingTransList.length == 0
          ? 0
          : CheckingTransList.map(({ transaction_amount }) =>
              Number(transaction_amount.replace(/[$,]+/g, ""))
            ).reduce((total, amount) => total + amount);

      const SavingsTransList = customerTransactions.filter(
        (transaction) => transaction.account_type == SAVINGSTYPE
      );
      const TotalSavings =
        SavingsTransList.length == 0
          ? 0
          : SavingsTransList.map(({ transaction_amount }) =>
              Number(transaction_amount.replace(/[$,]+/g, ""))
            ).reduce((total, amount) => total + amount);

      const TotalBalance = TotalChecking + TotalSavings;

      prevcustomerList.push({
        Name: customer,
        "Last Transaction": LastTransaction,
        "Total Checking": formatMoney(TotalChecking),
        "Total Savings": formatMoney(TotalSavings),
        "Total Balance": formatMoney(TotalBalance),
      });
    });
    setCustomerList(prevcustomerList);
    setLoading(false);
  };

  useEffect(() => {
    fetch(URLTRANSACTIONS)
      .then((response) => response.json())
      .then((data) => FilterByCustomer(data));
  }, []);
  return (
    <section>
      <SearchBar />
      {Loading ? (
        <p>Loading Data ...</p>
      ) : (
        <CustomerTable data={CustomerList} />
      )}
    </section>
  );
};

const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  return (
    <div className="searchBar">
      <div className="labelBox">
        <span>Check Transactions</span>
      </div>
      <input
        type="text"
        onChange={(event) => setSearchInput(event.target.value)}
        value={searchInput}
        placeholder="Customer Name"
      />
    </div>
  );
};
