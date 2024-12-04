import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import { BsCopy } from "react-icons/bs";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import SmallUnderline from "../../component/SmallUnderline";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const getUserTransactions = async () => {
    try {
      const { data } = await API.get("/purchase/get");
      setTransactions(data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleCopy = (paymentId) => {
    navigator.clipboard.writeText(paymentId);
    setCopiedId(paymentId);
    setTimeout(() => setCopiedId(null), 2000); // Reset copied state after 2 seconds
  };

  useEffect(() => {
    getUserTransactions();
  }, []);

  return (
    <div className="p-2 sm:p-4 min-h-screen">
      <h1 className="text-2xl text-center md:text-4xl font-bold text-gray-800 mb-6 relative">
        Transaction History
        <SmallUnderline className={"w-8"} />
      </h1>
      {transactions.length > 0 ? (
        <div className="space-y-4 mt-16">
          {transactions.map((transaction) => (
            <div
              key={transaction.paymentId}
              className="border bg-white border-gray-300 rounded-md p-4 hover:bg-gray-100 transition duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-sm md:text-lg font-semibold text-gray-800">
                  <span className="text-primary">
                    {transaction.purchaseFor}:
                  </span>{" "}
                  {transaction.purchaseFor === "Course"
                    ? transaction.course?.title
                    : transaction.exam?.title}
                </h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    transaction.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.success ? "Successful" : "Failed"}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <strong>Payment ID:</strong> {transaction.paymentId}
                  <button
                    onClick={() => handleCopy(transaction.paymentId)}
                    className="text-primary  hover:bg-green-200 rounded-xl flex items-center gap-2 px-3 py-1 text-xs focus:outline-none"
                  >
                    {copiedId == transaction.paymentId ? (
                      <IoCheckmarkDoneOutline className="text-lg font-bold" />
                    ) : (
                      <BsCopy className="text-sm font-bold" />
                    )}
                    {copiedId === transaction.paymentId ? "Copied!" : "Copy"}
                  </button>
                </p>
                <p>
                  <strong>Amount:</strong> ₹{transaction.amount}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(transaction.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No transactions found.</p>
      )}
    </div>
  );
};

export default Transactions;
