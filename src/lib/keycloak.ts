const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL!,
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!
};

export default keycloakConfig;
