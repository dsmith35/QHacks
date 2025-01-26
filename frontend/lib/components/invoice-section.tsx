import React, { useState, useEffect } from 'react';
import { Invoice, useApi } from "../api";
import { FullScreenLoading } from "./full-screen-loading";

interface Props {
  orderNum: string;
  onInvoiceLoad: (invoice: Invoice | null) => void;
}

const InvoiceSection: React.FC<Props> = ({ orderNum, onInvoiceLoad }) => {
  const [rawInvoiceData, setRawInvoiceData] = useState<Invoice | null | false>(null);
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const { getInvoice, getUserData } = useApi();
  
  useEffect(() => {
    const fetchInvoice = async () => {
      setInitialLoading(true);
      try {
        const invoice = await getInvoice(orderNum);
        setRawInvoiceData(invoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      }
    };

    fetchInvoice();
  }, [orderNum]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (rawInvoiceData) {
        try {
          const senderData = await getUserData(rawInvoiceData.sender);
          const userData = await getUserData(rawInvoiceData.recipient);
          const invoiceWithUserNames = {
            ...rawInvoiceData,
            sender_first_name: senderData.first_name,
            sender_last_name: senderData.last_name,
            recipient_first_name: userData.first_name,
            recipient_last_name: userData.last_name,
          };
          setInvoiceData(invoiceWithUserNames);
          onInvoiceLoad(invoiceWithUserNames); // Notify parent component
        } catch (error) {
          console.error('Error fetching user data for invoice', error);
        }
      }
    };

    if (rawInvoiceData === false) {
      setInitialLoading(false);
    } else {
      fetchUserNames();
    }
  }, [rawInvoiceData]);

  useEffect(() => {
    if (invoiceData) {
      setInitialLoading(false);
    }
  }, [invoiceData]);

  if (initialLoading) {
    return <FullScreenLoading />;
  }

  return (
    <div>
      {invoiceData ? (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Invoice</h1>
            <div className="text-gray-600">Order Number: {invoiceData.order_number}</div>
          </div>
          <div className="mb-6">
            <div className="mb-4">
              <strong>Sender:</strong> {invoiceData.sender_first_name} {invoiceData.sender_last_name}
            </div>
            <div>
              <strong>Recipient:</strong> {invoiceData.recipient_first_name} {invoiceData.recipient_last_name}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Items:</h3>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Description</th>
                  <th className="py-2 px-4 border-b text-left">Quantity</th>
                  <th className="py-2 px-4 border-b text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b text-left">{item.description}</td>
                    <td className="py-2 px-4 border-b text-left">{item.quantity}</td>
                    <td className="py-2 px-4 border-b text-left">{item.price}</td>
                  </tr>
                ))}
                <tr className="border-t-4 border-gray-400">
                  <td colSpan={2} className="py-2 px-4 border-b text-right font-semibold">Total:</td>
                  <td className="py-2 px-4 border-b text-left font-semibold">${invoiceData.total_cost}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-600">Thank you for your business!</p>
          </div>
        </div>
      ) : (
        <p>Invoice not available</p>
      )}
    </div>
  );
}

export default InvoiceSection;
