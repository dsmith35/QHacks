import React, {useState} from 'react';
import { Order } from '../api';
import Popup from './popup';
import dayjs from "dayjs";

interface Props {
    order: Order;
  }

  const OrderElement: React.FC<Props> = ({ order }) => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const togglePopup = () => {
      setIsPopupVisible(!isPopupVisible);
    };

    const handleReport = () => {
      // Handle the report action here
      alert(`Report option clicked on order number: ${order.order_number}`);
    };

    return (
      <>
      <tr>
        <td className="py-2 px-4 border-b border-gray-400">
          {order.sender_first_name} {order.sender_last_name}
        </td>
        <td className="py-2 px-4 border-b border-gray-400">
          {order.recipient_first_name} {order.recipient_last_name}
        </td>
        <td className="py-2 px-4 border-b border-gray-400">{dayjs(order.created_at).format('MMMM D, YYYY h:mm A')}</td>
        {order.complete && (
          <td className="py-2 px-4 border-b border-gray-400">
            <div>
              {order.invoice_ready ? (
                <a href={`/invoice/${order.order_number}`} className="text-blue-500 hover:underline">
                  View Invoice
                </a>
              ) : (
                <span>Invoice not ready</span>
              )}
              {order.invoice_paid ? (
                <span className="text-lime-600">&nbsp; ✓ <span className='text-xs'>Paid</span></span>
              ) : (
                <span></span>
              )}
            </div>
          </td>
        )}
        <td className="py-2 px-4 border-b border-gray-400 text-gray-500 font-bold text-xl text-end" onClick={togglePopup}>
          <div className="inline-block cursor-pointer p-2 hover:text-blue-500 hover:bg-gray-200 transition duration-150 ease-in-out">
            &#8801;
          </div>
        </td>

      </tr>
    <Popup
    isVisible={isPopupVisible}
    onClose={togglePopup}
    onReport={handleReport}
    />
    </>
    );
  };
  
  export default OrderElement;