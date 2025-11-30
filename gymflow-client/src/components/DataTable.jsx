import React from 'react';
import { Table, Box } from '@chakra-ui/react';

const DataTable = ({ columns, data }) => (
  <Box overflowX="auto">
    <Table.Root variant="outline" bg="dark.card">
      <Table.Header>
        <Table.Row>
          {columns.map(col => (
            <Table.ColumnHeader key={col.key} color="brand.400">{col.label}</Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((row, i) => (
          <Table.Row key={i}>
            {columns.map(col => (
              <Table.Cell key={col.key} color="white">{row[col.key]}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  </Box>
);

export default DataTable;
