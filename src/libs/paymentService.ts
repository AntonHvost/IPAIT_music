const YooKassa = require('yookassa');

const yooKassa = new YooKassa({
    shopId: process.env.YOO_SHOP_ID ?? '',
    secretKey: process.env.YOO_SECRET_KEY ?? '',
});

async function PaymentService(){
    const payment = await yooKassa.createPayment({
      amount: {
        value: "2.00",
        currency: "RUB"
      },
      payment_method_data: {
          type: "bank_card"
      },
      confirmation: {
        type: "redirect",
        return_url: "https://www.merchant-website.com/return_url"
      },
      description: "Заказ №73"
  });
    return payment;
}

export default PaymentService