import React from 'react';
import { Button } from '@mantine/core';
import { Card, Group, Stack, Title } from '@mantine/core';

const MantineThemeTest = () => {
  console.log('Mantine theme test component loaded');

  return (
    <Stack p="md" gap="lg">
      <Title order={2}>Mantine Theme Test</Title>
      
      <Group>
        <Button variant="filled">Filled Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="light">Light Button</Button>
        <Button variant="subtle">Subtle Button</Button>
      </Group>

      <Card mt="lg" shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3}>Mantine Theme Card</Title>
        <p>This is a card using the Mantine theme.</p>
      </Card>

      <Group mt="lg">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button size="xl">Extra Large</Button>
      </Group>
    </Stack>
  );
};

export default MantineThemeTest;