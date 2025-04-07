import type { ActionFunction } from "@remix-run/node";
import Credential from "model/credentials";

export const action: ActionFunction = async ({ params, request }) => {
  const { id } = params;
  const shopifyRequest = await request.json();
  const { origin, destination } = shopifyRequest.rate;
  let details = await Credential.findById(id);
  console.log(details);
  console.log(origin);
  console.log(destination);

  const provinceCodeToName: Record<string, string> = {
    AB: "Abia",
    AD: "Adamawa",
    AK: "Akwa Ibom",
    AN: "Anambra",
    BA: "Bauchi",
    BY: "Bayelsa",
    BE: "Benue",
    BO: "Borno",
    CR: "Cross River",
    DE: "Delta",
    EB: "Ebonyi",
    ED: "Edo",
    EK: "Ekiti",
    EN: "Enugu",
    FC: "FCT",
    GO: "Gombe",
    IM: "Imo",
    JI: "Jigawa",
    KD: "Kaduna",
    KN: "Kano",
    KT: "Katsina",
    KE: "Kebbi",
    KO: "Kogi",
    KW: "Kwara",
    LA: "Lagos",
    NA: "Nasarawa",
    NI: "Niger",
    OG: "Ogun",
    ON: "Ondo",
    OS: "Osun",
    OY: "Oyo",
    PL: "Plateau",
    RI: "Rivers",
    SO: "Sokoto",
    TA: "Taraba",
    YO: "Yobe",
    ZA: "Zamfara",
  };

  let response: any;

  if (origin.province == destination.province) {
    response = await fetch("https://dev.dellyman.com/api/v3.0/GetQuotes", {
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
  } else {
    response = await fetch(
      "https://dev.dellyman.com/api/v3.0/GetInterstateQuote",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${details.api_key}`,
        },
        body: JSON.stringify({
          Vehicle: "Bike (10Kg Max)",
          PackageWeight: 1,
          PickupCity: origin.city,
          PickupState: provinceCodeToName[origin.province] || origin.province,
          PickUpGooglePlaceAddress: `${origin.address1} ${origin.city}`,
          DeliveryGooglePlaceAddress: `${destination.address1} ${destination.city}`,
          DeliveryState:
            provinceCodeToName[destination.province] || destination.province,
          DeliveryCity: destination.city,
          DeliverTo: "receiver",
        }),
      },
    );

    const responseJson = await response.json();

    console.log(responseJson);
    const currentDate = new Date().toISOString();
    const rates = [
      {
        service_name: responseJson?.Name,
        service_code: responseJson?.CompanyID,
        total_price: responseJson?.TotalPrice * 100,
        description: "This is the fastest option by far",
        currency: "NGN",
        min_delivery_date: currentDate,
        max_delivery_date: currentDate,
      },
    ];

    console.log({ rates });
    return { rates };
  }
};
