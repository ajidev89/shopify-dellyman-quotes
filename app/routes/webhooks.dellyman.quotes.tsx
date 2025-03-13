import type { ActionFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: ActionFunctionArgs) => {
  const shopifyRequest = await request.json();
  const { origin, destination, items } = shopifyRequest.rate;
  console.log(origin);
  console.log(destination);
  console.log(items);

  //   // Fetch shipping rates from external API (Dellyman)
  //   const response = await fetch("https://api.dellyman.com/shipping/rates", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ origin, destination, items }),
  //   });

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

  return new Response("Quotes created", { status: 200 });
};
