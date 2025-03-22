import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  FormLayout,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Link,
  TextField,
  Form,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

import axios from "axios";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
    {
      shop {
        id
        name
        myshopifyDomain
      }
    }`,
  );

  const storeData = await response.json();

  return {
    shopDomain: storeData.data.shop.myshopifyDomain, // Store's domain
  };
};

export default function Index() {
  const shopify = useAppBridge();
  const { shopDomain } = useLoaderData<typeof loader>();
  const [apiKey, setApiKey] = useState<string>("");
  const [webhook, setWebhook] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  const saveCredentials = async () => {
    try {
      await axios.post(
        "/api/save-credentials",
        {
          store_id: shopDomain,
          webhook_secret: webhook,
          api_key: apiKey,
          webhook_url: `/webhooks/dellyman-api/${shopDomain}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      fetchCredentials();

      shopify.toast.show("Credentials saved", {
        duration: 5000,
      });
    } catch (error: any) {
      console.error(error.response?.data || error.message);
    }
  };

  const fetchCredentials = async () => {
    const credentials = await axios.get("/api/save-credentials", {
      params: { store_id: shopDomain },
    });
    setApiKey(credentials.data.details.api_key ?? "");
    setWebhook(credentials.data.details.webhook_secret ?? "");
    setWebhookUrl(credentials.data.details.webhook_url ?? "");
  };

  const createCarrierService = async () => {
    fetch("/api/create-carrier", {
      method: "POST",
      body: JSON.stringify({}),
    });
  };

  useEffect(() => {
    createCarrierService();
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, []);

  return (
    <Page>
      <TitleBar title="Connect with dellyman"></TitleBar>
      <BlockStack>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Here you can place your API Credentials and set web hook url{" "}
                    <Link url="https://dellyman.com/settings">
                      Find them here.
                    </Link>
                    To be able send orders from your e-commerce website to our
                    server.
                  </Text>
                  <Form
                    method="post"
                    preventDefault={true}
                    onSubmit={saveCredentials}
                  >
                    <FormLayout>
                      <TextField
                        value={apiKey}
                        label="API Ke"
                        onChange={(value) => setApiKey(value)}
                        autoComplete="off"
                      />
                      <TextField
                        value={webhook}
                        type="text"
                        label="Web-Hook secret"
                        onChange={(value) => setWebhook(value)}
                        autoComplete="off"
                      />
                      <TextField
                        value={webhookUrl}
                        type="text"
                        label="Webhook Url"
                        onChange={(value) => setWebhookUrl(value)}
                        autoComplete="off"
                        disabled={true}
                      />
                      <Button loading={false} submit={true}>
                        Save Credentials
                      </Button>
                    </FormLayout>
                  </Form>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
