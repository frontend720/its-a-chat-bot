import React from "react";
import styled from "styled-components";

const ChatSegment = styled.p`
  margin-top: 5px;
  margin-bottom: 10px !important;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem; /* Slightly smaller text fits chat better */
  background-color: var(--table-bg);
  color: var(--table-text);
`;

const TableHeader = styled.th`
  background-color: #dee1ec75;
  font-weight: 600;
  text-align: left;
  padding: 6px 6px;
  border-bottom: 1px solid var(--table-border);
  white-space: nowrap;
  margin-bottom: 15px !important
  
`;

const Head = styled.thead`
  border-radius: 16px;
  margin-bottom: 20px !important;
`;

const TableData = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid var(--table-border);
  line-height: 1.5;
`;

export { ChatSegment, Table, TableHeader, TableData, Head };
