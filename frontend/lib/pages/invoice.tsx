import React, { useState } from "react";
import InvoiceSection from "../components/invoice-section";
import { useParams } from "react-router-dom";
import { Invoice, useApi } from "../api";
import { get } from "http";

function InvoicePage() {
  const { orderNum } = useParams<{ orderNum: string }>();
  const [invoiceData, setInvoiceData] = useState<Invoice>() 
  const { updateOrderComplete } = useApi();

  const handleInvoiceLoad = (invoice: any) => {
    setInvoiceData(invoice)
  };

  const handlePay = async () => {
    if (!invoiceData) return;

    try {
      // Make an API call to update the order's `isPaid` flag
      await updateOrderComplete(invoiceData.order_number, true);

      // Optionally update local state to reflect changes
      setInvoiceData({
        ...invoiceData,
        invoice_paid: true,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("There was an error processing the payment. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg border-none">
      <InvoiceSection orderNum={orderNum} onInvoiceLoad={handleInvoiceLoad} />
      {(!!invoiceData) && (
        <div className="flex justify-center mt-8">
          {invoiceData.invoice_paid ? (
            <p className="text-lime-600">
              This invoice has been paid.
              </p>
          ) : (
            <button 
            onClick={handlePay}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
              Pay
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default InvoicePage;

