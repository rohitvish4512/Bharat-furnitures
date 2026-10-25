/**
 * WhatsApp Helper for Bharat Furnitures
 * Generates formatted WhatsApp messages in English for all order statuses (Placed, Confirmed, Shipped, Delivered)
 * and opens WhatsApp Web / App directly to customer phone with 1-click.
 */

export const getOrderStatusWhatsAppMessage = (order, targetStatus = null) => {
  const status = targetStatus || order?.orderStatus || 'Placed';
  const customerName = order?.customer?.fullName || 'Customer';
  const orderId = order?.orderId || order?.id || 'BF-ORDER';
  const totalAmount = (order?.totalAmount || 0).toLocaleString('en-IN');
  const deliveryTiming = order?.estimatedDeliveryDate 
    ? `Within 2 Days (${order.estimatedDeliveryDate})` 
    : 'Within 2-3 Business Days';
  const trackingUrl = `${window.location.origin}/orders`;

  // Item summary
  const itemNames = order?.items?.map(i => `• ${i.name} (Qty: ${i.quantity})`).join('\n') || '';

  let headerEmoji = '📦';
  let statusHeading = 'Order Placed Successfully';
  let statusDescription = 'Thank you for your order! We have received it and our team is preparing it for fulfillment.';

  switch (status) {
    case 'Confirmed':
      headerEmoji = '✅';
      statusHeading = 'Order Confirmed';
      statusDescription = 'Your furniture order has been verified and confirmed. It is currently being prepared for dispatch at our warehouse.';
      break;
    case 'Shipped':
      headerEmoji = '🚚';
      statusHeading = 'Order Dispatched / Shipped';
      statusDescription = 'Great news! Your furniture order has been dispatched and is on its way to your delivery address.';
      break;
    case 'Out for Delivery':
      headerEmoji = '🛵';
      statusHeading = 'Out for Delivery';
      statusDescription = 'Your furniture order is out for delivery today! Please keep your phone reachable for delivery coordination.';
      break;
    case 'Delivered':
      headerEmoji = '🎉';
      statusHeading = 'Order Delivered Successfully';
      statusDescription = 'Your furniture order has been delivered! We hope you love your new furniture. Thank you for shopping with Bharat Furnitures!';
      break;
    case 'Cancelled':
      headerEmoji = '❌';
      statusHeading = 'Order Cancelled';
      statusDescription = 'Your order has been cancelled as requested. If you have any questions, please reach out to our support team.';
      break;
    default:
      headerEmoji = '📦';
      statusHeading = 'Order Received';
      statusDescription = 'We have received your order details and processing will begin shortly.';
  }

  const message = `*Hello ${customerName},* 👋
${headerEmoji} *Your Bharat Furnitures order is ${statusHeading}!*

━━━━━━━━━━━━━━━━━━━━
🆔 *Order ID:* ${orderId}
📊 *Current Status:* ${status.toUpperCase()}
💰 *Total Amount:* ₹${totalAmount}
⏱️ *Estimated Delivery:* ${deliveryTiming}
${itemNames ? `\n🛋️ *Ordered Items:*\n${itemNames}\n` : ''}━━━━━━━━━━━━━━━━━━━━
📍 *Delivery Address:*
${order?.customer?.address || ''}, ${order?.customer?.city || ''} (${order?.customer?.pincode || ''})

🔗 *Live Order Tracking:*
${trackingUrl}

${statusDescription}

If you have any questions regarding your order, feel free to reply directly to this message.

*Warm regards,*
*Team Bharat Furnitures* 🪑✨`;

  return message;
};

/**
 * Opens WhatsApp chat with customer pre-filled with the order update message in English
 */
export const sendWhatsAppUpdate = (order, targetStatus = null) => {
  let phone = (order?.customer?.phone || '').replace(/\D/g, '');
  if (!phone) {
    alert('Customer phone number not found!');
    return;
  }

  // Prepend India country code if not present
  if (phone.length === 10) {
    phone = '91' + phone;
  } else if (phone.length === 12 && phone.startsWith('91')) {
    // already has 91
  }

  const message = getOrderStatusWhatsAppMessage(order, targetStatus);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
};
