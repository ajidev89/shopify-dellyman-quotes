import type { ActionFunction } from "@remix-run/node";
import Credential from "model/credentials";

export const action: ActionFunction = async ({ params, request }) => {
  const { id } = params;
  const shopifyRequest = await request.json();
  const { origin, destination } = shopifyRequest.rate;
  let details = await Credential.findById(id);
  console.log(details);

  // Fetch shipping rates from external API (Dellyman)
  const response = await fetch("https://dev.dellyman.com/api/v3.0/GetQuotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${details.api_key}`,
    },
    body: JSON.stringify({
      PaymentMode: "online",
      Vehicle: "Bike (10Kg Max)",
      IsInstantDelivery: 0,
      PickupRequestedTime: "08:00 AM to 05:00 PM",
      IsProductOrder: 0,
      ProductAmount: "2000",
      PickupRequestedDate: "",
      PickupAddress: `${origin.address1} ${origin.city}`,
      DeliveryAddress: [`${destination.address1} ${destination.city}`],
    }),
  });

  // {
  //   18:48:16 │                     remix │   ResponseCode: 100,
  //   18:48:16 │                     remix │   ResponseMessage: 'Success',
  //   18:48:16 │                     remix │   Companies: [
  //   18:48:16 │                     remix │     {
  //   18:48:16 │                     remix │       CompanyID: 643,
  //   18:48:16 │                     remix │       Name: 'Delly Logistics Africa Ltd',
  //   18:48:16 │                     remix │       TotalPrice: 1725,
  //   18:48:16 │                     remix │       OriginalPrice: 1725,
  //   18:48:16 │                     remix │       PayableAmount: 1725,
  //   18:48:16 │                     remix │       SavedPrice: 0,
  //   18:48:16 │                     remix │       SameDayPrice: 1725,
  //   18:48:16 │                     remix │       DeductablePrice: 1725,
  //   18:48:16 │                     remix │       AvgRating: 5,
  //   18:48:16 │                     remix │       NumberOfOrders: 299,
  //   18:48:16 │                     remix │       NumberOfRating: 3
  //   18:48:16 │                     remix │     }
  //   18:48:16 │                     remix │   ],

  const responseJson = await response.json();

  const company = responseJson.Companies[0];
  const currentDate = new Date().toISOString();

  //   if (!response.ok) {
  //     return json({ error: "Failed to fetch shipping rates" }, { status: 500 });
  //   }

  //   const rates = await response.json();

  //   // Map API response to Shopify format
  //   const formattedRates = rates.map((rate) => ({
  //     service_name: rate.name,
  //     service_code: rate.code,
  //     total_price: rate.price * 100, // Convert to cents
  //     currency: "USD",
  //     min_delivery_date: rate.estimated_min,
  //     max_delivery_date: rate.estimated_max,
  //   }));

  const rates = [
    {
      service_name: company.Name,
      service_code: company.CompanyID,
      total_price: company.TotalPrice * 100,
      description: "This is the fastest option by far",
      currency: "NGN",
      min_delivery_date: currentDate,
      max_delivery_date: currentDate,
    },
  ];
  console.log({ rates });

  return { rates };
};
