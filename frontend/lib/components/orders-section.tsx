import React, { useEffect, useState } from 'react';
import OrderElement from './order-element';
import { Order, useApi } from "../api";
import { FullScreenLoading } from "./full-screen-loading";
import { Link } from 'react-router-dom';

const OrderSection = () => {
  const [rawOrderData, setRawOrderData] = useState<Order[] | null>(null);
  const [orderData, setOrderData] = useState<Order[] |null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true); // Set initial loading to true
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { getOrders, getUserData, getIsAuthenticated } = useApi();

  useEffect(() => {
    const fetchOrders = async () => {
      setInitialLoading(true); // Start initial loading
      try {
        const orders = await getOrders();
        setRawOrderData(orders);
        const isAuth = await getIsAuthenticated();
        setIsAuthenticated(isAuth)
      } catch (error) {
        console.error('Error fetching orders:', error);
      } 
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (rawOrderData) {
        try {
          const ordersWithUserData = await Promise.all(
            rawOrderData.map(async (order) => {
              const senderData = await getUserData(order.sender);
              const recipientData = await getUserData(order.recipient);
              return {
                ...order,
                sender_first_name: senderData.first_name,
                sender_last_name: senderData.last_name,
                recipient_first_name: recipientData.first_name,
                recipient_last_name: recipientData.last_name,
              };
            })
          );
          setOrderData(ordersWithUserData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserNames();
  }, [rawOrderData]);

  useEffect(() => {
    if (orderData != null) {
      setInitialLoading(false);
    }
  }, [orderData]);


  if (initialLoading) {
    return <FullScreenLoading />;
  }

  const currentOrders = orderData ? orderData.filter(item => !item.complete) : [];
  const pastOrders = orderData ? orderData.filter(item => item.complete) : [];

  return (
    <div>
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg border border-gray-400 border-b">
          <h1 className="text-3xl font-bold mb-4">Orders</h1>
          {orderData.length > 0 ? (
          <div>
          {/* current orders */}
          {currentOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Current Orders</h2>
              <table className="min-w-full bg-white border border-gray-400">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-400 text-left">Sender</th>
                    <th className="py-2 px-4 border-b border-gray-400 text-left">Recipient</th>
                    <th className="py-2 px-4 border-b border-gray-400 text-left">Created At</th>
                    <th className="py-2 px-4 border-b border-gray-400 text-end"></th>
                  </tr>
                </thead>
                <tbody className='border-b border-gray-400'>
                  {currentOrders.map((order) => (
                    <OrderElement key={order.created_at} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <br/>
          {/* past orders */}
          {pastOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Past Orders</h2>
            <table className="min-w-full bg-white border border-gray-400">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-400 text-left">Sender</th>
                  <th className="py-2 px-4 border-b border-gray-400 text-left">Recipient</th>
                  <th className="py-2 px-4 border-b border-gray-400 text-left">Created At</th>
                  <th className="py-2 px-4 border-b border-gray-400 text-left">Invoice</th>
                  <th className="py-2 px-4 border-b border-gray-400 text-end"></th>
                </tr>
              </thead>
              <tbody className='border-b border-gray-400'>
                {pastOrders.map((order) => (
                  <OrderElement key={order.created_at} order={order} />
                ))}
              </tbody>
            </table>
          </div>
          )}
          </div>
          ) : (isAuthenticated) ? ( 
            <p>You haven't made any orders.</p>
          ) : (
            <p><Link to="/log-in" className="text-blue-600 hover:underline">Log in</Link> to view your orders.</p>
          )}
        </div>
    </div>
  );
};

export default OrderSection;