import Credential from "model/credentials";
import { authenticate } from "../shopify.server";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  console.log("Admin authentication response:", admin);
  // Get store details
  const storeResponse = await admin.graphql(
    `#graphql
    {
      shop {
        id
        name
        myshopifyDomain
      }
    }`,
  );

  const storeData = await storeResponse.json();
  console.log(storeData);
  const storeId = storeData.data.shop.myshopifyDomain;
  const baseUrl = new URL(request.url).origin;

  // Check if carrier ID exists in the database
  let details = await Credential.findOne({ store_id: storeId });

  if (!details || !details.carrier_id) {
    console.log("No carrier ID found. Creating new carrier service...");

    // Create a new carrier service
    const response = await admin.graphql(
      `#graphql
  mutation CarrierServiceCreate($input: DeliveryCarrierServiceCreateInput!) {
    carrierServiceCreate(input: $input) {
      carrierService {
        id
        name
        callbackUrl
        active
        supportsServiceDiscovery
      }
      userErrors {
        field
        message
      }
    }
  }`,
      {
        variables: {
          input: {
            name: "Dellyman Shipping",
            callbackUrl: `${baseUrl}/webhooks/dellyman/${details.id}/quotes`,
            supportsServiceDiscovery: true,
            active: true,
          },
        },
      },
    );

    const data = await response.json();
    console.log("Carrier service response:", data);

    if (data.data?.carrierServiceCreate?.carrierService?.id) {
      // Save carrier ID in the database
      details = await Credential.findOneAndUpdate(
        { store_id: storeId },
        { carrier_id: data.data.carrierServiceCreate.carrierService.id },
        { upsert: true, new: true },
      );
    } else {
      throw new Error("Failed to create carrier service.");
    }
  } else {
    console.log("Carrier ID already exists:", details.carrier_id);

    // Update the callback URL if needed
    const updateResponse = await admin.graphql(
      `#graphql
		mutation CarrierServiceUpdate($input: DeliveryCarrierServiceUpdateInput!) {
		  carrierServiceUpdate(input: $input) {
			carrierService {
			  id
			  name
			  callbackUrl
			  active
			}
			userErrors {
			  field
			  message
			}
		  }
		}`,
      {
        variables: {
          input: {
            id: details.carrier_id,
            name: "Dellyman Shipping",
            callbackUrl: `${baseUrl}/webhooks/dellyman/${details.id}/quotes`,
            active: true,
          },
        },
      },
    );

    const updateData = await updateResponse.json();
    console.log("Carrier service update response:", updateData.data);
  }

  return details;
};
