import { Outlet } from '@tanstack/react-router';
import { Stack, Heading, Text } from '@canva/app-ui-kit';

export const RootLayout = (): JSX.Element => {
  return (
    <Stack space="4" padding="4">
      <Stack space="1">
        <Heading size="3">SkyPilot Console (Web)</Heading>
        <Text tone="secondary">
          Experimental React + TanStack Router + XState interface powered by the existing SkyPilot toolchain.
        </Text>
      </Stack>
      <Outlet />
    </Stack>
  );
};
