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

  const responseJson = await response.json();

  const company = responseJson.Companies[0];
  const currentDate = new Date().toISOString();

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
